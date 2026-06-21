/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          black: "#1A1A1A",
          red: "#E85D3A",
          "red-hover": "#D14E2D",
          cream: "#FAF6F1",
          "cream-dark": "#F0EBE3",
          amber: "#D4940A",
          "amber-light": "#FFF7E0",
          green: "#2D8F4E",
          "green-light": "#E8F5ED",
        },
        spice: {
          0: "#9CA3AF",
          1: "#6BCB77",
          2: "#B8D435",
          3: "#FFD93D",
          4: "#FF8C32",
          5: "#E85D3A",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
