/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Enable dark mode via class switching
  theme: {
    extend: {
      // Add custom transition properties
      transitionProperty: {
        'width': 'width',
        'margin': 'margin',
        'transform': 'transform'
      },
      // Add custom spacing if needed
      spacing: {
        'sidebar-collapsed': '5rem',
        'sidebar-expanded': '20rem'
      },
      // Custom container queries (optional)
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Optional - if you use form elements
    require('@tailwindcss/typography'), // Optional - for better typography
  ],
}