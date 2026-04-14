import { Server } from "socket.io";
import {
  addUserToRoom,
  appendMessageToRoom,
  getOpenAIContext,
  getRoomHistory,
  getRoomMeta,
  getUsersInRoom,
  removeUserFromRoom,
  setRoomMeta,
  updateMessageReactions,
  markRoomAsCreated,
} from "./rooms.js";
import { streamAIResponse, streamSummary } from "./openai.js";

function createUserMessage({ username, color, content }) {
  return {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    username,
    color,
    content,
    timestamp: new Date().toISOString(),
    role: "user",
    reactions: {},
  };
}

export function attachSocket(server, clientOrigin) {
  const io = new Server(server, {
    cors: {
      origin: clientOrigin,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-room", async ({ roomId, username, color }) => {
      if (!roomId || !username) {
        socket.emit("server-error", { message: "Room ID and username are required." });
        return;
      }

      socket.data.roomId = roomId;
      socket.data.username = username;
      socket.data.color = color;
      socket.join(roomId);

      const users = addUserToRoom(roomId, { username, color });
      
      // Mark room as created when first user joins
      if (users.length === 1) {
        markRoomAsCreated(roomId);
        console.log(`🎮 Room created: ${roomId}`);
      }
      
      const history = await getRoomHistory(roomId);
      const meta = await getRoomMeta(roomId);

      socket.emit("room-joined", {
        users,
        history,
        currentPersona: meta.currentPersona,
        currentModel: meta.currentModel,
      });

      socket.to(roomId).emit("user-joined", { username, color });
    });

    socket.on("leave-room", ({ roomId }) => {
      const username = socket.data.username;
      if (!roomId || !username) {
        return;
      }

      removeUserFromRoom(roomId, username);
      socket.leave(roomId);
      socket.to(roomId).emit("user-left", { username });
    });

    socket.on("send-message", async ({ roomId, message, model, persona, username }) => {
      if (!roomId || !message?.trim()) {
        return;
      }

      try {
        const messageObject = createUserMessage({
          username,
          color: socket.data.color || "#38bdf8",
          content: message.trim(),
        });

        await appendMessageToRoom(roomId, messageObject);
        io.to(roomId).emit("new-message", messageObject);

        const meta = await setRoomMeta(roomId, {
          currentModel: model || "gpt-4o",
          currentPersona: persona || "Default",
        });
        const history = await getOpenAIContext(roomId);

        await streamAIResponse({
          io,
          roomId,
          history,
          model: meta.currentModel,
          persona: meta.currentPersona,
        });
      } catch (error) {
        console.error("OpenAI streaming error:", error.message);
        io.to(roomId).emit("server-error", {
          message: error.message || "The AI response failed to stream.",
        });
      }
    });

    socket.on("add-reaction", async ({ roomId, messageId, emoji, username }) => {
      const reactions = await updateMessageReactions(roomId, messageId, emoji, username, "add");
      io.to(roomId).emit("reaction-updated", { messageId, reactions });
    });

    socket.on("remove-reaction", async ({ roomId, messageId, emoji, username }) => {
      const reactions = await updateMessageReactions(roomId, messageId, emoji, username, "remove");
      io.to(roomId).emit("reaction-updated", { messageId, reactions });
    });

    socket.on("typing-start", ({ roomId, username }) => {
      socket.to(roomId).emit("user-typing", { username });
    });

    socket.on("typing-stop", ({ roomId, username }) => {
      socket.to(roomId).emit("user-stop-typing", { username });
    });

    socket.on("change-persona", async ({ roomId, persona }) => {
      const meta = await setRoomMeta(roomId, { currentPersona: persona });
      io.to(roomId).emit("persona-changed", { persona: meta.currentPersona, changedBy: socket.data.username });
    });

    socket.on("change-model", async ({ roomId, model }) => {
      const meta = await setRoomMeta(roomId, { currentModel: model });
      io.to(roomId).emit("model-changed", { model: meta.currentModel, changedBy: socket.data.username });
    });

    socket.on("summarize-room", async ({ roomId, model }) => {
      try {
        const history = await getOpenAIContext(roomId);
        await streamSummary({
          io,
          socketId: socket.id,
          history,
          model: model || "gpt-4o",
        });
      } catch (error) {
        console.error("Summary error:", error.message);
        io.to(socket.id).emit("summary-error", { error: error.message || "Unable to summarize this room." });
      }
    });

    socket.on("disconnect", () => {
      const roomId = socket.data.roomId;
      const username = socket.data.username;
      if (!roomId || !username) {
        return;
      }

      removeUserFromRoom(roomId, username);
      socket.to(roomId).emit("user-left", { username });
      if (getUsersInRoom(roomId).length === 0) {
        socket.to(roomId).emit("user-stop-typing", { username });
      }
    });
  });

  return io;
}

