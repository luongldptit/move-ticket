import { useState } from 'react'
import { motion } from 'framer-motion'

export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0)
  const [clicked, setClicked] = useState(null)

  const sizeClass = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size] || 'w-6 h-6'
  const display = readOnly ? value : (hovered || value)

  const handleClick = (star) => {
    if (readOnly) return
    onChange?.(star)
    setClicked(star)
    setTimeout(() => setClicked(null), 420)
  }

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= display
        const isClicked = clicked === star

        return (
          <motion.button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            className={readOnly ? 'cursor-default' : 'cursor-pointer'}
            whileHover={!readOnly ? { scale: 1.25 } : {}}
            whileTap={!readOnly ? { scale: 0.85 } : {}}
            animate={isClicked ? {
              scale: [1, 1.5, 0.85, 1.15, 1],
              transition: { duration: 0.38, times: [0, 0.25, 0.55, 0.75, 1] },
            } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            style={isActive && !readOnly ? {
              filter: hovered >= star
                ? 'drop-shadow(0 0 6px rgba(250,204,21,0.8))'
                : 'drop-shadow(0 0 2px rgba(250,204,21,0.3))',
            } : {}}
          >
            <svg
              className={`${sizeClass} transition-colors duration-150 ${isActive ? 'text-yellow-400' : 'text-dark-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </motion.button>
        )
      })}
    </div>
  )
}
