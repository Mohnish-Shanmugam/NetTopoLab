/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        mac: {
          blue: '#007AFF',
          green: '#28CD41',
          orange: '#FF9500',
          red: '#FF3B30',
          yellow: '#FFCC00',
          purple: '#AF52DE',
          indigo: '#5856D6',
          teal: '#59ADC4',
          gray: '#8E8E93',
          bgLight: '#ECECEC',
          canvasLight: '#FFFFFF',
          sidebarLight: '#F5F5F7',
          bgDark: '#1E1E1E',
          canvasDark: '#141414',
          sidebarDark: '#252526',
          borderLight: 'rgba(0, 0, 0, 0.1)',
          borderDark: 'rgba(255, 255, 255, 0.1)',
        }
      },
      boxShadow: {
        'mac-window': '0 20px 40px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.1)',
        'mac-popover': '0 8px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)',
        'mac-inner': 'inset 0 1px 1px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
