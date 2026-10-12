/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── MargDrishti design tokens ──────────────────────────────────────
        // Semantic surface / structural
        "road-charcoal":  "#202B35",
        "light-canvas":   "#F3F6F8",
        "light-surface":  "#FFFFFF",
        "light-border":   "#DCE3E8",

        // Status semantic colors (WCAG AA against their surfaces)
        "signal-green":   "#176B4A",
        "signal-amber":   "#B66A00",
        "signal-red":     "#B42318",

        // Dark-theme surface scale (charcoal family)
        dark: {
          bg:        "#141D24",   // page background in dark
          surface:   "#202B35",   // card / panel surface (road charcoal)
          elevated:  "#28363F",   // elevated card / popover
          border:    "#364654",   // border on dark surfaces
          muted:     "#4B6074",   // disabled / placeholder text
          subtle:    "#7A96AD",   // secondary text
          primary:   "#D2E3ED",   // primary text
          emphasis:  "#FFFFFF",   // max-contrast heading
        },

        // Light-theme surface scale
        light: {
          bg:        "#F3F6F8",
          surface:   "#FFFFFF",
          elevated:  "#FFFFFF",
          border:    "#DCE3E8",
          muted:     "#90A4B0",
          subtle:    "#4E6372",
          primary:   "#1C2B36",
          emphasis:  "#0D1820",
        },

        // Legacy signal aliases kept for existing components
        signal: {
          red:    "#ef4444",
          yellow: "#eab308",
          green:  "#22c55e",
        },
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "monospace"],
      },

      boxShadow: {
        card:    "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-md": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)",
        "dark-card": "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)",
      },

      transitionDuration: {
        sidebar: "220ms",
        theme:   "180ms",
      },
    },
  },
  plugins: [],
};
