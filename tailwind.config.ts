/* eslint-disable @typescript-eslint/no-require-imports */
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
        // Premium lime system (see DESIGN.md): four roles. Theme-aware values
        // come from the CSS variables in globals.css (:root dark, .light).
        background: {
          DEFAULT: "var(--canvas)", // Page
          light: "#FAFAF9",
          dark: "#14161B",
        },
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "var(--surface)", // Card
          highlight: "var(--surface-raised)", // Modal, popover, menu
        },
        // The old purple/pink "primary" and "secondary" now point at the one
        // supporting accent, periwinkle. Lime is the brand: `accent` below.
        primary: {
          DEFAULT: "#5C62D6", // Periwinkle solid (white text 5.0:1)
          glow: "var(--periwinkle)", // Periwinkle as text/icon
          foreground: "#ffffff",
          dark: "#3F45B0",
        },
        secondary: {
          DEFAULT: "var(--periwinkle)",
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
          DEFAULT: "#C4E85A", // Brand lime: primary actions, active, selected
          foreground: "#0B0C0F",
        },
        periwinkle: {
          DEFAULT: "var(--periwinkle)", // Supporting accent, used sparingly
          solid: "#5C62D6",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          light: "#FFFFFF",
          dark: "#14161B",
        },
        text: {
          main: {
            DEFAULT: "var(--color-white)", // Ink: white on dark, #15171C in light
            light: "#15171C",
            dark: "#F3F4F6",
          },
          muted: {
            DEFAULT: "#A9AFBB", // Secondary text
            alpha: "rgba(255, 255, 255, 0.6)",
          },
          sub: {
            light: "#545B67",
            dark: "#A9AFBB",
          },
        },
        success: "var(--accent-text)", // Success reads as lime
        warning: "var(--warning)",
        error: "var(--error)",
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
        // Glows are retired: flat surfaces, depth from layers. Kept as names
        // so existing classes resolve to nothing instead of breaking.
        glow: "none",
        "glow-accent": "none",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")],
};
