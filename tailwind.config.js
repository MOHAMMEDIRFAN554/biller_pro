/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
            DEFAULT: "#10B981", // Emerald 500
            hover: "#059669",
            light: "#D1FAE5"
        },
        secondary: {
            DEFAULT: "#1E293B", // Slate 800
            hover: "#334155"
        },
        background: "#0F172A", // Slate 900 (Dark theme base)
        surface: "#1E293B", // Slate 800 (Card bg)
        border: "#334155",
        text: {
            primary: "#F8FAFC",
            secondary: "#94A3B8",
            muted: "#64748B"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
