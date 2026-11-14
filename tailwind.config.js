/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens that need opacity variants: store as RGB channels so Tailwind v3
        // can generate bg-primary/20, hover:bg-primary/90, divide-border/50, etc.
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'var(--color-surface)',
        surfaceHighlight: 'rgb(var(--color-surfaceHighlight) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        primaryHover: 'rgb(var(--color-primaryHover) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        textMain: 'var(--color-textMain)',
        textMuted: 'var(--color-textMuted)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
