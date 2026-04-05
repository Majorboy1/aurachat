"use client";

import { AnimatePresence, motion } from "framer-motion";

export function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-400/30 bg-surface/95 px-4 py-3 text-sm text-text shadow-glow"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

