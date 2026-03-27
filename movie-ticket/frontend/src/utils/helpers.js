/**
 * Format price in VND
 */
export const formatPrice = (amount) => {
  if (!amount && amount !== 0) return '0đ'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

/**
 * Format datetime to Vietnamese locale
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    month: '2-digit',
    day: '2-digit',
  })
}

export const formatTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Booking status configs
 */
export const BOOKING_STATUS = {
  PENDING: { label: 'Chờ thanh toán', color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  EXPIRED: { label: 'Hết hạn', color: 'bg-dark-500/20 text-dark-400 border border-dark-500/30' },
}

export const PAYMENT_STATUS = {
  PENDING: { label: 'Chờ thanh toán', color: 'bg-yellow-500/20 text-yellow-400' },
  SUCCESS: { label: 'Thành công', color: 'bg-green-500/20 text-green-400' },
  FAILED: { label: 'Thất bại', color: 'bg-red-500/20 text-red-400' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-blue-500/20 text-blue-400' },
}

export const MOVIE_STATUS = {
  NOW_SHOWING: { label: 'Đang chiếu', color: 'bg-green-500/20 text-green-400' },
  COMING_SOON: { label: 'Sắp chiếu', color: 'bg-blue-500/20 text-blue-400' },
  STOPPED: { label: 'Đã dừng', color: 'bg-dark-500/20 text-dark-400' },
}

export const AGE_RATING = {
  P: { label: 'P', color: 'bg-green-600', title: 'Phổ biến mọi lứa tuổi' },
  C13: { label: 'C13', color: 'bg-yellow-600', title: 'Từ 13 tuổi trở lên' },
  C16: { label: 'C16', color: 'bg-orange-600', title: 'Từ 16 tuổi trở lên' },
  C18: { label: 'C18', color: 'bg-red-700', title: 'Từ 18 tuổi trở lên' },
}

/**
 * Get today's date in yyyy-MM-dd format
 */
export const getTodayStr = () => {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get next N days
 */
export const getNextNDays = (n = 7) => {
  const days = []
  for (let i = 0; i < n; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

/**
 * Format day label for date picker
 */
export const formatDayLabel = (dateStr) => {
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  if (d.getTime() === today.getTime()) return 'Hôm nay'
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (d.getTime() === tomorrow.getTime()) return 'Ngày mai'
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

/**
 * Get error message from axios error
 */
export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Có lỗi xảy ra, vui lòng thử lại'
}
