"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

export function ChatWindow({ messages, currentUsername, isAiStreaming, onToggleReaction }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-[32px] border border-dashed border-border bg-black/10 p-8 text-center text-muted">
        No messages yet. Start the room with a prompt and the AI will answer for everyone in real time.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto rounded-[32px] border border-border bg-black/10 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUsername={currentUsername}
            onToggleReaction={onToggleReaction}
          />
        ))}
        {isAiStreaming ? <TypingIndicator /> : null}
        <div ref={endRef} />
      </div>
    </div>
  );
}

