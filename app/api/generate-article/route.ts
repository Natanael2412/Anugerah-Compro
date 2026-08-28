import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const articleSchema = z.object({
  title: z.string(),
  contentHtml: z.string().describe("Fully formatted HTML string compatible with TipTap (h2, h3, p, strong, ul, li)."),
  excerpt: z.string().max(160).describe("A compelling SEO meta description."),
  tags: z.string().describe("Comma-separated SEO keywords.")
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: articleSchema,
      prompt: `Write a comprehensive, professional article based on the following prompt:\n\n${prompt}`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("[generate-article] Error:", error);
    return NextResponse.json({ error: "Failed to generate article" }, { status: 500 });
  }
}
