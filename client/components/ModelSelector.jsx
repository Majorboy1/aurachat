"use client";

const MODELS = ["gpt-4o", "gpt-3.5-turbo"];

export function ModelSelector({ value, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-border bg-surface/70 px-3 py-2 text-sm text-muted">
      <span>Model</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-text outline-none"
      >
        {MODELS.map((model) => (
          <option key={model} value={model} className="bg-surface text-text">
            {model}
          </option>
        ))}
      </select>
    </label>
  );
}

