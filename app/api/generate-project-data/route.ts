import { generateObject, generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const projectAiSchema = z.object({
  title: z.string().describe("A concise, professional title for the project."),
  slug: z.string().optional().describe("URL-friendly slug generated from the title (lowercase, hyphenated). MUST be generated if possible."),
  client: z.string().optional().describe("The name of the client, if mentioned."),
  role: z.string().optional().describe("The user's role in the project. Default to 'Interactive Web Engineer' or infer from Github. MUST be generated if possible."),
  tech_stack: z.array(z.string()).optional().describe("An array of technologies used. Infer from package.json if available."),
  year: z.number().optional().describe("The year the project was completed."),
  description: z.string().max(500).describe("A professional, technical summary of the project. Must be plain text, NO markdown, NO bullet points, max 500 characters. Incorporate Github README details if available.")
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
        const { prompt, githubUrl } = await req.json();

        if (!prompt && !githubUrl) {
          sendError("Prompt or Github URL is required");
          controller.close();
          return;
        }

        let enhancedPrompt = `Here is the rough draft of the project:\n---\n${prompt || "No draft provided, infer solely from Github."}\n---\n`;

        if (githubUrl) {
          const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
          if (match) {
            const owner = match[1];
            const repo = match[2].replace(/\.git$/, '');
            sendLog(`Detected GitHub URL. Fetching data for ${owner}/${repo}...`);
            
            try {
              // Try to fetch package.json
              let pkgRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/package.json`);
              if (!pkgRes.ok) pkgRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/package.json`);
              
              if (pkgRes.ok) {
                const pkg = await pkgRes.json();
                enhancedPrompt += `\nGITHUB PACKAGE.JSON EXTRACT:\nDependencies: ${Object.keys(pkg.dependencies || {}).join(', ')}\nDev Dependencies: ${Object.keys(pkg.devDependencies || {}).join(', ')}\n`;
                sendLog("Successfully fetched package.json dependencies.");
              }

              // Try to fetch README.md
              let readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`);
              if (!readmeRes.ok) readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`);
              
              if (readmeRes.ok) {
                const readme = await readmeRes.text();
                // Take first 1500 chars to avoid overwhelming context
                const truncatedReadme = readme.substring(0, 1500);
                enhancedPrompt += `\nGITHUB README.MD EXTRACT:\n${truncatedReadme}\n`;
                sendLog("Successfully fetched README.md summary.");
              }
            } catch (err: any) {
              sendLog(`[WARNING] Failed to fetch some GitHub data: ${err.message}`);
            }
          } else {
            sendLog("[WARNING] Invalid GitHub URL format. Proceeding without repo data.");
          }
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
        // STEP 2: GENERATE ACTUAL PROJECT DATA
        // ==========================================
        
        let finalObject = null;
        let lastError = null;

        if (activeModelToUse) {
          try {
            sendLog(`Commencing structured project generation via ${activeModelToUse}...`);
            const { object } = await generateObject({
              model: google(activeModelToUse),
              system: `You are an expert technical project manager and copywriter for a high-end digital agency called Anugerah Ventures.
Your task is to take a rough draft or bullet points about a project and extract/infer all the necessary structured fields to populate a CMS.

CRITICAL RULES:
1. MAX 500 CHARACTERS for the description.
2. PLAIN TEXT ONLY in the description. NO markdown, NO bolding (**), NO bullet points, NO HTML.
3. Tone: Professional, technical, and objective.
4. Language: Match the language of the user's input for the description (usually Indonesian or English).
5. Tech Stack: Extract all mentioned technologies into an array of strings.
6. Year: Extract the year if mentioned, otherwise use the current year.
7. Output strictly as JSON matching the schema. No markdown blocks, no extra text.`,
              prompt: `${enhancedPrompt}\n\nPlease generate the structured data now.`,
              schema: projectAiSchema,
              maxRetries: 0, // Don't retry same model if it fails schema validation
            });
            finalObject = object;
          } catch (heavyErr: any) {
            sendLog(`[WARNING] Model ${activeModelToUse} failed to generate valid structured data: ${heavyErr.message}`);
            lastError = heavyErr;
          }
        }

        // If the cached model failed, or no active model, try all available models as a fallback
        if (!finalObject) {
           cachedBestModel = null; // Invalidate cache
           const availableModels = await getAvailableFlashModels(apiKey);
           
           for (const fallbackModel of availableModels) {
              if (fallbackModel === activeModelToUse) continue; // Already tried
              
              try {
                sendLog(`[FALLBACK] Attempting generation with ${fallbackModel}...`);
                const { object } = await generateObject({
                  model: google(fallbackModel),
                  system: `You are an expert technical project manager and copywriter for a high-end digital agency called Anugerah Ventures.
Your task is to take a rough draft or bullet points about a project and extract/infer all the necessary structured fields to populate a CMS.

CRITICAL RULES:
1. MAX 500 CHARACTERS for the description.
2. PLAIN TEXT ONLY in the description. NO markdown, NO bolding (**), NO bullet points, NO HTML.
3. Tone: Professional, technical, and objective.
4. Language: Match the language of the user's input for the description (usually Indonesian or English).
5. Tech Stack: Extract all mentioned technologies into an array of strings.
6. Year: Extract the year if mentioned, otherwise use the current year.
7. Output strictly as JSON matching the schema. No markdown blocks, no extra text.`,
                  prompt: `${enhancedPrompt}\n\nPlease generate the structured data now.`,
                  schema: projectAiSchema,
                  maxRetries: 0, 
                });
                
                finalObject = object;
                sendLog(`[SUCCESS] Fallback model ${fallbackModel} succeeded!`);
                cachedBestModel = fallbackModel;
                lastModelCheckTime = Date.now();
                break;
              } catch (fallbackErr: any) {
                sendLog(`[WARNING] Fallback model ${fallbackModel} failed: ${fallbackErr.message}`);
                lastError = fallbackErr;
                continue;
              }
           }
        }

        if (finalObject) {
          sendLog(`Successfully generated structured project data!`);
          sendResult(finalObject);
        } else {
          sendError(`Generation failed on all available models. Last error: ${lastError?.message || "Unknown error"}`);
        }
        
        controller.close();

      } catch (error: any) {
        console.error("[generate-project-data] Fatal Error:", error);
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
