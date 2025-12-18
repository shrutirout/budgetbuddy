/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        success: '#34C759',
        warning: '#FF9500',
        danger: '#FF3B30',
        'secondary-bg': '#F2F2F7',
        'text-secondary': '#8E8E93',
        border: '#C6C6C8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
