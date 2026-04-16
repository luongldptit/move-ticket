import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { bookingApi } from '../../api/bookingApi'
import { paymentApi } from '../../api/paymentApi'
import { promotionApi } from '../../api/promotionApi'
import { setCurrentBooking, clearBooking } from '../../store/slices/bookingSlice'
import { formatPrice, formatTime, formatDate, getErrorMessage } from '../../utils/helpers'
import { KEYFRAMES } from '../../utils/animations'
import { toast } from 'react-toastify'

const PAYMENT_METHODS = [
  { value: 'VNPAY',         label: 'VNPay',        emoji: '💳', color: '#3b5fce' },
  { value: 'MOMO',          label: 'MoMo',         emoji: '📱', color: '#ae2070' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản', emoji: '🏦', color: '#0ea5e9' },
]

/* ───── Section card ───── */
function Card({ title, icon, children, delay = 0 }) {
  return (
    <div style={{
      background: 'rgba(15,23,42,0.9)',
      border: '1px solid rgba(51,65,85,0.6)',
      borderRadius: 18, padding: 20, marginBottom: 16,
      backdropFilter: 'blur(12px)',
      animation: `fadeSlideUp 0.5s ease-out both`,
      animationDelay: `${delay}ms`,
    }}>
      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  )
}

/* ───── Info row ───── */
function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, padding: '6px 0' }}>
      <span style={{ color: '#64748b', fontSize: 13, flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export default function BookingConfirmPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedSeats, currentShowtime } = useSelector(s => s.booking)

  const [promoCode, setPromoCode] = useState('')
  const [promoResult, setPromoResult] = useState(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [payMethod, setPayMethod] = useState('VNPAY')
  const [loading, setLoading] = useState(false)
  const [promoFocused, setPromoFocused] = useState(false)

  if (!currentShowtime || selectedSeats.length === 0) {
    navigate('/movies')
    return null
  }

  const subtotal    = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0)
  const discount    = promoResult?.discountAmount || 0
  const finalAmount = promoResult?.finalAmount ?? subtotal

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    try {
      const res = await promotionApi.validatePromotion({ code: promoCode, orderAmount: subtotal })
      setPromoResult(res.data.data)
      toast.success(`✓ Áp dụng thành công! Giảm ${formatPrice(res.data.data.discountAmount)}`)
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
      const bookingRes = await bookingApi.createBooking({
        showtimeId: currentShowtime.id,
        seatIds: selectedSeats.map(s => s.id),
        promotionCode: promoResult ? promoCode : undefined,
      })
      const booking = bookingRes.data.data
      dispatch(setCurrentBooking(booking))

      const payRes = await paymentApi.initiatePayment({ bookingId: booking.id, method: payMethod })
      const payment = payRes.data.data

      toast.info('Đang xử lý thanh toán...', { autoClose: 2000 })

      await new Promise(r => setTimeout(r, 2000))
      await paymentApi.paymentCallback({
        paymentId: payment.id,
        bookingId: booking.id,
        transactionId: `${payMethod}_TXN_${Date.now()}`,
        status: 'SUCCESS',
        amount: finalAmount,
        signature: 'mock_signature',
      })

      toast.success('🎉 Thanh toán thành công!')
      navigate(`/payment/result?bookingId=${booking.id}&status=SUCCESS`)
    } catch (err) {
      toast.error(getErrorMessage(err))
      navigate('/payment/result?status=FAILED')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 96, paddingBottom: 48, background: '#020617' }}>
      <style>{KEYFRAMES}</style>

      {/* Ambient bg */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 50% at 30% 10%, rgba(139,92,246,0.08), transparent)',
      }} />

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

        {/* Page title */}
        <div style={{ marginBottom: 24, animation: 'fadeSlideUp 0.5s ease-out' }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0 }}>
            Xác nhận{' '}
            <span style={{
              background: 'linear-gradient(135deg, #fb7185, #a855f7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>đặt vé</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Kiểm tra thông tin và hoàn tất thanh toán
          </p>
        </div>

        {/* Showtime info */}
        <Card title="Thông tin suất chiếu" icon="🎬" delay={0}>
          <InfoRow label="Phim"      value={currentShowtime.movie?.title || currentShowtime.movieTitle} />
          <InfoRow label="Giờ chiếu" value={`${formatTime(currentShowtime.startTime)} · ${formatDate(currentShowtime.startTime)}`} />
          <InfoRow label="Rạp"       value={currentShowtime.cinema?.name || currentShowtime.cinemaName} />
          <InfoRow label="Phòng"     value={`${currentShowtime.room?.name} (${currentShowtime.room?.type})`} />
        </Card>

        {/* Seats */}
        <Card title="Ghế đã chọn" icon="🪑" delay={80}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {selectedSeats.map((s, i) => (
              <div key={s.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', borderRadius: 10,
                background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)',
                animation: `scaleIn 0.3s ease-out both`, animationDelay: `${i * 50}ms`,
              }}>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{s.seatCode}</span>
                  <span style={{
                    marginLeft: 8, fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                    background: s.type === 'VIP' ? 'rgba(139,92,246,0.2)' : s.type === 'COUPLE' ? 'rgba(236,72,153,0.2)' : 'rgba(51,65,85,0.6)',
                    color: s.type === 'VIP' ? '#c4b5fd' : s.type === 'COUPLE' ? '#f9a8d4' : '#94a3b8',
                  }}>
                    {s.type}
                  </span>
                </div>
                <span style={{ color: '#fb7185', fontWeight: 700, fontSize: 13 }}>{formatPrice(s.price)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Promo code */}
        <Card title="Mã khuyến mãi" icon="🎁" delay={160}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Nhập mã giảm giá..."
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                disabled={!!promoResult}
                onFocus={() => setPromoFocused(true)}
                onBlur={() => setPromoFocused(false)}
                style={{
                  width: '100%', padding: '10px 16px',
                  background: 'rgba(30,41,59,0.8)',
                  border: `1.5px solid ${promoFocused ? 'rgba(244,63,94,0.5)' : promoResult ? 'rgba(34,197,94,0.4)' : 'rgba(51,65,85,0.7)'}`,
                  borderRadius: 12, color: '#fff', fontSize: 13, letterSpacing: '0.05em',
                  fontWeight: 600, outline: 'none', transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  opacity: promoResult ? 0.6 : 1,
                }}
              />
            </div>
            {promoResult ? (
              <button
                onClick={() => { setPromoResult(null); setPromoCode('') }}
                style={{
                  padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                  background: 'rgba(51,65,85,0.5)', border: '1px solid rgba(51,65,85,0.7)',
                  color: '#94a3b8', cursor: 'pointer',
                }}
              >
                Xóa
              </button>
            ) : (
              <button
                onClick={handleValidatePromo}
                disabled={promoLoading || !promoCode.trim()}
                style={{
                  padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                  background: promoCode.trim() ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'rgba(51,65,85,0.4)',
                  border: 'none', color: '#fff', cursor: promoCode.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s', minWidth: 90, textAlign: 'center',
                  boxShadow: promoCode.trim() ? '0 4px 12px rgba(225,29,72,0.35)' : 'none',
                }}
              >
                {promoLoading ? '⏳' : 'Áp dụng'}
              </button>
            )}
          </div>
          {promoResult && (
            <div style={{
              marginTop: 10, display: 'flex', alignItems: 'center', gap: 8,
              color: '#4ade80', fontSize: 13, fontWeight: 600,
              padding: '8px 12px', background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10,
              animation: 'scaleIn 0.3s ease-out',
            }}>
              ✓ {promoResult.description || `Giảm ${formatPrice(promoResult.discountAmount)}`}
            </div>
          )}
        </Card>

        {/* Payment method */}
        <Card title="Phương thức thanh toán" icon="💰" delay={240}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.value}
                onClick={() => setPayMethod(m.value)}
                style={{
                  padding: '14px 10px', borderRadius: 14, textAlign: 'center',
                  border: `2px solid ${payMethod === m.value ? '#fb7185' : 'rgba(51,65,85,0.6)'}`,
                  background: payMethod === m.value ? 'rgba(244,63,94,0.1)' : 'rgba(15,23,42,0.7)',
                  color: payMethod === m.value ? '#fff' : '#64748b',
                  cursor: 'pointer', transition: 'all 0.25s',
                  boxShadow: payMethod === m.value ? '0 0 20px rgba(244,63,94,0.2), inset 0 0 20px rgba(244,63,94,0.05)' : 'none',
                  transform: payMethod === m.value ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{m.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.label}</div>
                {payMethod === m.value && (
                  <div style={{
                    marginTop: 4, fontSize: 10, color: '#fb7185', fontWeight: 600,
                    animation: 'fadeIn 0.2s ease-out',
                  }}>✓ Đã chọn</div>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Order summary */}
        <div style={{
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid rgba(51,65,85,0.6)',
          borderRadius: 18, padding: 20, marginBottom: 24,
          backdropFilter: 'blur(12px)',
          animation: 'fadeSlideUp 0.5s ease-out both',
          animationDelay: '320ms',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>Tạm tính ({selectedSeats.length} ghế)</span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13,
              animation: 'fadeSlideUp 0.3s ease-out',
            }}>
              <span style={{ color: '#64748b' }}>Giảm giá ({promoCode})</span>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>- {formatPrice(discount)}</span>
            </div>
          )}
          <div style={{
            borderTop: '1px solid rgba(51,65,85,0.5)', paddingTop: 12, marginTop: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>Tổng thanh toán</span>
            <span style={{
              color: '#fb7185', fontWeight: 900, fontSize: 24,
              textShadow: '0 0 20px rgba(244,63,94,0.4)',
            }}>
              {formatPrice(finalAmount)}
            </span>
          </div>
        </div>

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={loading}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 16,
            background: loading
              ? 'rgba(51,65,85,0.6)'
              : 'linear-gradient(135deg, #e11d48, #be123c)',
            border: 'none', color: '#fff', fontWeight: 800, fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'all 0.25s',
            boxShadow: loading ? 'none' : '0 8px 30px rgba(225,29,72,0.45)',
            animation: loading ? 'none' : 'glowPulse 3s ease-in-out infinite',
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 14px 40px rgba(225,29,72,0.6)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = ''
            e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 30px rgba(225,29,72,0.45)'
          }}
        >
          {loading && (
            <div style={{
              width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          )}
          {loading ? 'Đang thanh toán...' : `💳 Thanh toán ${formatPrice(finalAmount)}`}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <button
          onClick={() => navigate(-1)}
          style={{
            width: '100%', padding: '12px 0', marginTop: 10, borderRadius: 14,
            background: 'transparent', border: '1px solid rgba(51,65,85,0.5)',
            color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(100,116,139,0.7)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(51,65,85,0.5)' }}
        >
          ← Quay lại chọn ghế
        </button>
      </div>
    </div>
  )
}
