"use client";

import { useMemo } from "react";

const EMOJIS = ["👍", "❤️", "😂", "🔥", "🤯", "👀"];

export function MessageReactions({ reactions = {}, username, onToggle }) {
  const entries = useMemo(() => Object.entries(reactions).filter(([, users]) => users.length > 0), [reactions]);

  return (
    <div className="mt-3 space-y-2">
      <div className="opacity-0 transition group-hover:opacity-100">
        <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-border bg-surface/95 px-2 py-2">
          {EMOJIS.map((emoji) => {
            const hasReacted = (reactions[emoji] || []).includes(username);
            return (
              <button
                key={emoji}
                onClick={() => onToggle({ emoji, hasReacted })}
                className={`rounded-xl px-2 py-1 text-sm transition ${hasReacted ? "bg-accent/20" : "hover:bg-white/10"}`}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      </div>
      {entries.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {entries.map(([emoji, users]) => (
            <button
              key={emoji}
              onClick={() => onToggle({ emoji, hasReacted: users.includes(username) })}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                users.includes(username)
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-border bg-white/[0.03] text-text"
              }`}
            >
              {emoji} {users.length}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

