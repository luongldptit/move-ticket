import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchReviews,
  fetchMyReview,
  deleteReview,
  clearMyReviews,
} from '../../store/slices/reviewSlice'
import ReviewItem from './ReviewItem'
import ReviewForm from './ReviewForm'
import StarRating from './StarRating'
import { toast } from 'react-toastify'

export default function ReviewList({ movieId }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { byMovie, myReview, loading } = useSelector(s => s.reviews)
  const { user, isAuthenticated } = useSelector(s => s.auth)

  const reviewData = byMovie[movieId]
  const myCurrentReview = myReview[movieId]

  const [page, setPage] = useState(0)
  const [editingReview, setEditingReview] = useState(null)

  // Fetch all public reviews — always, for everyone
  useEffect(() => {
    dispatch(fetchReviews({ movieId, page, size: 10 }))
  }, [dispatch, movieId, page])

  // Fetch my review — only when logged in
  // Clear myReviews when user logs out so stale data doesn't filter public list
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyReview(movieId))
    } else {
      dispatch(clearMyReviews())
    }
  }, [dispatch, movieId, isAuthenticated])

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return
    const result = await dispatch(deleteReview({ reviewId, movieId }))
    if (!result.error) {
      toast.success('Đã xóa đánh giá')
      dispatch(fetchReviews({ movieId, page, size: 10 }))
    }
  }

  const handleEdit = (review) => {
    setEditingReview(review)
    const el = document.getElementById('review-form')
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
  }

  const totalElements = reviewData?.totalElements || 0
  const avgRating = reviewData?.content?.length > 0
    ? (reviewData.content.reduce((s, r) => s + r.rating, 0) / reviewData.content.length).toFixed(1)
    : null

  // Only exclude my review from the list when actually authenticated
  // (prevents stale cached review from hiding itself after logout)
  const otherReviews = (reviewData?.content || []).filter(
    r => !isAuthenticated || r.id !== myCurrentReview?.id
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Đánh giá & Bình luận</h2>
        {totalElements > 0 && avgRating && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(parseFloat(avgRating))} readOnly size="sm" />
            <span className="text-yellow-400 font-semibold">{avgRating}</span>
            <span className="text-dark-400 text-sm">({totalElements} đánh giá)</span>
          </div>
        )}
      </div>

      {/* ── Write / Edit section (logged in only) ── */}
      <div id="review-form" className="mb-8">
        {isAuthenticated ? (
          editingReview ? (
            // Editing an existing review
            <ReviewForm
              movieId={movieId}
              existingReview={editingReview}
              onCancel={() => {
                setEditingReview(null)
                dispatch(fetchReviews({ movieId, page, size: 10 }))
              }}
            />
          ) : myCurrentReview ? (
            // Already reviewed — show it with edit option
            <div className="bg-dark-800/40 rounded-2xl p-5 border border-dark-700">
              <div className="text-dark-400 text-sm mb-3">Đánh giá của bạn</div>
              <ReviewItem
                review={myCurrentReview}
                currentUser={user}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          ) : (
            // Logged in but haven't reviewed yet
            <ReviewForm movieId={movieId} />
          )
        ) : (
          // Guest — invite to login
          <div className="bg-dark-800/40 rounded-2xl p-5 border border-dark-700 text-center">
            <p className="text-dark-300 text-sm mb-3">Đăng nhập để viết đánh giá</p>
            <button
              onClick={() => navigate('/login', { state: { from: { pathname: window.location.pathname } } })}
              className="btn-primary px-6 py-2 text-sm"
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>

      {/* ── Review list (visible to everyone) ── */}
      {loading && !reviewData ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-dark-700 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : !reviewData?.content?.length ? (
        <div className="text-center py-10 text-dark-400">
          <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {otherReviews.map(r => (
              <ReviewItem
                key={r.id}
                review={r}
                currentUser={user}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>

          {reviewData.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: reviewData.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === i
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white border border-dark-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
