import type { Config } from "tailwindcss";

/**
 * Палитра близка к sot.kg:
 * — ссылки/акцент синий #3c5ec7
 * — золото меню #ffc000
 * — фон белый / светло-серый
 * — текст #333
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        court: {
          navy: "#1e3a6e",
          deep: "#152a52",
          blue: "#3c5ec7",
          mid: "#4a6fd0",
          light: "#eef2fb",
          mist: "#f4f5f7",
          gold: "#ffc000",
          goldSoft: "#e6ac00",
          goldPale: "#fff8e0",
          red: "#c41e3a",
          ink: "#333333",
          muted: "#666666",
          line: "#e0e0e0",
          success: "#2e7d32",
          warn: "#b26a00",
          danger: "#c62828",
          footer: "#2a2a2a",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-roboto)",
          "Roboto",
          "Segoe UI",
          "Tahoma",
          "Arial",
          "sans-serif",
        ],
        display: [
          "var(--font-roboto)",
          "Roboto",
          "Segoe UI",
          "Tahoma",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        sot: "1170px",
      },
      boxShadow: {
        card: "none",
        panel: "0 1px 3px rgba(0,0,0,.08)",
      },
    },
  },
  plugins: [],
};

export default config;
