"use client";

import { AnimatePresence, motion } from "framer-motion";

export function PresenceSidebar({ users, currentUsername, mentionPulseUsers }) {
  return (
    <div className="rounded-3xl border border-border bg-black/10 p-4">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-text">Presence</p>
          <p className="text-xs text-muted">{users.length} in room</p>
        </div>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {users.map((user) => (
            <motion.div
              key={user.username}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between rounded-2xl border border-border/70 bg-white/[0.03] px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <motion.span
                  animate={
                    mentionPulseUsers.includes(user.username)
                      ? { scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }
                      : { scale: 1, opacity: 1 }
                  }
                  transition={{ duration: 0.5 }}
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-sm text-text">{user.username}</span>
              </div>
              {user.username === currentUsername ? <span className="text-xs text-accent">You</span> : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

