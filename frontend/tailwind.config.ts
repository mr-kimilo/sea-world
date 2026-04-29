import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  corePlugins: {
    // Keep existing handcrafted CSS stable; we only use utility classes where opted-in.
    preflight: false,
  },
  plugins: [],
} satisfies Config;

