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
export const easeOut = { type: 'tween', ease: 'easeOut', duration: 0.45 }
export const easeOutFast = { type: 'tween', ease: 'easeOut', duration: 0.28 }

// Page transition (wrap top-level page div)
export const pageTransition = {
  initial:   { opacity: 0, y: 12 },
  animate:   { opacity: 1, y: 0 },
  exit:      { opacity: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
}
