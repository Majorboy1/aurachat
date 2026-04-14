"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "./CodeBlock";
import { MessageReactions } from "./MessageReactions";

function renderMentions(text) {
  const parts = text.split(/(@[a-zA-Z0-9_-]+)/g);
  return parts.map((part, index) =>
    part.startsWith("@") ? (
      <span key={`${part}-${index}`} className="font-medium text-accent">
        {part}
      </span>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

export function MessageBubble({ message, currentUsername, onToggleReaction }) {
  const isAi = message.role === "assistant";
  const isAskingAI = message.isAskingAI === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group rounded-[24px] border border-border bg-white/[0.03] p-3 sm:rounded-[28px] sm:p-4"
    >
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3 sm:gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl text-xs font-semibold text-black sm:h-9 sm:w-9 sm:text-sm"
            style={{ backgroundColor: message.color || "#6ee7b7" }}
          >
            {(message.username || "A")[0]?.toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="truncate text-xs font-semibold text-text sm:text-sm">{message.username}</span>
              {message.username === currentUsername && !isAi ? <span className="flex-shrink-0 text-xs text-accent">You</span> : null}
              {isAskingAI && !isAi && (
                <span className="inline-flex items-center gap-1 flex-shrink-0 bg-accent/30 text-accent text-xs px-2 py-0.5 rounded-full font-medium border border-accent/50">
                  <span>❓</span>
                  <span>Asking AI</span>
                </span>
              )}
            </div>
            <span className="text-xs text-muted">{new Date(message.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {isAi ? (
        <div className="markdown-body text-sm leading-7 text-text">
          <ReactMarkdown
            components={{
              code({ inline, className, children }) {
                const match = /language-(\w+)/.exec(className || "");
                const value = String(children).replace(/\n$/, "");
                if (inline) {
                  return <code className="rounded bg-white/10 px-1.5 py-0.5">{value}</code>;
                }
                return <CodeBlock language={match?.[1]} value={value} />;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="whitespace-pre-wrap text-sm leading-7 text-text">{renderMentions(message.content || "")}</div>
      )}

      <MessageReactions
        reactions={message.reactions}
        username={currentUsername}
        onToggle={({ emoji, hasReacted }) => onToggleReaction(message.id, emoji, hasReacted)}
      />
    </motion.div>
  );
}

