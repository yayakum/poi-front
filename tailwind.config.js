/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          emerald: {
            600: '#128C7E',  // WhatsApp green color
            700: '#0c6b5e',  // Darker green for hover states
          },
        },
        width: {
          '3/10': '30%',
        },
      },
    },
    plugins: [],
  }