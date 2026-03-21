import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ["'Press Start 2P'", "monospace"],
      },
      colors: {
        mario: {
          red: "#e52521",
          blue: "#049cd8",
          yellow: "#fbd000",
          green: "#43b047",
          sky: "#5c94fc",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
