"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

export function ChatInput({ users, onSend, onTypingStart, onTypingStop, disabled, currentUsername }) {
  const [value, setValue] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [isAskingAI, setIsAskingAI] = useState(false);
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

    onSend(trimmed, { isAskingAI });
    setValue("");
    setShowMentions(false);
    setIsAskingAI(false);
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

      <div className="rounded-[24px] border border-border bg-surface/85 p-2 shadow-[0_20px_80px_rgba(0,0,0,0.28)] sm:rounded-[32px] sm:p-3">
        <div className="space-y-2 sm:space-y-2.5">
          <div className="flex gap-2 sm:gap-3">
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
              placeholder={disabled ? "🤖 AI is thinking..." : "💬 Message the room. Use @ to mention. Click [Ask AI] for AI response."}
              className="min-h-[80px] w-full resize-none rounded-[20px] border border-border bg-black/15 px-3 py-2 text-xs text-text outline-none transition focus:border-accent focus:shadow-[0_0_0_1px_rgba(110,231,183,0.35),0_0_30px_rgba(110,231,183,0.22)] sm:min-h-[96px] sm:rounded-[24px] sm:px-4 sm:py-3 sm:text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => setIsAskingAI(!isAskingAI)}
              disabled={disabled || !value.trim()}
              className={`flex items-center gap-2 flex-shrink-0 rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition ${
                isAskingAI
                  ? "bg-accent/30 border border-accent text-accent"
                  : "bg-white/10 border border-white/20 text-text/70 hover:text-text hover:bg-white/15"
              } disabled:cursor-not-allowed disabled:opacity-40`}
              title="Click to ask the AI - it will prioritize your question"
            >
              <span>❓</span>
              <span>Ask AI</span>
              {isAskingAI && <span className="text-accent">✓</span>}
            </button>

            <div className="flex-1" />

            <button
              onClick={submit}
              disabled={disabled || !value.trim()}
              className="flex h-auto items-center justify-center rounded-lg sm:rounded-xl bg-accent px-3 py-2 text-lg text-black font-medium transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:py-2.5 sm:text-xl"
              title={isAskingAI ? "Send question to AI" : "Send message to room"}
            >
              {isAskingAI ? "❓" : "↑"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

