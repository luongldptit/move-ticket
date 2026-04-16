import { useState } from 'react'
import { motion } from 'framer-motion'
import StarRating from './StarRating'
import { reviewItemVariants } from '../../utils/motion'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ngày trước`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} tháng trước`
  return `${Math.floor(months / 12)} năm trước`
}

export default function ReviewItem({ review, currentUser, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false)
  const isOwner = currentUser && currentUser.id === review.userId
  const isAdminOrStaff = currentUser && ['ADMIN', 'STAFF'].includes(currentUser.role)
  const canModify = isOwner
  const canDelete = isOwner || isAdminOrStaff
  const showActions = canModify || canDelete

  const initials = review.userFullName
    ? review.userFullName.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
    : '?'

  return (
    <motion.div
      layout
      variants={reviewItemVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="bg-dark-800/60 rounded-2xl p-4 border transition-all duration-200"
      style={{
        borderColor: hovered ? 'rgba(244,63,94,0.25)' : 'rgba(51,65,85,1)',
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #be123c, #7c3aed)',
              transition: 'box-shadow 0.2s',
              boxShadow: hovered ? '0 0 0 2px rgba(244,63,94,0.45)' : '0 0 0 0px rgba(244,63,94,0)',
            }}
          >
            {initials}
          </motion.div>
          <div>
            <div className="text-white text-sm font-medium">{review.userFullName}</div>
            <div className="text-dark-500 text-xs">{timeAgo(review.createdAt)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarRating value={review.rating} readOnly size="sm" />
          <motion.div
            className="flex gap-1"
            animate={{ opacity: hovered && showActions ? 1 : 0, x: hovered && showActions ? 0 : 6 }}
            transition={{ duration: 0.16 }}
          >
            {canModify && (
              <motion.button
                onClick={() => onEdit?.(review)}
                className="text-dark-400 hover:text-primary-400 text-xs px-2 py-1 rounded-lg hover:bg-primary-500/10 transition-colors"
                whileTap={{ scale: 0.92 }}
              >
                Sửa
              </motion.button>
            )}
            {canDelete && (
              <motion.button
                onClick={() => onDelete?.(review.id)}
                className="text-dark-400 hover:text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                whileTap={{ scale: 0.92 }}
              >
                Xóa
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      {review.comment && (
        <p className="text-dark-200 text-sm mt-3 leading-relaxed">{review.comment}</p>
      )}
    </motion.div>
  )
}
