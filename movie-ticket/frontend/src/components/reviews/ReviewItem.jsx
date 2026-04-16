import StarRating from './StarRating'

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
  const isOwner = currentUser && currentUser.id === review.userId
  const isAdminOrStaff = currentUser && ['ADMIN', 'STAFF'].includes(currentUser.role)
  const canModify = isOwner
  const canDelete = isOwner || isAdminOrStaff

  const initials = review.userFullName
    ? review.userFullName.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
    : '?'

  return (
    <div className="bg-dark-800/60 rounded-2xl p-4 border border-dark-700">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="text-white text-sm font-medium">{review.userFullName}</div>
            <div className="text-dark-500 text-xs">{timeAgo(review.createdAt)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarRating value={review.rating} readOnly size="sm" />
          {canModify && (
            <button
              onClick={() => onEdit?.(review)}
              className="text-dark-400 hover:text-primary-400 text-xs transition-colors px-2 py-1"
            >
              Sửa
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete?.(review.id)}
              className="text-dark-400 hover:text-red-400 text-xs transition-colors px-2 py-1"
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      {review.comment && (
        <p className="text-dark-200 text-sm mt-3 leading-relaxed">{review.comment}</p>
      )}
    </div>
  )
}
