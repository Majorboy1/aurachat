"use client";

const PERSONAS = ["Default", "Developer", "Teacher", "Brainstorm"];

export function PersonaSelector({ value, onChange }) {
  return (
    <div className="space-y-2 rounded-3xl border border-border bg-black/10 p-4">
      <div>
        <p className="text-sm font-medium text-text">AI Persona</p>
        <p className="text-xs text-muted">Everyone in the room shares this persona.</p>
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-border bg-surface px-3 py-3 text-sm text-text outline-none transition focus:border-accent focus:shadow-glow"
      >
        {PERSONAS.map((persona) => (
          <option key={persona} value={persona}>
            {persona}
          </option>
        ))}
      </select>
    </div>
  );
}

