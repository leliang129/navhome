/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: "#5C6AC4",
        accent: "#FFB347",
        surface: "#0F172A",
      },
      fontFamily: {
        sans: ["'HarmonyOS Sans'", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 25px -15px rgba(92, 106, 196, 0.65)",
      },
    },
  },
  plugins: [],
};
