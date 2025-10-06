/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Paleta BulonScan - Basada en el logo
        primary: {
          cyan: '#06ebfe',      // Cyan brillante (principal)
          navy: '#001f3c',      // Azul oscuro (fondos, texto)
          blue: '#4e91d0',      // Azul medio (acciones)
          light: '#f2f5f7',     // Gris claro (fondos suaves)
          royal: '#253f80',     // Azul royal (acentos)
        },
        // Colores de acero/hierro para contexto industrial
        steel: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#0d1117',
        },
        // Colores funcionales mejorados
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06ebfe',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'tool': '0 4px 6px -1px rgba(0, 31, 60, 0.1), 0 2px 4px -1px rgba(0, 31, 60, 0.06)',
        'tool-lg': '0 10px 15px -3px rgba(0, 31, 60, 0.1), 0 4px 6px -2px rgba(0, 31, 60, 0.05)',
        'inner-light': 'inset 0 2px 4px 0 rgba(0, 31, 60, 0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #06ebfe 0%, #4e91d0 50%, #253f80 100%)',
        'gradient-navy': 'linear-gradient(135deg, #001f3c 0%, #253f80 100%)',
        'gradient-steel': 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
