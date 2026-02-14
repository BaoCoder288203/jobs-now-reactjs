/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#81d1f3',
          dark: '#5bb8e8',
          light: '#a8dcf6',
        },
        accent: {
          DEFAULT: '#6EE7B7',
          dark: '#34D399',
          light: '#A7F3D0',
        }
      }
    },
  },
  plugins: [],
};
