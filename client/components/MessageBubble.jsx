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

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group rounded-[28px] border border-border bg-white/[0.03] p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-semibold text-black"
            style={{ backgroundColor: message.color || "#6ee7b7" }}
          >
            {(message.username || "A")[0]?.toUpperCase()}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text">{message.username}</span>
              {message.username === currentUsername && !isAi ? <span className="text-xs text-accent">You</span> : null}
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

