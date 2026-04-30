"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function UserHeader({ username, roomDisplayName, onLeaveRoom }) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear user session from localStorage
    window.localStorage.removeItem("aurachat:name");
    window.localStorage.removeItem("aurachat:last-room");
    window.localStorage.removeItem("aurachat:room-display-name");
    
    // Leave room if callback provided
    if (onLeaveRoom) {
      onLeaveRoom();
    }
    
    // Redirect to home
    router.push("/");
  };

  const handleLeaveRoom = () => {
    // Leave room
    if (onLeaveRoom) {
      onLeaveRoom();
    }
    
    // Redirect to home
    router.push("/");
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className="fixed right-3 top-3 z-50 sm:right-4 sm:top-4 flex gap-2 sm:gap-3 flex-wrap justify-end"
    >
      <div className="glass-panel rounded-2xl px-3 py-2 sm:rounded-3xl sm:px-4 sm:py-3 flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.12em] text-accent/60 sm:text-xs">Logged in as</p>
          <p className="text-sm font-medium text-text sm:text-base truncate max-w-[150px] sm:max-w-[200px]">{username}</p>
        </div>
        <div className="flex gap-2">
          {onLeaveRoom && (
            <button
              onClick={handleLeaveRoom}
              className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-100 transition hover:bg-rose-500/30 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
              title="Leave this room and return to home"
            >
              Leave Room
            </button>
          )}
          <button
            onClick={handleLogout}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-text/70 transition hover:bg-white/20 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
            title="Logout and return to home"
          >
            Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
}
