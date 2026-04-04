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
        // Palette rose InstantMariage — #F06292 comme couleur principale (pink-500)
        pink: {
          50:  '#fef1f6',
          100: '#fce4ed',
          200: '#f9c5db',
          300: '#f59dbe',
          400: '#f27fab',
          500: '#F06292',
          600: '#d44878',
          700: '#b0355f',
          800: '#8c2649',
          900: '#6a1c35',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
