/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Um fundo escuro profundo, não 100% preto, para dar profundidade
        black: '#070709',
        white: '#FAFAFA',
        gray: {
          100: '#F3F4F6',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          800: '#1F2937',
          900: '#111827',
          950: '#0B0F19',
        },
        // A Paleta Neon
        neon: {
          red: '#FF2A2A',   // Vermelho alta rotação
          cyan: '#00F0FF',  // Ciano tecnológico
        }
      },
      fontFamily: {
        // O Minimalista/Leitura
        sans: ['Inter', 'sans-serif', 'system-ui'],
        // O Clássico/Luxo
        luxury: ['Cormorant Garamond', 'serif'],
        // O Moderno/Agressivo (Combina perfeitamente com a logo do TorqueGyn)
        display: ['Syncopate', 'sans-serif'],
      },
      boxShadow: {
        // Sombras que funcionam como luz
        'neon-red': '0 0 10px theme("colors.neon.red"), 0 0 30px theme("colors.neon.red")',
        'neon-cyan': '0 0 10px theme("colors.neon.cyan"), 0 0 30px theme("colors.neon.cyan")',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 1.2s ease-out forwards',
        'neon-flicker': 'neonFlicker 3s infinite alternate',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        neonFlicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.4' },
        }
      }
    },
  },
  plugins: [],
}