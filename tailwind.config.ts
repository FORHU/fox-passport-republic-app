/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  safelist: [
    {
      pattern: /^(from|to|via)-.+/,
      variants: ["hover", "focus"],
    },
    {
      pattern: /^bg-gradient-to-.+/,
    },
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "#02040a", // Deep navy/black
          light: "#fdf2f8",
          dark: "#1f1016",
        },
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "#0f111a", // Dark blue-gray
          highlight: "#1e2130", // Slightly lighter surface
        },
        primary: {
          DEFAULT: "#7c3aed", // Purple
          glow: "#8b5cf6", // Lighter purple
          foreground: "#ffffff",
          dark: "#be185d",
        },
        secondary: {
          DEFAULT: "#db2777", // Hot pink
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#ccff00", // Neon lime green - Primary CTA color
          foreground: "#000000",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          light: "#ffffff",
          dark: "#29151d",
        },
        text: {
          main: {
            DEFAULT: "#ffffff", // White
            light: "#1f1719",
            dark: "#fce7f3",
          },
          muted: {
            DEFAULT: "#94a3b8", // Light gray
            alpha: "rgba(255, 255, 255, 0.6)",
          },
          sub: {
            light: "#836a75",
            dark: "#ccb0bd",
          },
        },
        success: "#22c55e", // Green
        warning: "#eab308", // Yellow
        // Gamification colors
        "surface-highlight": "rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
        sans: [
          "Plus Jakarta Sans",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "pulse-slow": "pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        wiggle: "wiggle 0.5s ease-in-out infinite",
        glitch: "glitch 2s infinite",
        "spin-slow": "spin 12s linear infinite",
        fly: "fly 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
        fly: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(124, 58, 237, 0.5)",
        "glow-accent": "0 0 30px -5px rgba(204, 255, 0, 0.3)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")],
};
