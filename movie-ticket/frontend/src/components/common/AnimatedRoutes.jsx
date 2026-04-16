import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { pageVariants } from '../../utils/motion'

/**
 * Wraps children with AnimatePresence so route changes get enter/exit animations.
 * Usage: replace <Routes> in App.jsx with <AnimatedRoutes>{routes}</AnimatedRoutes>
 */
export default function AnimatedRoutes({ children }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100vh' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
