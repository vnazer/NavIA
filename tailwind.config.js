/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        mar: {
          50:  "#e6f1f7",
          100: "#cce3ef",
          500: "#0e6ba8",
          700: "#0a4d7a",
          900: "#062a45",
        },
      },
    },
  },
  plugins: [],
};
