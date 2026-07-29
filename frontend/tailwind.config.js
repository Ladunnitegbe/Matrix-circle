/**
 * FoodShare — Tailwind theme, derived from the Figma design-system
 * export (colors, buttons, inputs, typography sheets).
 *
 * ASSUMPTIONS MADE — flagged here, not silently baked in. Confirm
 * with design before treating these as final:
 *
 * 1. PRIMARY vs SECONDARY color scales — the Figma color sheet shows
 *    two ramps both labeled "Grey" with no direct label tying either
 *    to "Primary" or "Secondary." Structural read used here:
 *      - Ramp A (light greys → near-black by "Normal") is mapped to
 *        `secondary`, since its Normal value (#1a1a1a) matches the
 *        Secondary swatch.
 *      - Ramp B (near-white → mid-grey) is mapped to `primary`, since
 *        its Normal value (#faf9f6) matches the cream Primary swatch.
 *    This means `secondary`'s own "light" steps double as the app's
 *    general-purpose neutral/grey scale (borders, dividers, muted
 *    surfaces) — that's a common pattern, but unconfirmed here.
 *
 * 2. Font family — the typography sheet shows only a type scale, not
 *    a named typeface. Falling back to a system-ui stack as a
 *    placeholder until the real family is confirmed.
 *
 * 3. Font weight numeric values — sheet names Regular/Medium/Bold with
 *    no numeric weights given. Mapped to the standard 400/500/700.
 *
 * 4. Line heights — not present anywhere in the provided exports.
 *    Values below are a reasonable proposed scale (tighter for large
 *    display sizes, looser for body/caption), not extracted from Figma.
 *
 * 5. Border radius — only buttons (full pill) and inputs (moderate
 *    rounding) are visually inferable. No card/modal/badge radius was
 *    given. `input`/`sm`/`md` below are visual estimates, not measured.
 *
 * 6. Shadows — no elevation/shadow sheet was provided at all. Left as
 *    Tailwind's own defaults; nothing custom added or guessed.
 *
 * 7. Spacing scale — no spacing sheet was provided. Left as Tailwind's
 *    default 4px-based scale; nothing custom added or guessed.
 *
 * 8. Breakpoints — none defined in the Figma exports. `tablet`/`desktop`
 *    below are carried over from this project's own existing responsive
 *    scaffolding (ScreenContainer/BottomNav), not from Figma. Tailwind's
 *    default screens (sm/md/lg/xl/2xl) are left untouched alongside them.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // --- Primary (cream) — Figma "Grey" ramp B ---
        primary: {
          light: '#fffefe',
          'light-hover': '#fefefe',
          'light-active': '#fdfdfc',
          DEFAULT: '#faf9f6',
          normal: '#faf9f6',
          'normal-hover': '#e1e0dd',
          'normal-active': '#c8c7c5',
          dark: '#bcbbb9',
          'dark-hover': '#969594',
          'dark-active': '#70706f',
          darker: '#585756',
        },
        // --- Secondary (near-black) — Figma "Grey" ramp A ---
        // Also doubles as the app's general neutral/grey scale
        // (borders, dividers, muted surfaces) — see assumption #1 above.
        secondary: {
          light: '#e8e8e8',
          'light-hover': '#dddddd',
          'light-active': '#b8b8b8',
          DEFAULT: '#1a1a1a',
          normal: '#1a1a1a',
          'normal-hover': '#171717',
          'normal-active': '#151515',
          dark: '#141414',
          'dark-hover': '#101010',
          'dark-active': '#0c0c0c',
          darker: '#090909',
        },
        // --- Accent: Orange — fully labeled in Figma, no assumptions ---
        accent: {
          orange: {
            light: '#fcefed',
            'light-hover': '#fae6e3',
            'light-active': '#f5ccc6',
            DEFAULT: '#e05a47',
            normal: '#e05a47',
            'normal-hover': '#ca5140',
            'normal-active': '#b34839',
            dark: '#a84435',
            'dark-hover': '#86362b',
            'dark-active': '#652820',
            darker: '#4e1f19',
          },
          // --- Accent: Green — fully labeled in Figma, no assumptions ---
          green: {
            light: '#edf2ee',
            'light-hover': '#e4ebe6',
            'light-active': '#c7d6cc',
            DEFAULT: '#4a7c59',
            normal: '#4a7c59',
            'normal-hover': '#437050',
            'normal-active': '#3b6347',
            dark: '#385d43',
            'dark-hover': '#2c4a35',
            'dark-active': '#213828',
            darker: '#1a2b1f',
          },
        },
        // --- Semantic aliases (built from the scales above, kept in
        // one place so components never reach for a raw shade name) ---
        surface: '#faf9f6', // primary.normal
        'surface-sunk': '#e1e0dd', // primary.normal-hover
        border: '#dddddd', // secondary.light-hover
        ink: '#1a1a1a', // secondary.normal
        'ink-muted': '#70706f', // primary.dark-active
        'ink-faint': '#969594', // primary.dark-hover
        danger: '#e05a47', // accent.orange.normal — no distinct red/error
        // hue was given; error states in Figma reuse accent orange.
      },

      fontFamily: {
        // Placeholder — see assumption #2. Swap once the real family
        // is confirmed; every component should reference `font-sans`
        // rather than a hardcoded family, so this is a one-line fix.
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },

      fontSize: {
        // [fontSize, { lineHeight }] — line-heights are proposed
        // defaults, not extracted (see assumption #4).
        h1: ['3.75rem', { lineHeight: '1.1' }], // 60px
        h2: ['3rem', { lineHeight: '1.15' }], // 48px
        h3: ['2.5rem', { lineHeight: '1.2' }], // 40px
        h4: ['2rem', { lineHeight: '1.25' }], // 32px
        sh1: ['1.5rem', { lineHeight: '1.3' }], // 24px
        sh2: ['1.25rem', { lineHeight: '1.35' }], // 20px
        body1: ['1rem', { lineHeight: '1.5' }], // 16px
        body2: ['0.875rem', { lineHeight: '1.5' }], // 14px
        caption: ['0.75rem', { lineHeight: '1.4' }], // 12px
      },

      fontWeight: {
        // Sheet names Regular/Medium/Bold — see assumption #3.
        regular: '400',
        medium: '500',
        bold: '700',
      },

      lineHeight: {
        // Free-standing scale for cases not tied to a fontSize pairing
        // above. Proposed, not extracted — see assumption #4.
        tight: '1.1',
        snug: '1.25',
        normal: '1.5',
        relaxed: '1.65',
      },

      borderRadius: {
        // Buttons: confirmed full-pill from the buttons sheet.
        // Everything else is a visual estimate — see assumption #5.
        sm: '10px',
        md: '12px',
        lg: '16px',
        input: '10px',
        pill: '9999px',
      },

      screens: {
        // Carried over from this project's existing responsive
        // scaffolding, not from Figma — see assumption #8.
        // Named to match the three target tiers: mobile (base,
        // unprefixed) / tablet / laptop.
        tablet: '720px',
        laptop: '1100px',
      },

      keyframes: {
        // Powers the indeterminate state of the `Loading` component —
        // a sliding bar segment, used when a real progress percentage
        // isn't known (e.g. "Finding available food nearby…", where
        // there's no actual numeric progress to report).
        'loading-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      animation: {
        'loading-bar': 'loading-bar 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
