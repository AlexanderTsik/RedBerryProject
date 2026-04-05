/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand (Indigo scale from Figma — labeled "Brand Yellow" but is actually indigo)
        primary: {
          50:  '#EEEDFC',
          100: '#DDDBFA',
          200: '#B7B3F4',
          300: '#958FEF',
          400: '#736BEA',
          DEFAULT: '#4F46E5',  // 500
          600: '#281ED2',
          700: '#1E169D',
          800: '#130E67',
          900: '#0A0836',
          950: '#05041B',
        },

        // Greyscale
        grey: {
          50:  '#FFFFFF',
          100: '#F5F5F5',
          200: '#D1D1D1',
          300: '#ADADAD',
          400: '#8A8A8A',
          500: '#666666',
          600: '#525252',
          700: '#3D3D3D',
          800: '#292929',
          900: '#141414',
          950: '#0A0A0A',
        },

        // Semantic / Helper colors
        error: {
          DEFAULT: '#F4161A',
          light: '#F66466',
        },
        warning: '#F4A316',
        success: {
          DEFAULT: '#1DC31D',
          light: 'rgba(29, 195, 29, 0.1)',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        // Display
        'display-xl': ['48px', { fontWeight: '700', lineHeight: 'auto' }],
        // Headings
        'h1': ['40px', { fontWeight: '600', lineHeight: 'auto' }],
        'h2': ['32px', { fontWeight: '600', lineHeight: 'auto' }],
        'h3': ['24px', { fontWeight: '600', lineHeight: 'auto' }],
        'h4': ['20px', { fontWeight: '600', lineHeight: '24px' }],
        'h5': ['16px', { fontWeight: '600', lineHeight: 'auto' }],
        // Body
        'body-xl-light': ['24px', { fontWeight: '300', lineHeight: 'auto' }],
        'body-xl': ['24px', { fontWeight: '500', lineHeight: 'auto' }],
        'body-l': ['20px', { fontWeight: '500', lineHeight: 'auto' }],
        'body-m': ['18px', { fontWeight: '500', lineHeight: 'auto' }],
        'body-m-regular': ['18px', { fontWeight: '400', lineHeight: 'auto' }],
        'body-s': ['16px', { fontWeight: '500', lineHeight: 'auto' }],
        'body-xs': ['14px', { fontWeight: '500', lineHeight: 'auto' }],
        // Helper / Micro
        'helper-m': ['12px', { fontWeight: '500', lineHeight: 'auto' }],
        'helper-regular-m': ['14px', { fontWeight: '400', lineHeight: 'auto' }],
        'helper-regular-s': ['12px', { fontWeight: '400', lineHeight: 'auto' }],
        'helper-regular-xs': ['10px', { fontWeight: '400', lineHeight: 'auto' }],
        // Underlined
        'underlined-m': ['20px', { fontWeight: '500', lineHeight: 'auto' }],
        'underlined-s': ['14px', { fontWeight: '500', lineHeight: 'auto' }],
        // Buttons
        'btn-m': ['20px', { fontWeight: '500', lineHeight: 'auto' }],
        'btn-s': ['16px', { fontWeight: '500', lineHeight: '24px' }],
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
