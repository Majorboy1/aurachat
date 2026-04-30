import OpenAI from "openai";
import { appendMessageToRoom } from "./rooms.js";

const PERSONAS = {
  Default:
    "You are Aura AI, a helpful AI assistant in a shared discussion room. Keep answers clear and collaborative, and make it obvious that you are the AI assistant when you reply.",
  Developer:
    "You are Aura AI, an expert software engineer. Give precise, technical answers with code examples. Be concise, and make it obvious that you are the AI assistant when you reply.",
  Teacher:
    "You are Aura AI, a patient teacher. Explain concepts simply, use analogies, and check for understanding. Make it obvious that you are the AI assistant when you reply.",
  Brainstorm:
    "You are Aura AI, a creative brainstorming partner. Generate wild ideas, make unexpected connections, and think outside the box. Make it obvious that you are the AI assistant when you reply.",
};

let groqClient;
let openaiClient;

function getProviderConfig() {
  if (process.env.GROQ_API_KEY || (process.env.OPENAI_API_KEY || "").startsWith("gsk_")) {
    return {
      provider: "groq",
      apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
      defaultModel: "openai/gpt-oss-20b",
    };
  }

  if (process.env.GEMINI_API_KEY || (process.env.OPENAI_API_KEY || "").startsWith("AIza")) {
    return {
      provider: "gemini",
      apiKey: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY,
      defaultModel: "gemini-2.0-flash",
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      defaultModel: "gpt-4o",
    };
  }

  return {
    provider: "none",
    apiKey: "",
    defaultModel: "",
  };
}

function getGroqClient() {
  const { apiKey } = getProviderConfig();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing on the server.");
  }

  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  return groqClient;
}

function getOpenAIClient() {
  const { apiKey } = getProviderConfig();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing on the server.");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
    });
  }

  return openaiClient;
}

function resolveModel(model) {
  const { provider, defaultModel } = getProviderConfig();
  if (!model) {
    return defaultModel;
  }

  if (provider === "groq") {
    if (model === "gpt-4o" || model === "gpt-3.5-turbo") {
      return defaultModel;
    }
    return model;
  }

  if (provider === "gemini") {
    if (model.startsWith("gpt-")) {
      return defaultModel;
    }
    return model;
  }

  return model;
}

function buildFallbackReply({ prompt, persona, reason }) {
  const trimmedPrompt = (prompt || "").trim();
  const intro =
    "This is an AI-generated fallback response. Aura AI could not reach the configured cloud model right now, so this reply is coming from the local fallback assistant.";

  const personaHint =
    persona === "Developer"
      ? "Focus on practical implementation steps, edge cases, and validation."
      : persona === "Teacher"
        ? "Focus on a simple explanation and a short example."
        : persona === "Brainstorm"
          ? "Focus on creative options and different directions to explore."
          : "Focus on being helpful, clear, and collaborative.";

  return [
    intro,
    "",
    `Your question: "${trimmedPrompt || "No question text was provided."}"`,
    "",
    "Best next step:",
    `- ${personaHint}`,
    `- Start by clarifying the goal, constraints, and expected outcome for: "${trimmedPrompt || "this request"}".`,
    "- Break the problem into 2-3 concrete actions before deciding on tools or architecture.",
    "- If you want a stronger answer, restore the AI provider key or quota and ask again.",
    "",
    `Fallback reason: ${reason}`,
  ].join("\n");
}

function createAssistantMessage(content, messageId) {
  return {
    id: messageId,
    username: "Aura AI",
    color: "#6ee7b7",
    content,
    timestamp: new Date().toISOString(),
    role: "assistant",
    reactions: {},
    isAiGenerated: true,
  };
}

function createGeminiContents(history) {
  return history.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
}

function extractGeminiText(payload) {
  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("") || ""
  );
}

async function requestGemini({ history, model, systemInstruction }) {
  const { apiKey } = getProviderConfig();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing on the server.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${resolveModel(model)}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: createGeminiContents(history),
      }),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(payload?.error?.message || "Gemini request failed.");
    error.status = response.status;
    error.code = payload?.error?.status;
    throw error;
  }

  return extractGeminiText(payload);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function emitSimulatedStream({ io, target, fullContent, eventPrefix }) {
  const chunks = fullContent.match(/\S+\s*|\n/g) || [fullContent];
  io.to(target).emit(`${eventPrefix}-start`, {});

  for (const chunk of chunks) {
    io.to(target).emit(`${eventPrefix}-token`, { token: chunk });
    await sleep(12);
  }
}

