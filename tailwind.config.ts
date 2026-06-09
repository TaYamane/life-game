import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "dice-spin": "diceSpin 0.6s ease-in-out",
        "bounce-in": "bounceIn 0.4s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 2s ease-in-out infinite",
        "wiggle": "wiggle 0.3s ease-in-out",
      },
      keyframes: {
        diceSpin: {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "30%": { transform: "rotate(200deg) scale(1.3)" },
          "60%": { transform: "rotate(520deg) scale(0.8)" },
          "100%": { transform: "rotate(720deg) scale(1)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.2)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "80%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        slideUp: {
          "0%": { transform: "translateY(40px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
