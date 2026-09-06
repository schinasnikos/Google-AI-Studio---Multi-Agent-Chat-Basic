import type { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

// Vercel serverless function max execution duration (seconds)
export const maxDuration = 60;

interface ChatMessagePayload {
  id: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "bot" | "human";
  text: string;
  timestamp: number;
}

interface AgentPayload {
  id: string;
  name: string;
  prompt: string;
  avatar?: string;
  color?: string;
}

// Candidate models in prioritized order: Gemini 3.5 Flash Lite primary, Gemini 3.1 Flash Lite fallback
const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

function cleanErrorMessage(err: any): string {
  if (!err) return "Unknown generation error";
  const msg = err.message || String(err);
  try {
    const parsed = JSON.parse(msg);
    if (parsed?.error?.message) {
      try {
        const inner = JSON.parse(parsed.error.message);
        if (inner?.error?.message) return inner.error.message;
      } catch {
        return parsed.error.message;
      }
    }
  } catch {
    // not json
  }
  return msg;
}

let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured. If you deployed to Vercel, go to your Vercel Project Settings > Environment Variables, add GEMINI_API_KEY, and redeploy."
      );
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

export default async function handler(
  req: Request | any,
  res: Response | any
): Promise<void> {
  // CORS support
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const {
    bot,
    allBots = [],
    messages = [],
    humanParticipants = [],
    temperature = 0.8,
  }: {
    bot: AgentPayload;
    allBots?: AgentPayload[];
    messages?: ChatMessagePayload[];
    humanParticipants?: { id: string; name: string; isUser?: boolean }[];
    temperature?: number;
  } = body;

  if (!bot || !bot.name) {
    res.status(400).json({ error: "Missing bot definition in request" });
    return;
  }

  // Set SSE headers for streaming
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let isAborted = false;
  res.on("close", () => {
    if (!res.writableEnded) {
      isAborted = true;
    }
  });

  try {
    const ai = getGeminiClient();

    // Compose other participants description
    const otherAgents = (allBots || [])
      .filter((b) => b.id !== bot.id)
      .map((b) => `- ${b.name}: ${b.prompt.slice(0, 100)}...`)
      .join("\n");

    const humans = (humanParticipants || [])
      .map((h) => `- ${h.name} (${h.isUser ? "User" : "Human Participant"})`)
      .join("\n");

    const systemInstruction = `You are ${bot.name}, an AI participant in a dynamic multi-agent group chat.

Your Role & Personality:
${bot.prompt}

Other participants in the room:
${otherAgents || "(None - You are the sole AI)"}
Human participants:
${humans || "- User"}

Conversational Guidelines:
1. Stay strictly in your assigned persona, tone, and character.
2. You are in a real-time group conversation. You may directly address the user, reply to other AI agents, debate them, agree with them, or build upon what someone else said.
3. Keep your response conversational and punchy (typically 1 to 3 paragraphs unless answering a deeply technical or elaborate request).
4. Do NOT prefix your output with "${bot.name}:" or "[${bot.name}]" because the user interface automatically attaches your name badge and avatar.
5. React genuinely to the latest message in the chat while keeping full conversation context.`;

    // Format chat history into a clear transcript
    const transcript = (messages || [])
      .map((m) => {
        const typeLabel =
          m.senderType === "user"
            ? "User"
            : m.senderType === "human"
            ? "Human"
            : "Agent";
        return `[${m.senderName} (${typeLabel})]: ${m.text}`;
      })
      .join("\n\n");

    const promptText =
      transcript.trim().length > 0
        ? `Here is the current transcript of the group conversation:\n\n${transcript}\n\nRespond as ${bot.name} in your unique voice now:`
        : `The group conversation is starting. Introduce yourself as ${bot.name} in character to the room:`;

    // Multi-model resilience: attempt candidate models with fallback cascade
    let success = false;
    let selectedModel = CANDIDATE_MODELS[0];
    let lastError: any = null;

    for (const model of CANDIDATE_MODELS) {
      if (isAborted) break;
      let chunksCount = 0;
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents: promptText,
          config: {
            systemInstruction,
            temperature: Math.max(0.2, Math.min(1.2, temperature)),
          },
        });

        for await (const chunk of stream) {
          if (isAborted) break;
          const text = chunk.text;
          if (text) {
            chunksCount++;
            res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
          }
        }

        if (chunksCount > 0 || isAborted) {
          selectedModel = model;
          success = true;
          break;
        }
      } catch (err: any) {
        lastError = err;
        const cleanMsg = cleanErrorMessage(err);
        console.warn(
          `[Bot: ${bot.name}] Model ${model} failed (chunksSent: ${chunksCount}): ${cleanMsg}`
        );

        // If chunks were already written to the response stream, cannot cleanly switch models mid-stream
        if (chunksCount > 0) {
          throw err;
        }
      }
    }

    if (!success && !isAborted) {
      throw (
        lastError ||
        new Error("All candidate models were temporarily unavailable")
      );
    }

    if (!isAborted) {
      res.write(
        `data: ${JSON.stringify({ done: true, model: selectedModel })}\n\n`
      );
    }
    res.end();
  } catch (error: any) {
    const userFriendlyError = cleanErrorMessage(error);
    console.error(
      `Error streaming response for bot ${bot.name}:`,
      userFriendlyError
    );

    if (!res.headersSent) {
      res.status(500).json({ error: userFriendlyError });
    } else {
      res.write(
        `data: ${JSON.stringify({
          error: userFriendlyError,
          done: true,
        })}\n\n`
      );
      res.end();
    }
  }
}
