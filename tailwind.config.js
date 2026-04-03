/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf9ec',
          100: '#faf0cc',
          200: '#f4de95',
          300: '#edc85b',
          400: '#e6b332',
          500: '#d4981a',
          600: '#b87b14',
          700: '#935e13',
          800: '#784b15',
          900: '#643f17',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
