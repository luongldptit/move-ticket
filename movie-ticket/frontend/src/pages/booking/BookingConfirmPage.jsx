import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { bookingApi } from '../../api/bookingApi'
import { paymentApi } from '../../api/paymentApi'
import { promotionApi } from '../../api/promotionApi'
import { setCurrentBooking } from '../../store/slices/bookingSlice'
import { formatPrice, formatTime, formatDate, getErrorMessage } from '../../utils/helpers'
import { fadeUp, scaleIn, staggerContainer, staggerItem, spring, easeOut } from '../../utils/motion'
import { toast } from 'react-toastify'

const PAYMENT_METHODS = [
  { value: 'VNPAY',         label: 'VNPay',        emoji: '💳', accent: '#3b5fce' },
  { value: 'MOMO',          label: 'MoMo',         emoji: '📱', accent: '#ae2070' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản', emoji: '🏦', accent: '#0ea5e9' },
]

/* ─── Animated section card ─── */
function Card({ title, icon, children, delay = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ ...easeOut, delay }}
      style={{
        background: 'rgba(15,23,42,0.9)',
        border: '1px solid rgba(51,65,85,0.6)',
        borderRadius: 18, padding: 20, marginBottom: 16,
        backdropFilter: 'blur(12px)',
      }}
    >
      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon} {title}
      </h2>
      {children}
    </motion.div>
  )
}

