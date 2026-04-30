import { io as createClient } from "socket.io-client";

function waitForEvent(socket, eventName, predicate = () => true, timeoutMs = 8000) {
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

async function main() {
  const roomId = `live-smoke-${Date.now()}`;
  const url = "http://localhost:4000";

  const alice = createClient(url, { transports: ["websocket"], forceNew: true });
  const bob = createClient(url, { transports: ["websocket"], forceNew: true });

  try {
    await Promise.all([
      waitForEvent(alice, "connect"),
      waitForEvent(bob, "connect"),
    ]);

    const aliceJoined = waitForEvent(alice, "room-joined");
    alice.emit("join-room", { roomId, username: "Alice", color: "#f87171" });
    const aliceRoom = await aliceJoined;

    const bobJoined = waitForEvent(bob, "room-joined");
    const aliceSawBob = waitForEvent(alice, "user-joined", ({ username }) => username === "Bob");
    bob.emit("join-room", { roomId, username: "Bob", color: "#38bdf8" });
    const bobRoom = await bobJoined;
    await aliceSawBob;

    const aliceMessage = waitForEvent(alice, "new-message", ({ content }) => content === "Hello from Alice");
    const bobMessage = waitForEvent(bob, "new-message", ({ content }) => content === "Hello from Alice");
    alice.emit("send-message", {
      roomId,
      message: "Hello from Alice",
      username: "Alice",
      isAskingAI: false,
    });
    await Promise.all([aliceMessage, bobMessage]);

    const aiStart = waitForEvent(alice, "ai-stream-start");
    const aiEnd = waitForEvent(alice, "ai-stream-end");
    const aiFallback = waitForEvent(alice, "ai-fallback").catch(() => null);
    bob.emit("send-message", {
      roomId,
      message: "Can the AI help here?",
      username: "Bob",
      persona: "Teacher",
      model: "gpt-4o",
      isAskingAI: true,
    });

    await aiStart;
    const [fallbackInfo, aiReply] = await Promise.all([aiFallback, aiEnd]);

    console.log(
      JSON.stringify(
        {
          ok: true,
          roomId,
          aliceUsers: aliceRoom.users.length,
          bobUsers: bobRoom.users.length,
          usedFallback: Boolean(fallbackInfo),
          fallbackReason: fallbackInfo?.reason || null,
          aiPreview: aiReply.fullContent.slice(0, 120),
        },
        null,
        2,
      ),
    );
  } finally {
    alice.close();
    bob.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
