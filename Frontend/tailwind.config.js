/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:     '#1A3C6E',   // Navy Blue — headings, logo, primary actions
        interactive: '#2563EB',   // Royal Blue — hover states, links
        accent:      '#F0A500',   // Amber Gold — highlights, badges
        'text-body': '#4B5563',   // Slate Gray — body copy
        'dark-bg':   '#111827',   // Dark Navy-Gray — dark mode base
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '88rem',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out both',
        'slide-in-bottom': 'slideInFromBottom 0.3s ease-out both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInFromBottom: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;