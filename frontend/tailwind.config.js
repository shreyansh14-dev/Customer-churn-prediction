/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1f1f1f',
        'pure-black': '#000000',
        bone: '#ffffff',
        'ash-grey': '#c9c9cd',
        mist: '#f7f7f7',
        brandSlate: '#717173',
        graphite: '#4c4c4c',
        'cobalt-blue': '#1227fd',
        'cobalt-light': '#6fa0ff',
      },
      fontFamily: {
        display: ['"DM Sans"', '"Aeonik Pro"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
        card: '22.5px',
        list: '20px',
        ctrl: '12px',
      },
      letterSpacing: {
        'display-xl': '-0.024em',
        'display-lg': '-0.015em',
        'display-md': '-0.010em',
        'body-tight': '-0.005em',
        'caps-loose': '+0.015em',
      },
      backgroundImage: {
        'cobalt-wash': 'linear-gradient(to right, rgb(18, 39, 253), rgb(111, 160, 255))',
      }
    },
  },
  plugins: [],
}
