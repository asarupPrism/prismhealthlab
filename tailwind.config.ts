import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Medical device and touch-optimized breakpoints
      screens: {
        'xs': '360px',     // Small mobile devices
        'sm': '640px',     // Standard mobile
        'md': '768px',     // Tablets and large mobile
        'lg': '1024px',    // Desktop
        'xl': '1280px',    // Large desktop
        '2xl': '1536px',   // Extra large
        // Medical device specific breakpoints
        'mobile-xs': {'max': '359px'},
        'mobile-sm': {'min': '360px', 'max': '639px'},
        'mobile-lg': {'min': '640px', 'max': '767px'},
        'tablet-sm': {'min': '768px', 'max': '1023px'},
        'tablet-lg': {'min': '1024px', 'max': '1279px'},
        // Touch-first breakpoints
        'touch': {'raw': '(hover: none) and (pointer: coarse)'},
        'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
        // High density displays
        'retina': {'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'},
      },
      
      // Medical color palette for dark theme
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Medical interface colors
        medical: {
          cyan: {
            50: '#ecfeff',
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
          },
          blue: {
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
          },
          emerald: {
            400: '#34d399',
            500: '#10b981',
            600: '#059669',
          },
          amber: {
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
          },
          rose: {
            400: '#fb7185',
            500: '#f43f5e',
            600: '#e11d48',
          },
        },
      },
      
      // Fluid typography for medical data
      fontSize: {
        // Responsive text sizes using clamp()
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 2.5rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.9rem + 1.75vw, 3rem)',
        // Medical data display sizes
        'medical-tiny': 'clamp(0.625rem, 0.6rem + 0.125vw, 0.75rem)',
        'medical-data': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'medical-label': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'medical-value': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'medical-heading': 'clamp(1.5rem, 1.3rem + 1vw, 2rem)',
      },
      
      // Container query utilities
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          xs: '0.75rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '3rem',
        },
        screens: {
          xs: '360px',
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
      
      // Touch-optimized spacing
      spacing: {
        'touch-xs': '0.75rem',   // 12px
        'touch-sm': '1rem',      // 16px
        'touch-md': '1.5rem',    // 24px
        'touch-lg': '2rem',      // 32px
        'touch-xl': '2.75rem',   // 44px - minimum touch target
        'touch-2xl': '3.5rem',   // 56px - comfortable touch target
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      
      // Animation and interaction improvements
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      
      // Medical-grade shadows and effects
      boxShadow: {
        'medical-sm': '0 1px 3px 0 rgba(6, 182, 212, 0.1), 0 1px 2px 0 rgba(6, 182, 212, 0.06)',
        'medical-md': '0 4px 6px -1px rgba(6, 182, 212, 0.1), 0 2px 4px -1px rgba(6, 182, 212, 0.06)',
        'medical-lg': '0 10px 15px -3px rgba(6, 182, 212, 0.1), 0 4px 6px -2px rgba(6, 182, 212, 0.05)',
        'medical-glow': '0 0 20px rgba(6, 182, 212, 0.3)',
        'touch-press': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      },
      
      // Enhanced backdrop blur for glass morphism
      backdropBlur: {
        'medical': '12px',
      },
      
      // Medical grid patterns
      gridTemplateColumns: {
        'medical-1': 'repeat(1, minmax(0, 1fr))',
        'medical-2': 'repeat(2, minmax(0, 1fr))',
        'medical-3': 'repeat(3, minmax(0, 1fr))',
        'medical-auto': 'repeat(auto-fit, minmax(280px, 1fr))',
        'medical-touch': 'repeat(auto-fit, minmax(320px, 1fr))',
      },
      
      // Medical border radius for modern interface
      borderRadius: {
        'medical': '0.75rem',
        'medical-lg': '1rem',
        'medical-xl': '1.25rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
};

export default config;