import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return new Response("Missing GOOGLE_GENERATIVE_AI_API_KEY", { status: 500 });
    }

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    const model = google('gemini-1.5-flash');

    const result = await generateText({
      model,
      system: `You are an expert technical copywriter for a high-end digital agency called Anugerah Ventures.
Your task is to take a rough draft or bullet points about a project and rewrite it into a highly professional, concise, and technical summary.

CRITICAL RULES:
1. MAX 500 CHARACTERS. Your response MUST be under 500 characters.
2. PLAIN TEXT ONLY. NO markdown, NO bolding (**), NO bullet points, NO HTML. Just a single paragraph of plain text.
3. Tone: Professional, technical, and objective (e.g., "A modern e-commerce platform built with Next.js...").
4. Language: Match the language of the user's input (usually Indonesian or English).
5. Output ONLY the generated text, nothing else.`,
      prompt: `Here is the rough draft of the project:
---
${prompt}
---
Please write the final description now.`,
    });

    return new Response(result.text, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: any) {
    console.error("[generate-project-desc] Error:", error);
    return new Response(error.message || "Failed to generate description", { status: 500 });
  }
}
