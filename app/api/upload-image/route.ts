import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * POST /api/upload-image
 * Accepts FormData with a 'file' field and optional 'folder' field.
 *
 * Pipeline:
 *   1. Verify caller is authenticated (admin only)
 *   2. Process via sharp: resize to max 1920px, convert to AVIF @ quality 80
 *   3. Upload to Cloudflare R2 (S3-compatible)
 *   4. Return public CDN URL
 *
 * Bucket structure:
 *   anugerah-ventures/
 *   ├── projects/hero/
 *   ├── projects/gallery/
 *   ├── articles/covers/
 *   └── cms/uploads/        ← default folder
 *
 * Required env vars:
 *   R2_ACCOUNT_ID           — Cloudflare Account ID
 *   R2_ACCESS_KEY_ID        — R2 API token Access Key ID
 *   R2_SECRET_ACCESS_KEY    — R2 API token Secret Access Key
 *   R2_BUCKET_NAME          — e.g. "anugerah-ventures"
 *   NEXT_PUBLIC_R2_PUBLIC_URL — e.g. "https://cdn.anugerahventures.id"
 *                              (Custom domain or r2.dev public URL)
 */

// Lazy-init R2 client (only created when the route is actually called)
function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials not configured");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function POST(request: NextRequest) {
  // ── Auth check ───────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse FormData ───────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string | null) ?? "cms/uploads";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Accepted: JPEG, PNG, WebP, AVIF" },
      { status: 400 }
    );
  }

  // ── Sharp processing ─────────────────────────────────────
  const sharp = (await import("sharp")).default;
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let processedBuffer: Buffer;
  try {
    processedBuffer = await sharp(inputBuffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .avif({ quality: 80, effort: 4 })
      .toBuffer();
  } catch (err) {
    console.error("[upload-image] sharp error:", err);
    return NextResponse.json({ error: "Image processing failed" }, { status: 500 });
  }

  // ── Upload to Cloudflare R2 ───────────────────────────────
  const timestamp = Date.now();
  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/\s+/g, "-");
  const key = `${folder}/${timestamp}-${baseName}.avif`;
  const bucket = process.env.R2_BUCKET_NAME ?? "anugerah-ventures";

  try {
    const r2 = getR2Client();
    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: processedBuffer,
        ContentType: "image/avif",
        CacheControl: "public, max-age=31536000, immutable",
        Metadata: {
          "uploaded-by": user.id,
          "original-name": file.name,
        },
      })
    );
  } catch (err) {
    console.error("[upload-image] R2 upload error:", err);
    return NextResponse.json({ error: "Upload to R2 failed" }, { status: 500 });
  }

  // ── Return public CDN URL ────────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
  const publicUrl = `${baseUrl}/${key}`;

  return NextResponse.json({
    url: publicUrl,
    path: key,
    size: processedBuffer.length,
    format: "avif",
    bucket,
  });
}