export default function BookingConfirmPage() {
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const { selectedSeats, currentShowtime } = useSelector(s => s.booking)

  const [promoCode, setPromoCode]     = useState('')
  const [promoResult, setPromoResult] = useState(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [payMethod, setPayMethod]     = useState('VNPAY')
  const [loading, setLoading]         = useState(false)
  const [promoFocused, setPromoFocused] = useState(false)

  // ✅ Fix: navigate trong useEffect, không gọi trong render
  useEffect(() => {
    if (!currentShowtime || selectedSeats.length === 0) {
      navigate('/movies')
    }
  }, [currentShowtime, selectedSeats.length, navigate])

  // Chờ redirect nếu thiếu dữ liệu
  if (!currentShowtime || selectedSeats.length === 0) return null

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
        paymentId: payment.id, bookingId: booking.id,
        transactionId: `${payMethod}_TXN_${Date.now()}`,
        status: 'SUCCESS', amount: finalAmount, signature: 'mock_signature',
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
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={easeOut}
      style={{ minHeight: '100vh', paddingTop: 96, paddingBottom: 48, background: '#020617' }}
    >
      {/* Ambient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 50% at 30% 10%, rgba(139,92,246,0.07), transparent)',
      }} />

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

        {/* Page title */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={easeOut} style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0 }}>
            Xác nhận{' '}
            <span style={{
              background: 'linear-gradient(135deg, #fb7185, #a855f7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>đặt vé</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Kiểm tra thông tin và hoàn tất thanh toán</p>
        </motion.div>

        {/* Showtime info */}
        <Card title="Thông tin suất chiếu" icon="🎬" delay={0.05}>
          {[
            { label: 'Phim',      val: currentShowtime.movie?.title || currentShowtime.movieTitle },
            { label: 'Giờ chiếu', val: `${formatTime(currentShowtime.startTime)} · ${formatDate(currentShowtime.startTime)}` },
            { label: 'Rạp',       val: currentShowtime.cinema?.name || currentShowtime.cinemaName },
            { label: 'Phòng',     val: `${currentShowtime.room?.name} (${currentShowtime.room?.type})` },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', gap: 8, padding: '6px 0',
              borderBottom: i < 3 ? '1px solid rgba(51,65,85,0.3)' : 'none',
            }}>
              <span style={{ color: '#64748b', fontSize: 13 }}>{row.label}</span>
              <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{row.val}</span>
            </div>
          ))}
        </Card>

        {/* Seats */}
        <Card title="Ghế đã chọn" icon="🪑" delay={0.1}>
          <motion.div
            variants={staggerContainer(0.05)} initial="hidden" animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            {selectedSeats.map(s => (
              <motion.div
                key={s.id} variants={staggerItem}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', borderRadius: 10,
                  background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)',
                }}
              >
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
              </motion.div>
            ))}
          </motion.div>
        </Card>

        {/* Promo */}
        <Card title="Mã khuyến mãi" icon="🎁" delay={0.15}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" placeholder="Nhập mã giảm giá..." value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              disabled={!!promoResult}
              onFocus={() => setPromoFocused(true)}
              onBlur={() => setPromoFocused(false)}
              style={{
                flex: 1, padding: '10px 16px',
                background: 'rgba(30,41,59,0.8)',
                border: `1.5px solid ${promoFocused ? 'rgba(244,63,94,0.5)' : promoResult ? 'rgba(34,197,94,0.4)' : 'rgba(51,65,85,0.7)'}`,
                borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 600,
                letterSpacing: '0.05em', outline: 'none', transition: 'border-color 0.2s',
                opacity: promoResult ? 0.6 : 1,
              }}
            />
            {promoResult ? (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                onClick={() => { setPromoResult(null); setPromoCode('') }}
                style={{
                  padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                  background: 'rgba(51,65,85,0.5)', border: '1px solid rgba(51,65,85,0.7)',
                  color: '#94a3b8', cursor: 'pointer',
                }}
              >
                Xóa
              </motion.button>
            ) : (
              <motion.button
                whileHover={promoCode.trim() ? { scale: 1.05 } : {}}
                whileTap={promoCode.trim() ? { scale: 0.95 } : {}}
                onClick={handleValidatePromo}
                disabled={promoLoading || !promoCode.trim()}
                style={{
                  padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                  background: promoCode.trim() ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'rgba(51,65,85,0.4)',
                  border: 'none', color: '#fff',
                  cursor: promoCode.trim() ? 'pointer' : 'not-allowed', minWidth: 90,
                  boxShadow: promoCode.trim() ? '0 4px 12px rgba(225,29,72,0.35)' : 'none',
                }}
              >
                {promoLoading ? '⏳' : 'Áp dụng'}
              </motion.button>
            )}
          </div>
          <AnimatePresence>
            {promoResult && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={spring}
                style={{
                  marginTop: 10, display: 'flex', alignItems: 'center', gap: 8,
                  color: '#4ade80', fontSize: 13, fontWeight: 600,
                  padding: '8px 12px', background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10,
                }}
              >
                ✓ {promoResult.description || `Giảm ${formatPrice(promoResult.discountAmount)}`}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Payment method */}
        <Card title="Phương thức thanh toán" icon="💰" delay={0.2}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {PAYMENT_METHODS.map(m => (
              <motion.button
                key={m.value}
                onClick={() => setPayMethod(m.value)}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                animate={payMethod === m.value ? {
                  borderColor: ['#fb7185', '#fda4af', '#fb7185'],
                  boxShadow: ['0 0 0px rgba(244,63,94,0)', '0 0 18px rgba(244,63,94,0.25)', '0 0 0px rgba(244,63,94,0)'],
                } : {}}
                transition={{ duration: 2.5, repeat: payMethod === m.value ? Infinity : 0 }}
                style={{
                  padding: '14px 10px', borderRadius: 14, textAlign: 'center',
                  border: `2px solid ${payMethod === m.value ? '#fb7185' : 'rgba(51,65,85,0.6)'}`,
                  background: payMethod === m.value ? 'rgba(244,63,94,0.08)' : 'rgba(15,23,42,0.7)',
                  color: payMethod === m.value ? '#fff' : '#64748b',
                  cursor: 'pointer', transition: 'color 0.2s, transform 0.2s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{m.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.label}</div>
                <AnimatePresence>
                  {payMethod === m.value && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={spring}
                      style={{ marginTop: 4, fontSize: 10, color: '#fb7185', fontWeight: 600 }}
                    >
                      ✓ Đã chọn
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Order summary */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.27 }}
          style={{
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(51,65,85,0.6)',
            borderRadius: 18, padding: 20, marginBottom: 24, backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>Tạm tính ({selectedSeats.length} ghế)</span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{formatPrice(subtotal)}</span>
          </div>
          <AnimatePresence>
            {discount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={easeOut}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}
              >
                <span style={{ color: '#64748b' }}>Giảm giá ({promoCode})</span>
                <span style={{ color: '#4ade80', fontWeight: 600 }}>- {formatPrice(discount)}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div style={{
            borderTop: '1px solid rgba(51,65,85,0.5)', paddingTop: 12, marginTop: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>Tổng thanh toán</span>
            <motion.span
              key={finalAmount}
              initial={{ scale: 1.25, color: '#fbbf24' }}
              animate={{ scale: 1, color: '#fb7185' }}
              transition={spring}
              style={{ fontWeight: 900, fontSize: 24 }}
            >
              {formatPrice(finalAmount)}
            </motion.span>
          </div>
        </motion.div>

        {/* Pay button */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.33 }}
        >
          <motion.button
            onClick={handlePay} disabled={loading}
            whileHover={!loading ? { scale: 1.03, y: -3 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            animate={!loading ? {
              boxShadow: [
                '0 6px 24px rgba(225,29,72,0.35)',
                '0 6px 36px rgba(225,29,72,0.6)',
                '0 6px 24px rgba(225,29,72,0.35)',
              ],
            } : {}}
            transition={{ duration: 2.5, repeat: !loading ? Infinity : 0 }}
            style={{
              width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
              background: loading ? 'rgba(51,65,85,0.6)' : 'linear-gradient(135deg, #e11d48, #be123c)',
              color: '#fff', fontWeight: 800, fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {loading && (
              <motion.div
                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
              />
            )}
            {loading ? 'Đang thanh toán...' : `💳 Thanh toán ${formatPrice(finalAmount)}`}
          </motion.button>

          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '12px 0', marginTop: 10, borderRadius: 14,
              background: 'transparent', border: '1px solid rgba(51,65,85,0.5)',
              color: '#64748b', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
          >
            ← Quay lại chọn ghế
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
