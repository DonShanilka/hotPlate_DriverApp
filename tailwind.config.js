/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B35",
        secondary: "#2EC4B6",
        dark: "#1A1A1A",
        muted: "#8A8A8A",
        light: "#F7F7F7",
      },
    },
  },
  plugins: [],
};
