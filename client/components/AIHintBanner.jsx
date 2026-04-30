"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const AI_TIPS = [
  {
    title: "Chat with Everyone",
    description: "Type normally to discuss with people in the room. Regular messages do not auto-trigger AI.",
    example: '"This is a great idea!"',
  },
  {
    title: "Ask the AI",
    description: "Click Ask AI to tag your message when you want an AI response in the room.",
    example: '"What do you think about this?"',
  },
  {
    title: "@mention Users",
    description: "Type @ to mention someone specific in the room.",
    example: '"@Sarah what do you think?"',
  },
  {
    title: "React to Messages",
    description: "Hover over any message and click an emoji to react.",
    example: '"Thumbs up, heart, laugh"',
  },
];

export function AIHintBanner({ aiAvailability }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFallback = aiAvailability?.mode === "fallback";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel rounded-[20px] p-3 sm:rounded-[24px] sm:p-4 ${
        isFallback
          ? "border border-amber-300/40 bg-amber-400/10"
          : "border border-accent/30 bg-accent/10"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-3 text-left transition hover:opacity-80"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-lg flex-shrink-0">AI</span>
          <div className="min-w-0">
            <p className={`text-xs font-semibold sm:text-sm ${isFallback ? "text-amber-100" : "text-accent"}`}>
              {isFallback ? "AI unavailable -> using fallback" : "How to use the discussion and AI"}
            </p>
            <p className={`text-xs ${isFallback ? "text-amber-100/80" : "text-accent/70"}`}>
              {aiAvailability?.message || "Regular discussion first, AI replies on request"}
            </p>
          </div>
        </div>
        <span className={`flex-shrink-0 transition ${isExpanded ? "rotate-180" : ""} ${isFallback ? "text-amber-100" : "text-accent"}`}>v</span>
      </button>

      {isExpanded ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 space-y-3 border-t border-accent/20 pt-4"
        >
          {AI_TIPS.map((tip) => (
            <div key={tip.title} className="rounded-lg bg-white/5 p-3">
              <p className="mb-1 text-xs font-medium text-text sm:text-sm">{tip.title}</p>
              <p className="mb-2 text-xs text-muted">{tip.description}</p>
              <div className="text-xs italic text-accent/60">Example: {tip.example}</div>
            </div>
          ))}

          <div className={`mt-3 rounded-lg p-3 ${isFallback ? "border border-amber-300/40 bg-amber-400/15" : "border border-accent/30 bg-accent/20"}`}>
            <p className={`mb-1 text-xs font-medium sm:text-sm ${isFallback ? "text-amber-100" : "text-accent"}`}>About AI Responses</p>
            <p className={`text-xs ${isFallback ? "text-amber-100/85" : "text-accent/80"}`}>
              When you click Ask AI, the platform sends that message to Aura AI for a reply. Every AI response is
              labeled so people in the room can clearly see it came from the assistant.
            </p>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
