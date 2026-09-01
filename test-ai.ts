import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import * as fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.+)/);
if (match) {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = match[1].trim();
}

const projectAiSchema = z.object({
  title: z.string().describe("A concise, professional title for the project."),
  slug: z.string().describe("URL-friendly slug generated from the title (lowercase, hyphenated)."),
  client: z.string().optional().describe("The name of the client, if mentioned."),
  role: z.string().describe("The user's role in the project (e.g., 'Lead Frontend Engineer')."),
  tech_stack: z.array(z.string()).describe("An array of technologies used."),
  year: z.number().describe("The year the project was completed."),
  description: z.string().max(500).describe("A professional, technical summary of the project. Max 500 characters.")
});

async function run(modelName: string) {
  try {
    console.log(`Testing ${modelName}...`);
    const { object } = await generateObject({
      model: google(modelName),
      system: `You are an expert technical project manager and copywriter for a high-end digital agency called Anugerah Ventures.
Your task is to take a rough draft or bullet points about a project and extract/infer all the necessary structured fields to populate a CMS.

CRITICAL RULES:
1. MAX 500 CHARACTERS for the description.
2. PLAIN TEXT ONLY in the description. NO markdown, NO bolding (**), NO bullet points, NO HTML.
3. Tone: Professional, technical, and objective.
4. Language: Match the language of the user's input for the description.
5. Tech Stack: Extract all mentioned technologies into an array of strings.
6. Year: Extract the year if mentioned, otherwise use the current year.
7. Output strictly as JSON. No markdown blocks, no extra text.`,
      prompt: `Here is the rough draft of the project:\n---\nCompro & Web App for a local haircut studio with several branch named "Tangwin Cut". The web app is a reservation system with basic accounting dashboard, Payroll, attendance module , and Full CMS.\n---\nPlease generate the structured data now.`,
      schema: projectAiSchema,
    });
    console.log(`SUCCESS [${modelName}]:`, object);
  } catch (e: any) {
    console.error(`ERROR [${modelName}]:`, e.message);
  }
}

async function main() {
  await run('gemini-3.7-flash');
  await run('gemini-2.5-flash');
}
main();
