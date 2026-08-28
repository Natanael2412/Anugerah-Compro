import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return new Response("Missing GOOGLE_GENERATIVE_AI_API_KEY", { status: 500 });
    }

    // Determine if we should use 1.5-flash or others. 
    // We can just hardcode gemini-1.5-flash for the chat as it's very fast and reliable for text chatting.
    const model = google('gemini-1.5-flash');

    const result = await streamText({
      model,
      system: `You are an expert Article Brainstorming Co-Pilot for a high-end digital agency. 
Your goal is to help the user flesh out a brief for an article they want to write. 

Ask clarifying questions ONE AT A TIME about:
1. The specific topic or angle.
2. The target audience.
3. The desired tone (e.g., Professional, Conversational, Technical).
4. The language (Indonesian or English). If the user speaks Indonesian, default the language to Indonesian.

CRITICAL RULE: At the very end of EVERY single response you send, you MUST append a JSON block containing the current state of the brief enclosed in <brief> tags. Do not put anything after the </brief> tag. 
Example of your response:
"That sounds like a great topic! Who is the target audience for this piece?
<brief>
{
  "topic": "The future of AI in Venture Capital",
  "audience": "",
  "tone": "Professional",
  "language": "Indonesian"
}
</brief>"

Keep the conversation concise, friendly, and professional. Once the user is satisfied, tell them they can click the Generate button to create the full article.`,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("[chat-brief] Error:", error);
    return new Response(error.message || "Failed to generate chat", { status: 500 });
  }
}
