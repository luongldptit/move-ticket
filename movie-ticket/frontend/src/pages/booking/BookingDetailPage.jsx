import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { bookingApi } from '../../api/bookingApi'
import { paymentApi } from '../../api/paymentApi'
import { PageLoader } from '../../components/common/Spinner'
import { BOOKING_STATUS, PAYMENT_STATUS, formatPrice, formatDateTime, getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'
import { QRCode } from 'react-qr-code'

const PAYMENT_METHODS = [
  { value: 'VNPAY', label: 'VNPay', emoji: '💳' },
  { value: 'MOMO', label: 'MoMo', emoji: '📱' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản', emoji: '🏦' },
]

export default function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [payMethod, setPayMethod] = useState('VNPAY')
  const [paying, setPaying] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)

  const load = () => {
    bookingApi.getBookingById(id)
      .then(r => setBooking(r.data.data))
      .catch(() => navigate('/bookings'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleCancel = async () => {
    if (!confirm('Bạn chắc chắn muốn hủy vé này?')) return
    setCancelling(true)
    try {
      await bookingApi.cancelBooking(id)
      toast.success('Hủy vé thành công')
      setBooking(prev => ({ ...prev, status: 'CANCELLED' }))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  const handleRepay = async () => {
    setPaying(true)
    try {
      const payRes = await paymentApi.initiatePayment({ bookingId: booking.id, method: payMethod })
      const payment = payRes.data.data
      toast.info('Đang xử lý thanh toán...', { autoClose: 2000 })
      await new Promise(r => setTimeout(r, 2000))
      await paymentApi.paymentCallback({
        paymentId: payment.id,
        bookingId: booking.id,
        transactionId: `${payMethod}_TXN_${Date.now()}`,
        status: 'SUCCESS',
        amount: booking.finalAmount,
        signature: 'mock_signature',
      })
      toast.success('Thanh toán thành công!')
      setShowPayModal(false)
      navigate(`/payment/result?bookingId=${booking.id}&status=SUCCESS`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <PageLoader />
  if (!booking) return null

  const st = BOOKING_STATUS[booking.status] || {}
  const pst = PAYMENT_STATUS[booking.payment?.status] || {}
  const isPending = booking.status === 'PENDING'

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/bookings')} className="text-dark-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Chi tiết vé</h1>
          <span className={`badge-status ml-auto ${st.color}`}>{st.label}</span>
        </div>

        <div className="card overflow-hidden mb-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-900/40 to-dark-800 p-5 border-b border-dark-700">
            <div className="text-xl font-bold text-white">{booking.showtime?.movieTitle}</div>
            <div className="text-dark-300 text-sm mt-1">
              {formatDateTime(booking.showtime?.startTime)} · {booking.showtime?.roomName} · {booking.showtime?.cinemaName}
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Booking code */}
            <div className="bg-dark-800 rounded-xl p-4 text-center">
              <div className="text-dark-400 text-xs mb-1">Mã vé</div>
              <div className="text-primary-400 font-mono font-bold text-2xl tracking-widest">{booking.bookingCode}</div>
            </div>

            {/* QR — only for confirmed */}
            {booking.status === 'CONFIRMED' && (booking.qrCode || booking.bookingCode) && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-2xl">
                  <QRCode value={booking.qrCode || booking.bookingCode} size={160} />
                </div>
              </div>
            )}

            {/* Pending notice */}
            {isPending && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                <div className="text-yellow-400 font-medium mb-1">Chờ thanh toán</div>
                <div className="text-dark-400 text-sm">Vé chưa được xác nhận. Vui lòng thanh toán hoặc hủy vé.</div>
              </div>
            )}

            {/* Seats */}
            <div>
              <div className="text-dark-400 text-sm mb-2">Ghế ngồi</div>
              <div className="flex flex-wrap gap-2">
                {(booking.seats || []).map(s => (
                  <div key={s.seatCode} className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm">
                    <span className="text-white font-medium">{s.seatCode}</span>
                    <span className="text-dark-400 ml-1.5 text-xs">{s.type} · {formatPrice(s.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment info */}
            <div className="border-t border-dark-700 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Tổng tiền</span>
                <span className="text-white">{formatPrice(booking.totalAmount)}</span>
              </div>
              {booking.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-dark-400">Giảm giá</span>
                  <span className="text-green-400">- {formatPrice(booking.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span className="text-dark-300">Thanh toán</span>
                <span className="text-primary-400 text-base">{formatPrice(booking.finalAmount)}</span>
              </div>
              {booking.payment && (
                <div className="flex justify-between">
                  <span className="text-dark-400">Phương thức</span>
                  <span className="flex items-center gap-2 text-white">
                    {booking.payment.method}
                    <span className={`badge-status text-xs ${pst.color}`}>{pst.label}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons for PENDING */}
        {isPending && (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex-1 border border-red-500/50 text-red-400 hover:bg-red-500/10 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {cancelling && <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />}
              {cancelling ? 'Đang hủy...' : 'Hủy vé'}
            </button>
            <button
              onClick={() => setShowPayModal(true)}
              className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
            >
              💳 Thanh toán
            </button>
          </div>
        )}
      </div>

      {/* Payment method modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Chọn phương thức thanh toán</h2>
              <button onClick={() => setShowPayModal(false)} className="text-dark-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setPayMethod(m.value)}
                  className={`p-3 rounded-xl border text-center transition-colors ${
                    payMethod === m.value
                      ? 'border-primary-500 bg-primary-600/10 text-white'
                      : 'border-dark-600 bg-dark-800 text-dark-300 hover:border-dark-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{m.emoji}</div>
                  <div className="text-xs font-medium">{m.label}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-between text-sm mb-5">
              <span className="text-dark-400">Tổng thanh toán</span>
              <span className="text-primary-400 font-bold">{formatPrice(booking.finalAmount)}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPayModal(false)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={handleRepay} disabled={paying} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {paying && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {paying ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
