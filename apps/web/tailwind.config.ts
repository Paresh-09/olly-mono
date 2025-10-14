import config from "@repo/ui/tailwind.config";

/** @type {import('tailwindcss').Config} */
const extendedConfig = {
  ...config,
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    ...config.theme,
    container: {
      ...config.theme?.container,
      extend: {
        ...config.theme?.container?.extend,
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic':
            'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        },
        keyframes: {
          ...config.theme?.extend?.keyframes,
          'border-flow': {
            '0%, 100%': {
              'background-size': '200% 200%',
              'background-position': 'left center'
            },
            '50%': {
              'background-size': '200% 200%',
              'background-position': 'right center'
            },
          },
          'gradient-x': {
            '0%, 100%': {
              'transform': 'translateX(0) rotate(0)',
              'opacity': '0.2'
            },
            '50%': {
              'transform': 'translateX(25%) rotate(12deg)',
              'opacity': '0.15'
            }
          },
          'gradient-y': {
            '0%, 100%': {
              'transform': 'translateY(0)',
              'opacity': '0.1'
            },
            '50%': {
              'transform': 'translateY(25%)',
              'opacity': '0.15'
            }
          }
        },
        animation: {
          ...config.theme?.extend?.animation,
          'border-flow': 'border-flow 4s ease infinite',
          'gradient-x': 'gradient-x 15s ease-in-out infinite',
          'gradient-y': 'gradient-y 10s ease-in-out infinite alternate'
        },
      },
    },
  },
};

export default extendedConfig;