async function streamOpenAICompatibleResponse({ client, io, roomId, history, model, persona }) {
  const completion = await client.chat.completions.create({
    model: resolveModel(model),
    stream: true,
    messages: [{ role: "system", content: PERSONAS[persona] || PERSONAS.Default }, ...history],
  });

  io.to(roomId).emit("ai-stream-start", {});
  let fullContent = "";

  for await (const chunk of completion) {
    const token = chunk.choices?.[0]?.delta?.content || "";
    if (!token) {
      continue;
    }

    fullContent += token;
    io.to(roomId).emit("ai-stream-token", { token });
  }

  const messageId = `ai-${Date.now()}`;
  io.to(roomId).emit("ai-stream-end", { fullContent, messageId });
  await appendMessageToRoom(roomId, createAssistantMessage(fullContent, messageId));
}

async function streamOpenAICompatibleSummary({ client, io, socketId, history, model }) {
  const completion = await client.chat.completions.create({
    model: resolveModel(model),
    stream: true,
    messages: [
      {
        role: "system",
        content: "Summarize this conversation clearly and concisely with key points and decisions made.",
      },
      ...history,
    ],
  });

  io.to(socketId).emit("summary-stream-start", {});
  let content = "";

  for await (const chunk of completion) {
    const token = chunk.choices?.[0]?.delta?.content || "";
    if (!token) {
      continue;
    }

    content += token;
    io.to(socketId).emit("summary-stream-token", { token });
  }

  io.to(socketId).emit("summary-stream-end", { content });
}

export function formatOpenAIError(error) {
  const status = error?.status;
  const code = error?.code;
  const message = error?.message || "";
  const { provider } = getProviderConfig();

  if (provider === "none") {
    return "Aura AI is not configured yet. Add a valid GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY on the server.";
  }

  if (status === 429 || code === "RESOURCE_EXHAUSTED" || code === "insufficient_quota" || /quota/i.test(message)) {
    return `Aura AI is unavailable because the server's ${provider === "groq" ? "Groq" : provider === "gemini" ? "Gemini" : "OpenAI"} quota has been exhausted. Add billing or credits to that AI account, or replace the server key with one that has available usage.`;
  }

  if (status === 401) {
    return `Aura AI could not authenticate with ${provider === "groq" ? "Groq" : provider === "gemini" ? "Gemini" : "OpenAI"}. Check that the server key is valid.`;
  }

  if (status === 403) {
    return `Aura AI is blocked from calling the selected ${provider === "groq" ? "Groq" : provider === "gemini" ? "Gemini" : "OpenAI"} model. Check the API key permissions and model access.`;
  }

  return message || "The AI response failed to stream.";
}

export async function streamFallbackAIResponse({ io, roomId, prompt, persona, reason }) {
  const fullContent = buildFallbackReply({ prompt, persona, reason });
  const messageId = `ai-fallback-${Date.now()}`;

  io.to(roomId).emit("ai-fallback", { reason });
  await emitSimulatedStream({ io, target: roomId, fullContent, eventPrefix: "ai-stream" });
  io.to(roomId).emit("ai-stream-end", { fullContent, messageId });

  await appendMessageToRoom(roomId, createAssistantMessage(fullContent, messageId));
}

export async function streamAIResponse({ io, roomId, history, model, persona }) {
  const { provider } = getProviderConfig();

  if (provider === "groq") {
    await streamOpenAICompatibleResponse({
      client: getGroqClient(),
      io,
      roomId,
      history,
      model,
      persona,
    });
    return;
  }

  if (provider === "openai") {
    await streamOpenAICompatibleResponse({
      client: getOpenAIClient(),
      io,
      roomId,
      history,
      model,
      persona,
    });
    return;
  }

  if (provider === "gemini") {
    const fullContent = await requestGemini({
      history,
      model,
      systemInstruction: PERSONAS[persona] || PERSONAS.Default,
    });

    await emitSimulatedStream({ io, target: roomId, fullContent, eventPrefix: "ai-stream" });

    const messageId = `ai-${Date.now()}`;
    io.to(roomId).emit("ai-stream-end", { fullContent, messageId });
    await appendMessageToRoom(roomId, createAssistantMessage(fullContent, messageId));
    return;
  }

  throw new Error("No AI provider key is configured on the server.");
}

export async function streamSummary({ io, socketId, history, model }) {
  const { provider } = getProviderConfig();

  if (provider === "groq") {
    await streamOpenAICompatibleSummary({
      client: getGroqClient(),
      io,
      socketId,
      history,
      model,
    });
    return;
  }

  if (provider === "openai") {
    await streamOpenAICompatibleSummary({
      client: getOpenAIClient(),
      io,
      socketId,
      history,
      model,
    });
    return;
  }

  if (provider === "gemini") {
    const content = await requestGemini({
      history,
      model,
      systemInstruction: "Summarize this conversation clearly and concisely with key points and decisions made.",
    });

    await emitSimulatedStream({ io, target: socketId, fullContent: content, eventPrefix: "summary-stream" });
    io.to(socketId).emit("summary-stream-end", { content });
    return;
  }

  throw new Error("No AI provider key is configured on the server.");
}
