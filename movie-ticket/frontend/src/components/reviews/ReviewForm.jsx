import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createReview, updateReview, clearReviewError } from '../../store/slices/reviewSlice'
import StarRating from './StarRating'
import { toast } from 'react-toastify'

export default function ReviewForm({ movieId, existingReview, onCancel }) {
  const dispatch = useDispatch()
  const { loading, error } = useSelector(s => s.reviews)

  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')

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
    <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl p-5 border border-dark-700">
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
          maxLength={2000}
          rows={4}
          placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
          className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang gửi...' : existingReview ? 'Cập nhật' : 'Gửi đánh giá'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm text-dark-300 hover:text-white border border-dark-600 rounded-xl transition-colors"
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  )
}
