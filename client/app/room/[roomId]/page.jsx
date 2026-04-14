"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { AIHintBanner } from "../../../components/AIHintBanner";
import { ChatInput } from "../../../components/ChatInput";
import { ChatWindow } from "../../../components/ChatWindow";
import { ExportChatButton } from "../../../components/ExportChatButton";
import { ModelSelector } from "../../../components/ModelSelector";
import { PersonaSelector } from "../../../components/PersonaSelector";
import { PresenceSidebar } from "../../../components/PresenceSidebar";
import { ShareRoomButton } from "../../../components/ShareRoomButton";
import { SummaryButton } from "../../../components/SummaryButton";
import { Toast } from "../../../components/Toast";
import { UserHeader } from "../../../components/UserHeader";
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
  const [roomDisplayName, setRoomDisplayName] = useState(roomId);
  const [roomTopic, setRoomTopic] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const storedName = window.localStorage.getItem("aurachat:name");
    const fallback = `Guest-${Math.floor(Math.random() * 900 + 100)}`;
    const nextName = storedName || fallback;
    setUsername(nextName);
    window.localStorage.setItem("aurachat:name", nextName);
    
    // Get display name from localStorage
    const displayName = window.localStorage.getItem("aurachat:room-display-name");
    if (displayName) {
      setRoomDisplayName(displayName);
    }

    // Get room topic if available
    const topic = window.localStorage.getItem("aurachat:room-topic");
    if (topic) {
      setRoomTopic(topic);
    }
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
    leaveRoom,
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
    <div className="min-h-screen px-3 py-3 sm:px-4 sm:py-4 md:px-6">
      <div className="mesh-background" />
      
      {/* User Header with Logout */}
      <UserHeader username={username} roomDisplayName={roomDisplayName} onLeaveRoom={leaveRoom} />

      <div className="print-only p-8">
        <h1>AuraChat - {roomDisplayName}</h1>
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
        {/* Header with Room Info */}
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel flex flex-col gap-3 rounded-[32px] px-4 py-3 sm:px-5 sm:py-4 md:gap-4"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            {/* Room Info */}
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.22em] text-accent/80 sm:text-sm">AuraChat Room</p>
              <div className="flex flex-col gap-1 sm:gap-2">
                <h1 
                  className="text-2xl font-bold text-text sm:text-3xl md:text-4xl break-words" 
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {roomDisplayName}
                </h1>
                {roomTopic && (
                  <div className="text-xs sm:text-sm">
                    <span className="inline-block rounded-lg bg-accent/20 px-2.5 py-1 text-accent font-medium">
                      {roomTopic}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted mt-2 sm:text-sm">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${status === "connected" ? "bg-green-400" : status === "connecting" ? "bg-yellow-400" : "bg-red-400"}`}></span>
                {status === "connected" ? "Connected live" : status === "connecting" ? "Connecting..." : "Disconnected"}
                {typingUsers.length > 0 ? ` • ${typingUsers.join(", ")} typing...` : ""}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <ModelSelector value={currentModel} onChange={changeModel} />
              <ShareRoomButton roomId={roomId} onCopied={showCopiedToast} />
            </div>
          </div>
        </motion.header>

        {connectionError ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100"
          >
            {connectionError}
          </motion.div>
        ) : null}

        <div className="grid flex-1 gap-3 sm:gap-4 md:grid-cols-[minmax(240px,1fr)] lg:grid-cols-[260px_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel flex flex-col gap-3 rounded-[28px] p-3 sm:rounded-[32px] sm:p-4 sm:gap-4"
          >
            <PresenceSidebar users={users} currentUsername={username} mentionPulseUsers={mentionPulseUsers} />
            <div className="h-px bg-border/30" />
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
            className="glass-panel flex min-h-[60vh] sm:min-h-[70vh] flex-col gap-3 sm:gap-4 rounded-[28px] p-3 sm:rounded-[32px] sm:p-4"
          >
            {/* AI Hint Banner */}
            <AIHintBanner />

            {/* Chat Messages */}
            <ChatWindow
              messages={messages}
              currentUsername={username}
              isAiStreaming={isAiStreaming}
              onToggleReaction={(messageId, emoji, hasReacted) => toggleReaction({ messageId, emoji, hasReacted })}
            />

            {/* Chat Input */}
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

