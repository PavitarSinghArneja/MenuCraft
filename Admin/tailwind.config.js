/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#3E2522',
        'secondary': '#8C6E63',
        'accent': '#D3A376',
        'light-accent': '#FFE0B2',
        'background-light': '#FFF2DF',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
