// ─── Shared Framer Motion variants ───

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0 },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1 },
}

export const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  show:   { opacity: 1, x: 0 },
}

export const fadeRight = {
  hidden: { opacity: 0, x: 30 },
  show:   { opacity: 1, x: 0 },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show:   { opacity: 1, scale: 1 },
}

export const slideDown = {
  hidden: { opacity: 0, y: -20 },
  show:   { opacity: 1, y: 0 },
}

// Stagger container
export const staggerContainer = (stagger = 0.07, delayChildren = 0) => ({
  hidden: {},
  show:   { transition: { staggerChildren: stagger, delayChildren } },
})

// Child item (used inside staggerContainer)
export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

export const staggerItemLeft = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

// Default spring transition
export const spring = { type: 'spring', stiffness: 300, damping: 24 }
export const springBouncy = { type: 'spring', stiffness: 400, damping: 17 }
export const easeOut = { type: 'tween', ease: 'easeOut', duration: 0.45 }
export const easeOutFast = { type: 'tween', ease: 'easeOut', duration: 0.28 }

// Page transition (wrap top-level page div — legacy, use pageVariants for AnimatedRoutes)
export const pageTransition = {
  initial:   { opacity: 0, y: 12 },
  animate:   { opacity: 1, y: 0 },
  exit:      { opacity: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

// ─── Page variants (used in AnimatedRoutes with AnimatePresence) ───
export const pageVariants = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0,  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.22, ease: 'easeIn' } },
}

// ─── Modal variants ───
export const modalBackdrop = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.22 } },
  exit:   { opacity: 0, transition: { duration: 0.18 } },
}

export const modalPanel = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { type: 'spring', stiffness: 340, damping: 26 } },
  exit:   { opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.18, ease: 'easeIn' } },
}

// ─── Dropdown / mobile menu ───
export const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -8 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { type: 'spring', stiffness: 360, damping: 28 } },
  exit:   { opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.16, ease: 'easeIn' } },
}

export const mobileMenuVariants = {
  hidden: { opacity: 0, height: 0,      overflow: 'hidden' },
  show:   { opacity: 1, height: 'auto', overflow: 'hidden', transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, height: 0,      overflow: 'hidden', transition: { duration: 0.2,  ease: 'easeIn' } },
}

// ─── Star rating pop ───
export const starPop = {
  rest:    { scale: 1 },
  clicked: {
    scale: [1, 1.45, 0.9, 1.1, 1],
    transition: { duration: 0.4, times: [0, 0.3, 0.55, 0.75, 1] },
  },
}

// ─── Review item ───
export const reviewItemVariants = {
  hidden: { opacity: 0, x: -16, scale: 0.98 },
  show:   { opacity: 1, x: 0,   scale: 1,    transition: { type: 'spring', stiffness: 240, damping: 24 } },
  exit:   { opacity: 0, x: 16,  scale: 0.96, transition: { duration: 0.2 } },
}

// ─── Card hover preset (spread as whileHover prop) ───
export const cardHover = {
  scale: 1.03,
  y: -4,
  transition: { type: 'spring', stiffness: 340, damping: 22 },
}

// ─── Checkmark SVG draw ───
export const checkmarkDraw = {
  hidden: { pathLength: 0, opacity: 0 },
  show:   { pathLength: 1, opacity: 1, transition: { duration: 0.55, delay: 0.3, ease: 'easeOut' } },
}
