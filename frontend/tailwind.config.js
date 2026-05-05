/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // Isso garante que ele leia seus componentes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}