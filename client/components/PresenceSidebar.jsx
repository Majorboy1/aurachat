"use client";

import { AnimatePresence, motion } from "framer-motion";

export function PresenceSidebar({ users, currentUsername, mentionPulseUsers }) {
  return (
    <div className="rounded-2xl border border-border bg-black/10 p-3 sm:rounded-3xl sm:p-4">
      <div className="mb-3 flex items-end justify-between sm:mb-4">
        <div>
          <p className="text-xs font-medium text-text sm:text-sm">Presence</p>
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
              className="flex items-center justify-between rounded-xl border border-border/70 bg-white/[0.03] px-2 py-1.5 sm:rounded-2xl sm:px-3 sm:py-2"
            >
              <div className="min-w-0 flex items-center gap-2 sm:gap-3">
                <motion.span
                  animate={
                    mentionPulseUsers.includes(user.username)
                      ? { scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }
                      : { scale: 1, opacity: 1 }
                  }
                  transition={{ duration: 0.5 }}
                  className="h-2 w-2 flex-shrink-0 rounded-full sm:h-3 sm:w-3"
                  style={{ backgroundColor: user.color }}
                />
                <span className="truncate text-xs text-text sm:text-sm">{user.username}</span>
              </div>
              {user.username === currentUsername ? <span className="flex-shrink-0 text-xs text-accent">You</span> : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

