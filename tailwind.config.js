/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Design tokens — update these once Figma colors/fonts are confirmed
      colors: {
        primary: {
          DEFAULT: '#6C5CE7',
          hover: '#5A4BD1',
          light: '#EDE9FF',
        },
        accent: '#00CEC9',
        success: '#00B894',
        warning: '#FDCB6E',
        danger: '#D63031',
        neutral: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#6C757D',
          700: '#495057',
          800: '#343A40',
          900: '#212529',
        },
      },
      fontFamily: {
        // Update with actual Figma font once confirmed
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1920px',
      },
      screens: {
        '2xl': '1920px',
      },
    },
  },
  plugins: [],
}
