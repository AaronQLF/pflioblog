/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#FF6B00", // Orange color matching Alex Carter's site
        secondary: "#333333",
        light: "#f8f8f8",
      },
      fontFamily: {
        sans: [
          "-apple-system", 
          "BlinkMacSystemFont", 
          "SF Pro Display", 
          "SF Pro Text", 
          "Helvetica Neue", 
          "sans-serif"
        ],
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}; 