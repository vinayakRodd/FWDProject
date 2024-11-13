/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      boxShadow: {
        'custom-blue': ' 0 4px 7px 0 rgba(0, 0, 0, 0.11), 0 6px 15px 0 rgba(0, 0, 0, 0.19)'
      },
      clipPath: {
        'cut-corner': 'polygon(0 0, 100% 0, 100% 80%, 20% 100%, 0 100%)',
      },
    },

    keyframes: {
      slideDown: {
        '0%': { transform: 'translateY(-100%)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(0)', opacity: '1' },
        '100%': { transform: 'translateY(-100%)', opacity: '0' },
      },
    },
    animation: {
      'slide-down': 'slideDown 0.5s ease-out forwards',
      'slide-up': 'slideUp 0.5s ease-out forwards',
    },
  },
  plugins: [],
}

