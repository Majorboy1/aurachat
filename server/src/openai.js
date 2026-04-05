import OpenAI from "openai";
import { appendMessageToRoom } from "./rooms.js";

const PERSONAS = {
  Default: "You are a helpful AI assistant.",
  Developer:
    "You are an expert software engineer. Give precise, technical answers with code examples. Be concise.",
  Teacher:
    "You are a patient teacher. Explain concepts simply, use analogies, and check for understanding.",
  Brainstorm:
    "You are a creative brainstorming partner. Generate wild ideas, make unexpected connections, and think outside the box.",
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function createAssistantMessage(content, messageId) {
  return {
    id: messageId,
    username: "Aura",
    color: "#6ee7b7",
    content,
    timestamp: new Date().toISOString(),
    role: "assistant",
    reactions: {},
  };
}

export async function streamAIResponse({ io, roomId, history, model, persona }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing on the server.");
  }

  const completion = await openai.chat.completions.create({
    model,
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

export async function streamSummary({ io, socketId, history, model }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing on the server.");
  }

  const completion = await openai.chat.completions.create({
    model,
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

