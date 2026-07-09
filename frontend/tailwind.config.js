/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF7050',
        bg: '#14141F',
        card: '#1C1C2B',
        border: '#2A2A3A',
      },
      borderRadius: { xl: '20px' },
      fontFamily: { sans: ['Prompt', 'sans-serif'] }
    }
  },
  plugins: []
}
