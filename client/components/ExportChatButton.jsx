"use client";

import { useState } from "react";

function toMarkdown(messages) {
  return messages
    .map(
      (message) =>
        `## ${message.username} (${new Date(message.timestamp).toLocaleString()})\n\n${message.content}\n`,
    )
    .join("\n");
}

export function ExportChatButton({ messages, roomId }) {
  const [open, setOpen] = useState(false);

  const downloadMarkdown = () => {
    const blob = new Blob([toMarkdown(messages)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${roomId}-chat.md`;
    link.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const downloadPdf = () => {
    window.print();
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-2xl border border-border bg-white/5 px-4 py-3 text-left text-sm font-medium text-text transition hover:border-accent/40 hover:bg-white/10"
      >
        Export Chat
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.6rem)] z-20 w-full rounded-2xl border border-border bg-surface p-2 shadow-2xl">
          <button
            onClick={downloadMarkdown}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-text transition hover:bg-white/10"
          >
            Download as Markdown
          </button>
          <button
            onClick={downloadPdf}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-text transition hover:bg-white/10"
          >
            Download as PDF
          </button>
        </div>
      ) : null}
    </div>
  );
}

