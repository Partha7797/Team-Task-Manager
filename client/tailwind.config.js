export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18212f',
        mist: '#eef2f7',
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
          950: '#022c22'
        }
      },
      boxShadow: {
        soft: '0 18px 45px rgba(23, 31, 42, 0.08)'
      }
    }
  },
  plugins: []
};
