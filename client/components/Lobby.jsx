"use client";

import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function slugifyRoomName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function Lobby() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");
  const placeholderRoom = useMemo(() => `ideas-${nanoid(6)}`, []);

  const handleJoin = (roomIdOverride) => {
    const trimmedName = name.trim();
    const trimmedRoom = (roomIdOverride || roomName).trim();

    if (!trimmedName || !trimmedRoom) {
      setError("Enter your name and a room name to continue.");
      return;
    }

    const finalRoomId = slugifyRoomName(trimmedRoom) || trimmedRoom;
    window.localStorage.setItem("aurachat:name", trimmedName);
    window.localStorage.setItem("aurachat:last-room", finalRoomId);
    router.push(`/room/${encodeURIComponent(finalRoomId)}`);
  };

  const createNewRoom = () => {
    const generatedRoom = `room-${nanoid(8)}`;
    setRoomName(generatedRoom);
    handleJoin(generatedRoom);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-14">
      <div className="mesh-background" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute left-6 top-6 text-2xl font-bold tracking-tight text-gradient"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        AuraChat
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel relative z-10 w-full max-w-xl rounded-[32px] p-8 shadow-2xl shadow-black/30"
      >
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="mb-3 text-sm uppercase tracking-[0.24em] text-accent/80">Realtime multiplayer AI rooms</p>
          <h1
            className="mb-3 text-5xl font-bold leading-tight text-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Chat with AI, together.
          </h1>
          <p className="mb-8 max-w-lg text-base text-muted">
            Spin up a room, invite people with a link, and watch one shared AI conversation stream to everyone live.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-5"
        >
          <label className="block">
            <span className="mb-2 block text-sm text-muted">Your name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Avery"
              className="w-full rounded-2xl border border-border bg-black/20 px-4 py-3 text-text outline-none transition focus:border-accent focus:shadow-glow"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-muted">Room name</span>
            <input
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              placeholder={placeholderRoom}
              className="w-full rounded-2xl border border-border bg-black/20 px-4 py-3 text-text outline-none transition focus:border-accent focus:shadow-glow"
            />
          </label>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => handleJoin()}
              className="flex-1 rounded-2xl bg-accent px-5 py-3 font-medium text-black transition hover:bg-accent-hover"
            >
              Join Room
            </button>
            <button
              onClick={createNewRoom}
              className="rounded-2xl border border-border bg-white/5 px-5 py-3 font-medium text-text transition hover:border-accent/40 hover:bg-white/10"
            >
              Create new room
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

