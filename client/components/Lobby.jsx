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

const ROOM_TOPICS = [
  { label: "💼 Employment", example: "Job Search Discussion" },
  { label: "📋 Project Planning", example: "Q2 Campaign Launch" },
  { label: "🎯 Brainstorming", example: "Product Ideas" },
  { label: "📚 Learning", example: "AI & Machine Learning" },
  { label: "🤝 Team Meeting", example: "Weekly Standup" },
  { label: "💡 Problem Solving", example: "System Architecture" },
];

export function Lobby() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const placeholderRoom = useMemo(() => `ideas-${nanoid(6)}`, []);

  const handleJoin = async (roomIdOverride) => {
    const trimmedName = name.trim();
    const trimmedRoom = (roomIdOverride || roomName).trim();

    if (!trimmedName || !trimmedRoom) {
      setError("Enter your name and a room name to continue.");
      return;
    }

    setIsLoading(true);
    setError("");
    
    // Store original room name and slugified version
    const slugifiedRoomId = slugifyRoomName(trimmedRoom);
    const finalRoomId = slugifiedRoomId || trimmedRoom;
    
    // Check if room exists (only for join, not for create)
    if (!roomIdOverride) {
      try {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
        const response = await fetch(`${socketUrl}/api/rooms/${encodeURIComponent(finalRoomId)}`);
        const data = await response.json();
        
        if (!data.exists) {
          setError("Room does not exist. Please create a new room or enter a different room name.");
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Could not verify room existence:", err);
        // Allow join even if verification fails
      }
    }
    
    window.localStorage.setItem("aurachat:name", trimmedName);
    window.localStorage.setItem("aurachat:last-room", finalRoomId);
    window.localStorage.setItem("aurachat:room-display-name", trimmedRoom);
    if (selectedTopic) {
      window.localStorage.setItem("aurachat:room-topic", selectedTopic);
    }
    
    // Navigate to room
    router.push(`/room/${encodeURIComponent(finalRoomId)}`);
  };

  const createNewRoom = (topicExample = null) => {
    const displayName = topicExample || `Room ${new Date().getTime()}`;
    const slugifiedName = slugifyRoomName(displayName);
    setRoomName(displayName);
    window.localStorage.setItem("aurachat:room-display-name", displayName);
    handleJoin(slugifiedName);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-14">
      <div className="mesh-background" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute left-4 top-4 text-xl font-bold tracking-tight text-gradient sm:left-6 sm:top-6 sm:text-2xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        AuraChat
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel relative z-10 w-full max-w-2xl rounded-[24px] p-4 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-8"
      >
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-accent/80 sm:mb-3 sm:text-sm">Realtime multiplayer AI rooms</p>
          <h1
            className="mb-2 text-3xl font-bold leading-tight text-text sm:mb-3 sm:text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Chat with AI, together.
          </h1>
          <p className="mb-6 max-w-lg text-sm text-muted sm:mb-8 sm:text-base">
            Pick a topic, invite people with a link, and watch one shared AI conversation stream to everyone live.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* User Info Section */}
          <div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-text">Your name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g., Avery"
                className="w-full rounded-2xl border border-border bg-black/20 px-4 py-3 text-text placeholder:text-muted/50 outline-none transition focus:border-accent focus:shadow-glow"
              />
            </label>
          </div>

          {/* Room Creation Section */}
          <div className="rounded-xl border border-border/30 bg-white/5 p-4 sm:p-5">
            <p className="mb-3 text-sm font-medium text-text">Create a room by topic</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
              {ROOM_TOPICS.map((topic) => (
                <button
                  key={topic.label}
                  onClick={() => {
                    if (!name.trim()) {
                      setError("Please enter your name first.");
                      return;
                    }
                    setSelectedTopic(topic.label);
                    createNewRoom(topic.example);
                  }}
                  disabled={isLoading || !name.trim()}
                  className="group relative rounded-xl border border-border/40 bg-white/5 px-3 py-2.5 text-left text-xs transition hover:border-accent/50 hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:py-3 sm:text-sm"
                  title={`Create room: ${topic.example}`}
                >
                  <div className="font-medium text-text">{topic.label}</div>
                  <div className="mt-0.5 text-xs text-muted group-hover:text-accent/70">{topic.example}</div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted/70">Click a topic to instantly create and join a new room</p>
          </div>

          {/* Manual Room Section */}
          <div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-text">Or, join/create a custom room</span>
              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder={placeholderRoom}
                className="w-full rounded-2xl border border-border bg-black/20 px-4 py-3 text-text placeholder:text-muted/50 outline-none transition focus:border-accent focus:shadow-glow"
              />
            </label>
          </div>

          {error ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-rose-300"
            >
              {error}
            </motion.p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => handleJoin()}
              disabled={isLoading || !name.trim() || !roomName.trim()}
              className="flex-1 rounded-2xl bg-accent px-5 py-3 font-medium text-black transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Connecting..." : "Join Existing Room"}
            </button>
            <button
              onClick={() => {
                if (!name.trim() || !roomName.trim()) {
                  setError("Please fill in your name and room name.");
                  return;
                }
                createNewRoom(roomName);
              }}
              disabled={isLoading}
              className="rounded-2xl border border-border bg-white/5 px-5 py-3 font-medium text-text transition hover:border-accent/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Starting..." : "Create & Join"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

