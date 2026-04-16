import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { createReview, updateReview, clearReviewError } from '../../store/slices/reviewSlice'
import StarRating from './StarRating'
import { toast } from 'react-toastify'
import { slideDown, easeOut } from '../../utils/motion'

export default function ReviewForm({ movieId, existingReview, onCancel }) {
  const dispatch = useDispatch()
  const { loading, error } = useSelector(s => s.reviews)

  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearReviewError())
    }
  }, [error, dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      toast.warning('Vui lòng chọn số sao')
      return
    }

    const action = existingReview
      ? updateReview({ reviewId: existingReview.id, movieId, rating, comment })
      : createReview({ movieId, rating, comment })

    const result = await dispatch(action)
    if (!result.error) {
      toast.success(existingReview ? 'Cập nhật đánh giá thành công' : 'Đánh giá thành công')
      onCancel?.()
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={slideDown}
      initial="hidden"
      animate="show"
      transition={easeOut}
      className="bg-dark-800 rounded-2xl p-5 border border-dark-700"
    >
      <h3 className="text-white font-semibold mb-4">
        {existingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}
      </h3>

      <div className="mb-4">
        <div className="text-dark-400 text-sm mb-2">Đánh giá</div>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="mb-4">
        <div className="text-dark-400 text-sm mb-2">
          Bình luận <span className="text-dark-500">({comment.length}/2000)</span>
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={2000}
          rows={4}
          placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
          className="w-full bg-dark-900 border rounded-xl px-4 py-3 text-white text-sm placeholder-dark-500 focus:outline-none resize-none transition-all duration-200"
          style={{
            borderColor: focused ? 'rgba(244,63,94,0.6)' : 'rgba(71,85,105,1)',
            boxShadow: focused ? '0 0 0 3px rgba(244,63,94,0.12)' : 'none',
          }}
        />
      </div>

      <div className="flex gap-3">
        <motion.button
          type="submit"
          disabled={loading || rating === 0}
          whileHover={!loading && rating > 0 ? { scale: 1.03, y: -1 } : {}}
          whileTap={!loading && rating > 0 ? { scale: 0.97 } : {}}
          className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 btn-ripple"
        >
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          )}
          {loading ? 'Đang gửi...' : existingReview ? 'Cập nhật' : 'Gửi đánh giá'}
        </motion.button>
        {onCancel && (
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-2.5 text-sm text-dark-300 hover:text-white border border-dark-600 rounded-xl transition-colors"
          >
            Hủy
          </motion.button>
        )}
      </div>
    </motion.form>
  )
}
