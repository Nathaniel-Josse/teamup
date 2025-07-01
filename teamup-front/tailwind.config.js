/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'madimi-one': ['var(--font-madimi-one)', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'button-primary': 'var(--button-primary)',
        'page-background': 'var(--page-background)',
      },
    },
  },
};