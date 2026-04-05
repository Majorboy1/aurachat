"use client";

import { AnimatePresence, motion } from "framer-motion";

export function SummaryButton({ onSummarize, summaryState, onClose }) {
  const copySummary = async () => {
    await navigator.clipboard.writeText(summaryState.content || "");
  };

  return (
    <>
      <button
        onClick={onSummarize}
        className="w-full rounded-2xl border border-border bg-white/5 px-4 py-3 text-left text-sm font-medium text-text transition hover:border-accent/40 hover:bg-white/10"
      >
        Summarize Room
      </button>

      <AnimatePresence>
        {summaryState.isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="glass-panel w-full max-w-2xl rounded-[28px] p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-text" style={{ fontFamily: "var(--font-heading)" }}>
                    Room Summary
                  </h3>
                  <p className="text-sm text-muted">
                    {summaryState.isStreaming ? "Streaming summary..." : "Conversation recap"}
                  </p>
                </div>
                <button onClick={onClose} className="rounded-xl border border-border px-3 py-2 text-sm text-text">
                  Close
                </button>
              </div>
              <div className="min-h-[200px] rounded-3xl border border-border bg-black/20 p-4 text-sm leading-7 text-text">
                {summaryState.content || "The room summary will appear here."}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={copySummary}
                  className="rounded-2xl bg-accent px-4 py-2 text-sm font-medium text-black transition hover:bg-accent-hover"
                >
                  Copy Summary
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

