import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { bookingApi } from '../../api/bookingApi'
import { paymentApi } from '../../api/paymentApi'
import { promotionApi } from '../../api/promotionApi'
import { setCurrentBooking, clearBooking } from '../../store/slices/bookingSlice'
import { formatPrice, formatTime, formatDate, getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'

const PAYMENT_METHODS = [
  { value: 'VNPAY', label: 'VNPay', emoji: '💳' },
  { value: 'MOMO', label: 'MoMo', emoji: '📱' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản', emoji: '🏦' },
]

export default function BookingConfirmPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedSeats, currentShowtime } = useSelector(s => s.booking)

  const [promoCode, setPromoCode] = useState('')
  const [promoResult, setPromoResult] = useState(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [payMethod, setPayMethod] = useState('VNPAY')
  const [loading, setLoading] = useState(false)

  if (!currentShowtime || selectedSeats.length === 0) {
    navigate('/movies')
    return null
  }

  const subtotal = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0)
  const discount = promoResult?.discountAmount || 0
  const finalAmount = promoResult?.finalAmount ?? subtotal

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    try {
      const res = await promotionApi.validatePromotion({ code: promoCode, orderAmount: subtotal })
      setPromoResult(res.data.data)
      toast.success(`Áp dụng mã thành công! Giảm ${formatPrice(res.data.data.discountAmount)}`)
    } catch (err) {
      setPromoResult(null)
      toast.error(getErrorMessage(err))
    } finally {
      setPromoLoading(false)
    }
  }

  const handlePay = async () => {
    setLoading(true)
    try {
      // 1. Create booking
      const bookingRes = await bookingApi.createBooking({
        showtimeId: currentShowtime.id,
        seatIds: selectedSeats.map(s => s.id),
        promotionCode: promoResult ? promoCode : undefined,
      })
      const booking = bookingRes.data.data
      dispatch(setCurrentBooking(booking))

      // 2. Initiate payment
      const payRes = await paymentApi.initiatePayment({ bookingId: booking.id, method: payMethod })
      const payment = payRes.data.data

      toast.info('Đang xử lý thanh toán...', { autoClose: 2000 })

      // 3. Simulate payment callback (mock)
      await new Promise(r => setTimeout(r, 2000))
      await paymentApi.paymentCallback({
        paymentId: payment.id,
        bookingId: booking.id,
        transactionId: `${payMethod}_TXN_${Date.now()}`,
        status: 'SUCCESS',
        amount: finalAmount,
        signature: 'mock_signature',
      })

      toast.success('Thanh toán thành công!')
      navigate(`/payment/result?bookingId=${booking.id}&status=SUCCESS`)
    } catch (err) {
      toast.error(getErrorMessage(err))
      navigate('/payment/result?status=FAILED')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-white mb-6">Xác nhận đặt vé</h1>

        {/* Movie & showtime info */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-white mb-3">Thông tin suất chiếu</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-dark-400">Phim · </span><span className="text-white">{currentShowtime.movie?.title || currentShowtime.movieTitle}</span></div>
            <div><span className="text-dark-400">Giờ chiếu · </span><span className="text-white">{formatTime(currentShowtime.startTime)} · {formatDate(currentShowtime.startTime)}</span></div>
            <div><span className="text-dark-400">Rạp · </span><span className="text-white">{currentShowtime.cinema?.name || currentShowtime.cinemaName}</span></div>
            <div><span className="text-dark-400">Phòng · </span><span className="text-white">{currentShowtime.room?.name} ({currentShowtime.room?.type})</span></div>
          </div>
        </div>

        {/* Seats */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-white mb-3">Ghế đã chọn</h2>
          <div className="space-y-2">
            {selectedSeats.map(s => (
              <div key={s.id} className="flex justify-between text-sm">
                <span className="text-white">{s.seatCode} <span className="text-dark-400 text-xs">({s.type})</span></span>
                <span className="text-dark-300">{formatPrice(s.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Promo code */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-white mb-3">Mã khuyến mãi</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập mã giảm giá..."
              className="input-field flex-1"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              disabled={!!promoResult}
            />
            {promoResult ? (
              <button onClick={() => { setPromoResult(null); setPromoCode('') }} className="btn-secondary px-4 text-sm">Xóa</button>
            ) : (
              <button onClick={handleValidatePromo} disabled={promoLoading} className="btn-primary px-4 text-sm">
                {promoLoading ? '...' : 'Áp dụng'}
              </button>
            )}
          </div>
          {promoResult && (
            <div className="mt-2 text-green-400 text-sm flex items-center gap-1">
              ✓ {promoResult.description || `Giảm ${formatPrice(promoResult.discountAmount)}`}
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-white mb-3">Phương thức thanh toán</h2>
          <div className="grid grid-cols-3 gap-3">
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
                <div className="text-sm font-medium">{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="card p-5 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-400">Tạm tính</span>
              <span className="text-white">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-dark-400">Giảm giá ({promoCode})</span>
                <span className="text-green-400">- {formatPrice(discount)}</span>
              </div>
            )}
            <div className="border-t border-dark-700 pt-2 flex justify-between font-semibold">
              <span className="text-white">Tổng thanh toán</span>
              <span className="text-primary-400 text-xl">{formatPrice(finalAmount)}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button onClick={handlePay} disabled={loading} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {loading ? 'Đang thanh toán...' : `💳 Thanh toán ${formatPrice(finalAmount)}`}
        </button>
        <button onClick={() => navigate(-1)} className="btn-ghost w-full mt-2">Quay lại chọn ghế</button>
      </div>
    </div>
  )
}
