"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ChatInput } from "../../../components/ChatInput";
import { ChatWindow } from "../../../components/ChatWindow";
import { ExportChatButton } from "../../../components/ExportChatButton";
import { ModelSelector } from "../../../components/ModelSelector";
import { PersonaSelector } from "../../../components/PersonaSelector";
import { PresenceSidebar } from "../../../components/PresenceSidebar";
import { ShareRoomButton } from "../../../components/ShareRoomButton";
import { SummaryButton } from "../../../components/SummaryButton";
import { Toast } from "../../../components/Toast";
import { useChat } from "../../../hooks/useChat";
import { useSocket } from "../../../hooks/useSocket";

const USER_COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#34d399", "#38bdf8", "#a78bfa", "#f472b6"];

function pickColor(username) {
  const seed = username.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return USER_COLORS[seed % USER_COLORS.length];
}

export default function RoomPage({ params }) {
  const roomId = decodeURIComponent(params.roomId);
  const { socket, status } = useSocket();
  const [username, setUsername] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const storedName = window.localStorage.getItem("aurachat:name");
    const fallback = `Guest-${Math.floor(Math.random() * 900 + 100)}`;
    const nextName = storedName || fallback;
    setUsername(nextName);
    window.localStorage.setItem("aurachat:name", nextName);
  }, []);

  const color = useMemo(() => pickColor(username || "Guest"), [username]);

  const {
    users,
    messages,
    typingUsers,
    isAiStreaming,
    currentModel,
    currentPersona,
    summaryState,
    connectionError,
    mentionPulseUsers,
    sendMessage,
    startTyping,
    stopTyping,
    toggleReaction,
    changePersona,
    changeModel,
    summarizeRoom,
    setSummaryState,
  } = useChat({
    socket,
    roomId,
    username,
    color,
  });

  const showCopiedToast = () => {
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2000);
  };

  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mesh-background" />
      <div className="print-only p-8">
        <h1>AuraChat - {roomId}</h1>
        {messages.map((message) => (
          <div key={message.id} style={{ marginBottom: "1rem" }}>
            <strong>
              {message.username} ({new Date(message.timestamp).toLocaleString()})
            </strong>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      <div className="no-print relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] flex-col gap-4">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel flex flex-col gap-4 rounded-[32px] px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-accent/80">AuraChat room</p>
            <h1 className="text-3xl font-bold text-text" style={{ fontFamily: "var(--font-heading)" }}>
              {roomId}
            </h1>
            <p className="text-sm text-muted">
              {status === "connected" ? "Connected live" : status === "connecting" ? "Connecting..." : "Disconnected"}
              {typingUsers.length > 0 ? ` • ${typingUsers.join(", ")} typing` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ModelSelector value={currentModel} onChange={changeModel} />
            <ShareRoomButton roomId={roomId} onCopied={showCopiedToast} />
          </div>
        </motion.header>

        {connectionError ? (
          <div className="rounded-3xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {connectionError}
          </div>
        ) : null}

        <div className="grid flex-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel flex flex-col gap-4 rounded-[32px] p-4"
          >
            <PresenceSidebar users={users} currentUsername={username} mentionPulseUsers={mentionPulseUsers} />
            <PersonaSelector value={currentPersona} onChange={changePersona} />
            <SummaryButton
              onSummarize={summarizeRoom}
              summaryState={summaryState}
              onClose={() => setSummaryState((prev) => ({ ...prev, isOpen: false }))}
            />
            <ExportChatButton messages={messages} roomId={roomId} />
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel flex min-h-[70vh] flex-col gap-4 rounded-[32px] p-4"
          >
            <ChatWindow
              messages={messages}
              currentUsername={username}
              isAiStreaming={isAiStreaming}
              onToggleReaction={(messageId, emoji, hasReacted) => toggleReaction({ messageId, emoji, hasReacted })}
            />
            <ChatInput
              users={users}
              onSend={sendMessage}
              onTypingStart={startTyping}
              onTypingStop={stopTyping}
              disabled={isAiStreaming}
              currentUsername={username}
            />
          </motion.section>
        </div>
      </div>

      <Toast message="Copied!" visible={toastVisible} />
    </div>
  );
}

