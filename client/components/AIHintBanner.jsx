"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const AI_TIPS = [
  {
    title: "💬 Chat with Everyone",
    description: "Type normally to chat with people in the room",
    example: '"This is a great idea!"'
  },
  {
    title: "❓ Ask the AI",
    description: "Click the [Ask AI] button to tag your message for the AI to respond",
    example: '"What do you think about this?"'
  },
  {
    title: "@mention Users",
    description: "Type @ to mention someone specific in the room",
    example: '"@Sarah what do you think?"'
  },
  {
    title: "😊 React to Messages",
    description: "Hover over any message and click emoji to react",
    example: '"👍 ❤️ 😂"'
  },
];

export function AIHintBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-[20px] border border-accent/30 bg-accent/10 p-3 sm:rounded-[24px] sm:p-4"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left flex items-center justify-between gap-3 hover:opacity-80 transition"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">💡</span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-accent font-semibold">How to chat with the AI</p>
            <p className="text-xs text-accent/70">Click to expand tips</p>
          </div>
        </div>
        <span className={`flex-shrink-0 text-accent transition transform ${isExpanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 space-y-3 border-t border-accent/20 pt-4"
        >
          {AI_TIPS.map((tip, index) => (
            <div key={index} className="rounded-lg bg-white/5 p-3">
              <p className="text-xs sm:text-sm font-medium text-text mb-1">{tip.title}</p>
              <p className="text-xs text-muted mb-2">{tip.description}</p>
              <div className="text-xs text-accent/60 italic">Example: {tip.example}</div>
            </div>
          ))}
          
          <div className="rounded-lg bg-accent/20 border border-accent/30 p-3 mt-3">
            <p className="text-xs sm:text-sm font-medium text-accent mb-1">🤖 About AI Responses</p>
            <p className="text-xs text-accent/80">
              When you click [Ask AI], the AI prioritizes your question and responds directly. 
              Regular chat messages are visible to everyone but the AI may not always respond.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
