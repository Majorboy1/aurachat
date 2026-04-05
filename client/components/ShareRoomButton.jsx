"use client";

export function ShareRoomButton({ roomId, onCopied }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    onCopied();
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded-2xl border border-border bg-surface/70 px-4 py-2 text-sm font-medium text-text transition hover:border-accent/40 hover:bg-white/10"
    >
      Share Room
    </button>
  );
}

