/** @type {import('tailwindcss').Config}
 *
 * Single source of truth for Tailwind compilation. The frontend (editor)
 * re-exports this config verbatim, so the editor preview, the opened LP
 * pages, and the deployed runtime all compile the exact same CSS.
 *
 * The globs are relative to whichever app runs the build (frontend or
 * deployment-runtime); both live in app/ and share the same layout, so each
 * glob resolves in both builds:
 *   - ./index.html + ./src        → the running app's own sources
 *   - ../static-websites          → the shared page-rendering components
 *   - ../frontend/src/config      → the generators whose default className
 *     strings end up stored inside page JSON (the JIT can't scan the
 *     database, so the vocabulary must be scanned at its source)
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../static-websites/components/**/*.{js,ts,jsx,tsx}",
    "../frontend/src/config/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        'profileContainer': '580px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    },
  ],
};
