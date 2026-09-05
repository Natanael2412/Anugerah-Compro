import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

  // ── Parse Payload ────────────────────────────────────────
  let payload: { filename?: string; filetype?: string; folder?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { filename, filetype, folder = "cms/uploads" } = payload;

  if (!filename || !filetype) {
    return NextResponse.json({ error: "Missing filename or filetype" }, { status: 400 });
  }

  if (!filetype.startsWith("video/")) {
    return NextResponse.json({ error: "Only video files are allowed via this endpoint" }, { status: 400 });
  }

  // ── Generate Presigned URL ───────────────────────────────
  const timestamp = Date.now();
  const baseName = filename.replace(/\.[^.]+$/, "").replace(/\s+/g, "-");
  
  // Use the exact original extension if possible (or default to .mp4)
  const extensionMatch = filename.match(/\.[0-9a-z]+$/i);
  const extension = extensionMatch ? extensionMatch[0].toLowerCase() : ".mp4";
  
  const key = `${folder}/${timestamp}-${baseName}${extension}`;
  const bucket = process.env.R2_BUCKET_NAME ?? "anugerah-ventures";

  try {
    const r2 = getR2Client();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: filetype,
    });

    // Create a presigned URL valid for 3600 seconds (1 hour)
    const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
    const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
    const publicUrl = `${baseUrl}/${key}`;

    return NextResponse.json({
      presignedUrl,
      publicUrl,
      path: key,
      bucket,
    });
  } catch (err) {
    console.error("[upload-video-url] R2 presigner error:", err);
    return NextResponse.json({ error: "Failed to generate presigned URL" }, { status: 500 });
  }
}
