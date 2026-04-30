import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import { once } from "node:events";
import { io as createClient } from "socket.io-client";
import { attachSocket } from "../src/socket.js";
import { appendMessageToRoom, doesRoomExist, markRoomAsCreated, resetRoomsState } from "../src/rooms.js";

function waitForEvent(socket, eventName, predicate = () => true, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      socket.off(eventName, handleEvent);
      reject(new Error(`Timed out waiting for ${eventName}`));
    }, timeoutMs);

    function handleEvent(payload) {
      if (!predicate(payload)) {
        return;
      }

      clearTimeout(timeoutId);
      socket.off(eventName, handleEvent);
      resolve(payload);
    }

    socket.on(eventName, handleEvent);
  });
}

async function createSocketTestHarness() {
  const server = http.createServer();
  const io = attachSocket(server, "http://localhost:3001");
  server.listen(0);
  await once(server, "listening");

  const { port } = server.address();
  const url = `http://127.0.0.1:${port}`;

  const alice = createClient(url, {
    transports: ["websocket"],
    forceNew: true,
  });
  const bob = createClient(url, {
    transports: ["websocket"],
    forceNew: true,
  });

  await Promise.all([once(alice, "connect"), once(bob, "connect")]);

  async function close() {
    alice.close();
    bob.close();
    await new Promise((resolve) => io.close(resolve));
  }

  return { alice, bob, close };
}

test.beforeEach(() => {
  resetRoomsState();
  delete process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GROQ_API_KEY;
});

test("room existence stays true after a room is created or has history", async () => {
  assert.equal(await doesRoomExist("alpha-room"), false);

  await markRoomAsCreated("alpha-room");
  assert.equal(await doesRoomExist("alpha-room"), true);

  resetRoomsState();
  await appendMessageToRoom("history-room", {
    id: "msg-1",
    username: "Alice",
    color: "#38bdf8",
    content: "Persisted note",
    timestamp: new Date().toISOString(),
    role: "user",
    reactions: {},
  });

  assert.equal(await doesRoomExist("history-room"), true);
});

test("two users can join the same room, receive each other's messages, and get an AI fallback reply", async () => {
  const { alice, bob, close } = await createSocketTestHarness();
  const roomId = "pair-room";

  try {
    const aliceJoined = waitForEvent(alice, "room-joined");
    alice.emit("join-room", { roomId, username: "Alice", color: "#f87171" });
    const aliceRoom = await aliceJoined;
    assert.equal(aliceRoom.users.length, 1);
    assert.equal(aliceRoom.history.length, 0);

    const aliceSawBob = waitForEvent(alice, "user-joined", ({ username }) => username === "Bob");
    const bobJoined = waitForEvent(bob, "room-joined");
    bob.emit("join-room", { roomId, username: "Bob", color: "#38bdf8" });
    const [bobRoom] = await Promise.all([bobJoined, aliceSawBob]);
    assert.equal(bobRoom.users.length, 2);

    const aliceMessage = waitForEvent(alice, "new-message", ({ content, username }) => content === "Hello Bob" && username === "Alice");
    const bobMessage = waitForEvent(bob, "new-message", ({ content, username }) => content === "Hello Bob" && username === "Alice");
    alice.emit("send-message", {
      roomId,
      message: "Hello Bob",
      username: "Alice",
      isAskingAI: false,
    });
    await Promise.all([aliceMessage, bobMessage]);

    const aliceAiStart = waitForEvent(alice, "ai-stream-start");
    const bobAiStart = waitForEvent(bob, "ai-stream-start");
    const aliceAiEnd = waitForEvent(alice, "ai-stream-end");
    const bobAiEnd = waitForEvent(bob, "ai-stream-end");

    bob.emit("send-message", {
      roomId,
      message: "Can you help summarize this?",
      model: "gpt-4o",
      persona: "Teacher",
      username: "Bob",
      isAskingAI: true,
    });

    await Promise.all([aliceAiStart, bobAiStart]);
    const [aliceAiReply, bobAiReply] = await Promise.all([aliceAiEnd, bobAiEnd]);

    assert.match(aliceAiReply.fullContent, /fallback response/i);
    assert.match(aliceAiReply.fullContent, /Aura AI is not configured yet/i);
    assert.equal(aliceAiReply.fullContent, bobAiReply.fullContent);
  } finally {
    await close();
  }
});
