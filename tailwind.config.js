/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './*.{ts,tsx}', './components/**/*.{ts,tsx}', './services/**/*.{ts,tsx}'],
  // Classes assembled dynamically in JS strings must be listed here if they
  // are not written out in full in the sources. Currently none; the
  // GameOverlay ternary uses complete class names, which the scanner finds.
  safelist: [],
  theme: { extend: {} },
  plugins: [],
};
