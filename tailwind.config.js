/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        heading: '#08085e',
        brand: {
          DEFAULT: '#08085e',
          50: '#eeeff8',
          100: '#d8d9ef',
        },
      },
      fontFamily: {
        display: ['madefor-display-bold', 'helveticaneuew10-65medi', 'sans-serif'],
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
