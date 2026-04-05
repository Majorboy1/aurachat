/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        surface: "#111118",
        border: "#1e1e2e",
        accent: "#6ee7b7",
        "accent-hover": "#34d399",
        text: "#f0f0f5",
        muted: "#8888aa",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(110, 231, 183, 0.35), 0 0 24px rgba(110, 231, 183, 0.16)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -12px, 0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(110, 231, 183, 0.18), 0 0 0 rgba(110, 231, 183, 0)" },
          "50%": { boxShadow: "0 0 0 1px rgba(110, 231, 183, 0.48), 0 0 28px rgba(110, 231, 183, 0.28)" },
        },
        mesh: {
          "0%": { transform: "translate3d(-10%, -8%, 0) scale(1)" },
          "50%": { transform: "translate3d(8%, 10%, 0) scale(1.08)" },
          "100%": { transform: "translate3d(-10%, -8%, 0) scale(1)" },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        mesh: "mesh 20s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

