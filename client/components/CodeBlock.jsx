"use client";

import { useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function buildSandboxDoc(code) {
  const escaped = code.replace(/<\/script>/gi, "<\\/script>");
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;font-family:system-ui;background:#0b0b10;color:#f0f0f5;">
    <div id="app" style="padding:12px 14px;font-size:14px;white-space:pre-wrap;"></div>
    <script>
      const output = document.getElementById('app');
      const write = (value) => {
        output.textContent += String(value) + '\\n';
      };
      const originalLog = console.log;
      console.log = (...args) => {
        write(args.map((item) => typeof item === 'object' ? JSON.stringify(item, null, 2) : item).join(' '));
        originalLog(...args);
      };
      window.onerror = (message) => {
        output.textContent += 'Error: ' + message;
      };
      try {
        ${escaped}
      } catch (error) {
        output.textContent += 'Error: ' + error.message;
      }
    </script>
  </body>
</html>`;
}

export function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);
  const [run, setRun] = useState(false);
  const isRunnable = (language || "").toLowerCase().startsWith("js") || language === "javascript";
  const sandboxDoc = useMemo(() => buildSandboxDoc(value), [value]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-[#0d0d13]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted">
        <span>{language || "text"}</span>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="rounded-xl border border-border px-3 py-1 text-[11px] text-text">
            {copied ? "Copied" : "Copy"}
          </button>
          {isRunnable ? (
            <button
              onClick={() => setRun((prev) => !prev)}
              className="rounded-xl border border-emerald-400/30 bg-accent/10 px-3 py-1 text-[11px] text-accent"
            >
              {run ? "Hide Run" : "Run"}
            </button>
          ) : null}
        </div>
      </div>
      <SyntaxHighlighter
        language={language || "javascript"}
        style={oneDark}
        customStyle={{ margin: 0, background: "transparent", padding: "1rem" }}
        codeTagProps={{ style: { fontFamily: "var(--font-code)" } }}
      >
        {value}
      </SyntaxHighlighter>
      {run && isRunnable ? (
        <div className="border-t border-border">
          <div className="px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted">Sandbox Output</div>
          <iframe
            title="sandbox"
            sandbox="allow-scripts"
            srcDoc={sandboxDoc}
            className="h-40 w-full border-0 bg-black"
          />
        </div>
      ) : null}
    </div>
  );
}

