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
        // Also doubles as the app's neutral/grey scale.
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

        // --- Accent colours ---
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

        // --- Semantic aliases ---
        surface: '#faf9f6',
        'surface-sunk': '#e1e0dd',
        border: '#dddddd',
        ink: '#1a1a1a',
        'ink-muted': '#70706f',
        'ink-faint': '#969594',
        danger: '#e05a47',
      },

      fontFamily: {
        // Reference `font-sans` throughout the app.
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },

      fontSize: {
        h1: ['3.75rem', { lineHeight: '1.1' }],
        h2: ['3rem', { lineHeight: '1.15' }],
        h3: ['2.5rem', { lineHeight: '1.2' }],
        h4: ['2rem', { lineHeight: '1.25' }],
        sh1: ['1.5rem', { lineHeight: '1.3' }],
        sh2: ['1.25rem', { lineHeight: '1.35' }],
        body1: ['1rem', { lineHeight: '1.5' }],
        body2: ['0.875rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4' }],
      },

      fontWeight: {
        regular: '400',
        medium: '500',
        bold: '700',
      },

      lineHeight: {
        tight: '1.1',
        snug: '1.25',
        normal: '1.5',
        relaxed: '1.65',
      },

      borderRadius: {
        sm: '10px',
        md: '12px',
        lg: '16px',
        input: '10px',
        pill: '9999px',
      },

      screens: {
        tablet: '720px',
        laptop: '1100px',
      },

      keyframes: {
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