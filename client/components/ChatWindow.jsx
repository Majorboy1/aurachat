"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

function formatDayLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ChatWindow({ messages, currentUsername, isAiStreaming, onToggleReaction }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-[32px] border border-dashed border-border bg-black/10 p-8 text-center text-muted">
        No messages yet. Start the discussion with the room, then use Ask AI when you want a clearly labeled AI reply.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto rounded-[32px] border border-border bg-black/10 p-4">
      <div className="space-y-4">
        {messages.map((message, index) => {
          const previousMessage = messages[index - 1];
          const showDayDivider =
            !previousMessage || formatDayLabel(previousMessage.timestamp) !== formatDayLabel(message.timestamp);

          return (
            <div key={message.id} className="space-y-4">
              {showDayDivider ? (
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                    {formatDayLabel(message.timestamp)}
                  </span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>
              ) : null}
              <MessageBubble
                message={message}
                currentUsername={currentUsername}
                onToggleReaction={onToggleReaction}
              />
            </div>
          );
        })}
        {isAiStreaming ? <TypingIndicator /> : null}
        <div ref={endRef} />
      </div>
    </div>
  );
}
