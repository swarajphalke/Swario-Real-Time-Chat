/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0c10",
        surface: "rgba(255,255,255,0.04)",
        border: "#2a2d38",
        accent: "#e8ff47",
        accent2: "#7c6af7",
      },
    },
  },
  plugins: [],
};
