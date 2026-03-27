import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { bookingApi } from '../../api/bookingApi'
import { clearBooking } from '../../store/slices/bookingSlice'
import { PageLoader } from '../../components/common/Spinner'
import { formatPrice, formatDateTime } from '../../utils/helpers'
import { QRCode } from 'react-qr-code'

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status = searchParams.get('status')
  const bookingId = searchParams.get('bookingId')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(!!bookingId)

  useEffect(() => {
    dispatch(clearBooking())
    if (bookingId) {
      bookingApi.getBookingById(bookingId)
        .then(r => setBooking(r.data.data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [bookingId])

  if (loading) return <PageLoader />

  if (status === 'FAILED' || !booking) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">❌</div>
          <h1 className="text-2xl font-bold text-white mb-3">Thanh toán thất bại</h1>
          <p className="text-dark-400 mb-8">Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(-2)} className="btn-primary">Thử lại</button>
            <Link to="/" className="btn-secondary">Về trang chủ</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-lg mx-auto px-4">
        {/* Success banner */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Đặt vé thành công!</h1>
          <p className="text-dark-400 mt-2">Vé của bạn đã được xác nhận</p>
        </div>

        {/* Ticket card */}
        <div className="card overflow-hidden animate-slide-up">
          {/* Movie header */}
          <div className="bg-gradient-to-r from-primary-900/40 to-dark-800 p-5 border-b border-dark-700">
            <div className="text-white font-bold text-xl">{booking.showtime?.movieTitle}</div>
            <div className="text-dark-300 text-sm mt-1">
              {formatDateTime(booking.showtime?.startTime)} · {booking.showtime?.roomName} · {booking.showtime?.cinemaName}
            </div>
          </div>

          {/* Ticket body */}
          <div className="p-5">
            {/* Booking code */}
            <div className="bg-dark-800 rounded-xl p-4 text-center mb-5">
              <div className="text-dark-400 text-xs mb-1">Mã vé</div>
              <div className="text-primary-400 font-mono font-bold text-2xl tracking-widest">{booking.bookingCode}</div>
            </div>

            {/* QR Code */}
            {(booking.qrCode || booking.bookingCode) && (
              <div className="flex justify-center mb-5">
                <div className="bg-white p-4 rounded-2xl">
                  <QRCode value={booking.qrCode || booking.bookingCode} size={160} />
                </div>
              </div>
            )}

            {/* Seats */}
            <div className="mb-4">
              <div className="text-dark-400 text-xs mb-2">Ghế ngồi</div>
              <div className="flex flex-wrap gap-2">
                {(booking.seats || []).map(s => (
                  <span key={s.seatCode} className="bg-dark-800 border border-dark-600 text-white text-sm px-3 py-1 rounded-lg">
                    {s.seatCode} ({s.type})
                  </span>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-dark-700 pt-4 space-y-1.5 text-sm">
              {booking.discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Đã giảm giá</span>
                  <span>- {formatPrice(booking.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span className="text-dark-400">Đã thanh toán</span>
                <span className="text-white text-base">{formatPrice(booking.finalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Phương thức</span>
                <span className="text-white">{booking.payment?.method || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Link to="/bookings" className="btn-secondary flex-1 text-center">Lịch sử vé</Link>
          <Link to="/" className="btn-primary flex-1 text-center">Về trang chủ</Link>
        </div>
      </div>
    </div>
  )
}
