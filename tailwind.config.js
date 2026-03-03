/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        'logo-spin': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'logo-spin': 'logo-spin infinite 20s linear',
      },
      colors: {
        'header-gradient-from': '#172a74',
        'header-gradient-to': '#21a9af',
      },
    },
  },
  plugins: [],
}
