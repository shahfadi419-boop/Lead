/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9fb',
          100: '#ddf2f7',
          200: '#bee6ef',
          300: '#8ed2e4',
          400: '#55b8d5',
          500: '#2BBFDD', // Extracted official LeadHive AI Hex
          600: '#1ea0be',
          700: '#1a7f98',
          800: '#1c667a',
          900: '#1b5465',
          950: '#0c3643',
        },
        channel: {
          facebook: '#1877F2',
          youtube: '#FF0000',
          whatsapp: '#25D366',
          tiktok: '#000000',
          tiktokCyan: '#00F2FE',
          tiktokRed: '#FE2C55',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'brand': '0 10px 25px -5px rgba(43, 191, 221, 0.25)',
      }
    },
  },
  plugins: [],
}

