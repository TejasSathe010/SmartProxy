/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],  theme: {
    extend: {
      colors: {
        primary: '#FF5A5F', // Airbnb Red
        secondary: '#00A699', // Airbnb Teal
        gray: {
          light: '#F7F7F7',
          DEFAULT: '#484848',
          dark: '#222222',
        },
      },
    },
  },
  plugins: [],
}

