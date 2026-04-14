"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

export function ChatInput({ users, onSend, onTypingStart, onTypingStop, disabled, currentUsername }) {
  const [value, setValue] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  const filteredUsers = useMemo(() => {
    const query = mentionQuery.toLowerCase();
    return users.filter(
      (user) => user.username !== currentUsername && user.username.toLowerCase().includes(query),
    );
  }, [currentUsername, mentionQuery, users]);

  useEffect(() => () => window.clearTimeout(typingTimeoutRef.current), []);

  const handleTyping = (nextValue) => {
    setValue(nextValue);
    onTypingStart();
    window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => onTypingStop(), 1000);

    const cursor = textareaRef.current?.selectionStart ?? nextValue.length;
    const prefix = nextValue.slice(0, cursor);
    const match = prefix.match(/@([a-zA-Z0-9_-]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setShowMentions(true);
    } else {
      setMentionQuery("");
      setShowMentions(false);
    }
  };

  const insertMention = (username) => {
    const cursor = textareaRef.current?.selectionStart ?? value.length;
    const prefix = value.slice(0, cursor).replace(/@([a-zA-Z0-9_-]*)$/, `@${username} `);
    const suffix = value.slice(cursor);
    const nextValue = `${prefix}${suffix}`;
    setValue(nextValue);
    setShowMentions(false);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }

    onSend(trimmed);
    setValue("");
    setShowMentions(false);
    onTypingStop();
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showMentions && filteredUsers.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-[calc(100%+0.75rem)] left-0 z-20 max-h-48 w-full max-w-xs overflow-y-auto rounded-3xl border border-border bg-surface p-2 shadow-2xl sm:w-72"
          >
            {filteredUsers.map((user) => (
              <button
                key={user.username}
                onClick={() => insertMention(user.username)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-text transition hover:bg-white/10"
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: user.color }} />
                <span>@{user.username}</span>
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="rounded-[32px] border border-border bg-surface/85 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            rows={3}
            value={value}
            disabled={disabled}
            onChange={(event) => handleTyping(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder={disabled ? "AI is thinking..." : "Message the room. Use @ to mention someone."}
            className="min-h-[96px] flex-1 resize-none rounded-[24px] border border-border bg-black/15 px-4 py-3 text-text outline-none transition focus:border-accent focus:shadow-[0_0_0_1px_rgba(110,231,183,0.35),0_0_30px_rgba(110,231,183,0.22)]"
          />
          <button
            onClick={submit}
            disabled={disabled}
            className="flex h-auto min-w-[60px] items-center justify-center rounded-[24px] bg-accent px-4 text-xl text-black transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

