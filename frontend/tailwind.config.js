/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        desk: 'var(--desk)',
        paper: 'rgb(var(--paper-rgb) / <alpha-value>)',
        soft: 'var(--soft)',
        line: 'rgb(var(--line-rgb) / <alpha-value>)',
        fg: 'var(--fg)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
        danger: 'var(--danger)',
        titlebar: '#FF9A3C',
        ink: '#1B1B1B',
        mint: '#A9E8A4',
        butter: '#FFE580',
        lilac: '#CDB8F7',
        tangerine: '#FFB36B',
        coral: '#FF7B6B',
      },
      fontFamily: {
        display: ['Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        hard: '4px 4px 0 0 var(--shadow)',
        'hard-lg': '6px 6px 0 0 var(--shadow)',
        'hard-sm': '2px 2px 0 0 var(--shadow)',
      },
    },
  },
  plugins: [],
}
