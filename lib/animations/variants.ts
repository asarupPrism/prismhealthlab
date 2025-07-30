/**
 * Shared Animation Variants for Prism Health Lab
 * 
 * Standardized animation patterns to ensure consistency across components
 * and make cross-section tweaks trivial.
 */

import { Variants, Transition } from 'framer-motion'

// Base easing curves for medical/health brand feel
export const EASING = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  bounce: [0.68, -0.55, 0.265, 1.55],
  medical: [0.4, 0, 0.2, 1], // Material Design standard - professional feel
} as const

// Standard durations
export const DURATION = {
  fast: 0.3,
  medium: 0.6,
  slow: 0.8,
  xslow: 1.2,
} as const

// Base transitions
export const TRANSITIONS: Record<string, Transition> = {
  smooth: {
    type: 'tween',
    duration: DURATION.medium,
    ease: EASING.smooth,
  },
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  medical: {
    type: 'tween',
    duration: DURATION.medium,
    ease: EASING.medical,
  },
  bounce: {
    type: 'tween',
    duration: DURATION.slow,
    ease: EASING.bounce,
  },
}

// Core animation variants
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.smooth,
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: TRANSITIONS.fast,
  },
}

export const fadeDown: Variants = {
  hidden: {
    opacity: 0,
    y: -30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.smooth,
  },
  exit: {
    opacity: 0,
    y: 30,
    transition: TRANSITIONS.fast,
  },
}

export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: TRANSITIONS.smooth,
  },
  exit: {
    opacity: 0,
    transition: TRANSITIONS.fast,
  },
}

export const slideLeft: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.smooth,
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: TRANSITIONS.fast,
  },
}

export const slideRight: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.smooth,
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: TRANSITIONS.fast,
  },
}

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: TRANSITIONS.fast,
  },
}

// Container variants for staggered animations
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
}

// Medical/health specific animations
export const pulseGlow: Variants = {
  idle: {
    boxShadow: '0 0 0 0 rgba(6, 182, 212, 0.4)',
  },
  active: {
    boxShadow: [
      '0 0 0 0 rgba(6, 182, 212, 0.4)',
      '0 0 0 10px rgba(6, 182, 212, 0)',
      '0 0 0 0 rgba(6, 182, 212, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const healthProgress: Variants = {
  hidden: {
    width: 0,
    opacity: 0,
  },
  visible: {
    width: '100%',
    opacity: 1,
    transition: {
      width: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        duration: 1.5,
      },
      opacity: TRANSITIONS.smooth,
    },
  },
}

// Complex medical data reveal animation
export const medicalDataReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
      mass: 1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: TRANSITIONS.fast,
  },
}

// Hover and interaction variants
export const hoverScale: Variants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: TRANSITIONS.spring,
  },
  tap: {
    scale: 0.98,
    transition: TRANSITIONS.fast,
  },
}

export const hoverGlow: Variants = {
  rest: {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    boxShadow: '0 20px 25px -5px rgba(6, 182, 212, 0.2), 0 10px 10px -5px rgba(6, 182, 212, 0.1)',
    transition: TRANSITIONS.smooth,
  },
}

// Page transition variants
export const pageTransition: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...TRANSITIONS.smooth,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      ...TRANSITIONS.fast,
      when: 'afterChildren',
    },
  },
}

// Viewport-triggered animations with reduced motion support
export const createViewportVariant = (baseVariant: Variants, reducedMotion = false): Variants => {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.3 } },
    }
  }
  return baseVariant
}

// Export commonly used combinations
export const COMMON_VARIANTS = {
  heroSection: fadeUp,
  featureCard: scaleIn,
  textBlock: fadeUp,
  imageReveal: slideLeft,
  ctaButton: hoverScale,
  dataVisualization: medicalDataReveal,
  sectionContainer: staggerContainer,
} as const

// Animation presets for different sections
export const SECTION_PRESETS = {
  hero: {
    container: staggerContainer,
    title: fadeUp,
    subtitle: { ...fadeUp, transition: { ...TRANSITIONS.smooth, delay: 0.2 } },
    cta: { ...scaleIn, transition: { ...TRANSITIONS.spring, delay: 0.4 } },
  },
  features: {
    container: staggerContainerFast,
    card: medicalDataReveal,
    icon: pulseGlow,
  },
  testimonials: {
    container: fadeIn,
    card: slideRight,
  },
} as const