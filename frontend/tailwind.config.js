/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Cricket green palette
        pitch: {
          900: '#0D3B1A',
          800: '#1B5E20',
          700: '#2E7D32',
          600: '#388E3C',
          500: '#43A047',
          400: '#66BB6A',
          300: '#A5D6A7',
          100: '#E8F5E9',
          50:  '#F1F8F2',
        },
        // Cricket gold / ball seam
        gold: {
          600: '#D97706',
          500: '#F59E0B',
          400: '#FBBF24',
          100: '#FEF3C7',
          50:  '#FFFBEB',
        },
        // Neutral
        ink: {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          600: '#4B5563',
          500: '#6B7280',
          400: '#9CA3AF',
          300: '#D1D5DB',
          200: '#E5E7EB',
          100: '#F3F4F6',
          50:  '#F9FAFB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
