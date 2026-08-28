import { generateObject, generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const articleSchema = z.object({
  title: z.string(),
  contentHtml: z.string().describe("Fully formatted HTML string compatible with TipTap (h2, h3, p, strong, ul, li)."),
  excerpt: z.string().max(160).describe("A compelling SEO meta description."),
  tags: z.string().describe("Comma-separated SEO keywords.")
});

let cachedBestModel: string | null = null;
let lastModelCheckTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function getAvailableFlashModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) return ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    const data = await res.json();
    
    const flashModels = data.models
      .map((m: any) => m.name.replace('models/', ''))
      .filter((name: string) => /^gemini-\d+\.\d+-flash$/.test(name))
      .sort((a: string, b: string) => {
        const vA = parseFloat(a.match(/[\d.]+/)?.[0] || "0");
        const vB = parseFloat(b.match(/[\d.]+/)?.[0] || "0");
        return vB - vA;
      });
      
    return flashModels.length > 0 ? flashModels : ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-1.5-flash'];
  } catch (error) {
    return ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-1.5-flash'];
  }
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendLog(msg: string) {
        const payload = JSON.stringify({ type: 'log', message: msg }) + '\n';
        controller.enqueue(encoder.encode(payload));
      }
      function sendError(msg: string) {
        const payload = JSON.stringify({ type: 'error', message: msg }) + '\n';
        controller.enqueue(encoder.encode(payload));
      }
      function sendResult(data: any) {
        const payload = JSON.stringify({ type: 'result', data: data }) + '\n';
        controller.enqueue(encoder.encode(payload));
      }

      try {
        const { prompt } = await req.json();

        if (!prompt) {
          sendError("Prompt is required");
          controller.close();
          return;
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
          sendError("Missing GOOGLE_GENERATIVE_AI_API_KEY");
          controller.close();
          return;
        }

        // ==========================================
        // STEP 1: PING & CACHE BEST MODEL
        // ==========================================
        let activeModelToUse = cachedBestModel;

        if (!activeModelToUse || Date.now() - lastModelCheckTime > CACHE_TTL) {
          sendLog("No active model cached. Fetching latest AI models from Google...");
          const availableModels = await getAvailableFlashModels(apiKey);
          sendLog(`Found ${availableModels.length} models. Commencing ping test with dummy data.`);
          
          let pingSuccess = false;
          for (const modelName of availableModels) {
            try {
              sendLog(`[PING] Testing ${modelName}...`);
              await generateText({
                model: google(modelName),
                prompt: "Ping? Reply with just 'Pong'",
                maxTokens: 5,
                maxRetries: 0 // Fail instantly if 503/404
              });
              
              sendLog(`[PING SUCCESS] ${modelName} is active and ready!`);
              cachedBestModel = modelName;
              lastModelCheckTime = Date.now();
              activeModelToUse = modelName;
              pingSuccess = true;
              break;
            } catch (err: any) {
              sendLog(`[PING FAILED] ${modelName} unavailable. Skipping...`);
              continue;
            }
          }

          if (!pingSuccess || !activeModelToUse) {
            sendError("All models failed the ping test. Systems are down.");
            controller.close();
            return;
          }
        } else {
          sendLog(`Using cached stable AI model: ${activeModelToUse}`);
        }

        // ==========================================
        // STEP 2: GENERATE ACTUAL ARTICLE
        // ==========================================
        sendLog(`Commencing heavy article generation via ${activeModelToUse}...`);
        try {
          const { object } = await generateObject({
            model: google(activeModelToUse),
            system: "You are the lead copywriter and Creative Digital Architect for Anugerah Ventures, a high-end digital experience studio. Your task is to write a comprehensive, premium, and SEO-optimized article based on the user's prompt.\n\nStrict Rules:\n1. Tone: Authoritative, elegant, direct, and business-focused (B2B). Avoid fluff and overly enthusiastic filler words.\n2. Content Format: Output MUST be valid HTML compatible with TipTap (<h2>, <h3>, <p>, <strong>, <ul>, <li>). Do not use <h1> in the content body.\n3. Structure: Include an engaging introduction, structured body paragraphs with clear headings, and a decisive conclusion.\n4. SEO: Generate a highly clickable excerpt (max 160 characters) and 3-5 highly relevant comma-separated tags.",
            prompt: prompt,
            schema: articleSchema,
            maxRetries: 1, // Allow 1 retry for the actual heavy generation just in case
          });
          
          sendLog(`Successfully generated article!`);
          sendResult(object);
        } catch (heavyErr: any) {
          sendLog(`Generation failed during execution: ${heavyErr.message}`);
          // If it fails during real generation, invalidate cache so next time we re-ping
          cachedBestModel = null; 
          sendError("Generation failed. Please try again.");
        }
        
        controller.close();

      } catch (error: any) {
        console.error("[generate-article] Fatal Error:", error);
        sendError("Fatal error occurred during generation");
        controller.close();
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}