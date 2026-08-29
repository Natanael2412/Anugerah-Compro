import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const projectAiSchema = z.object({
  title: z.string().describe("A concise, professional title for the project."),
  slug: z.string().describe("URL-friendly slug generated from the title (lowercase, hyphenated)."),
  client: z.string().optional().describe("The name of the client, if mentioned."),
  role: z.string().describe("The user's role in the project (e.g., 'Lead Frontend Engineer', 'Fullstack Developer'). Default to 'Interactive Web Engineer' if unspecified."),
  tech_stack: z.array(z.string()).describe("An array of technologies used (e.g., ['Next.js', 'Tailwind CSS', 'Supabase'])."),
  year: z.number().describe("The year the project was completed (e.g., 2024). Default to current year if unspecified."),
  description: z.string().max(500).describe("A professional, technical summary of the project. Must be plain text, NO markdown, NO bullet points, max 500 characters.")
});

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

    const result = await generateObject({
      model,
      schema: projectAiSchema,
      system: `You are an expert technical project manager and copywriter for a high-end digital agency called Anugerah Ventures.
Your task is to take a rough draft or bullet points about a project and extract/infer all the necessary structured fields to populate a CMS.

CRITICAL RULES:
1. MAX 500 CHARACTERS for the description.
2. PLAIN TEXT ONLY in the description. NO markdown, NO bolding (**), NO bullet points, NO HTML.
3. Tone: Professional, technical, and objective.
4. Language: Match the language of the user's input for the description (usually Indonesian or English).
5. Tech Stack: Extract all mentioned technologies into an array of strings.
6. Year: Extract the year if mentioned, otherwise use the current year.`,
      prompt: `Here is the rough draft of the project:
---
${prompt}
---
Please generate the structured data now.`,
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[generate-project-data] Error:", error);
    return new Response(error.message || "Failed to generate project data", { status: 500 });
  }
}
