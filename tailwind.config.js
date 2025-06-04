/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "'Helvetica Neue'", "Arial", "'Apple SD Gothic Neo'", "'Noto Sans KR'", "'Malgun Gothic'", "'Apple Color Emoji'", "'Segoe UI Emoji'", "'Segoe UI Symbol'", "sans-serif"],
      },
      colors: {
        'bg-main': '#F9FAFB',
        'text-main': '#212529',
        'text-sub': '#495057',
        'btn-navy': '#1E1F23',
        'primary': {
          DEFAULT: '#3EBD93',
          90: '#37a882', // 90% opacity for hover (approximate)
        },
        'primary-dark': '#2ba471',
        'primary-light': '#5fd6ae',
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(33, 37, 41, 0.06)',
      },
      spacing: {
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
      },
    },
  },
  plugins: [],
};
