import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { bookingApi } from '../../api/bookingApi'
import { clearBooking } from '../../store/slices/bookingSlice'
import { PageLoader } from '../../components/common/Spinner'
import { formatPrice, formatDateTime } from '../../utils/helpers'
import { QRCode } from 'react-qr-code'
import { fadeUp, scaleIn, staggerContainer, staggerItem, spring, easeOut } from '../../utils/motion'

/* ─── Confetti particle ─── */
function Confetti() {
  const colors = ['#fb7185', '#a855f7', '#38bdf8', '#4ade80', '#fbbf24']
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
      {[...Array(28)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${5 + (i * 3.5) % 92}%`,
            top: -20,
            width: 8 + (i % 5) * 2,
            height: 8 + (i % 4) * 2,
            borderRadius: i % 3 === 0 ? '50%' : 2,
            background: colors[i % colors.length],
            opacity: 0.85,
          }}
          initial={{ y: -20, rotate: 0, opacity: 0.85 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 60 : 900,
            rotate: (i % 2 === 0 ? 1 : -1) * (180 + (i * 37) % 360),
            x: [(i % 2 === 0 ? 1 : -1) * 30, -(i % 2 === 0 ? 1 : -1) * 20, 0],
            opacity: [0.85, 0.85, 0],
          }}
          transition={{
            duration: 2.2 + (i % 5) * 0.3,
            delay: i * 0.06,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  )
}

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status    = searchParams.get('status')
  const bookingId = searchParams.get('bookingId')
  const [booking, setBooking]   = useState(null)
  const [loading, setLoading]   = useState(!!bookingId)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    dispatch(clearBooking())
    if (bookingId) {
      bookingApi.getBookingById(bookingId)
        .then(r => {
          setBooking(r.data.data)
          if (status === 'SUCCESS') {
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 3500)
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [bookingId])

  if (loading) return <PageLoader />

  /* ─── FAILED ─── */
  if (status === 'FAILED' || !booking) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={easeOut}
        style={{ minHeight: '100vh', paddingTop: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617' }}
      >
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.2 }}
            style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: 48,
            }}
          >
            ❌
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.3 }}
            style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
            Thanh toán thất bại
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.4 }}
            style={{ color: '#64748b', margin: '0 0 32px' }}>
            Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.
          </motion.p>
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.5 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center' }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate(-2)}
              style={{
                padding: '12px 28px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                color: '#fff', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(225,29,72,0.4)',
              }}
            >
              Thử lại
            </motion.button>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link to="/" style={{
                display: 'inline-block', padding: '12px 28px', borderRadius: 12,
                border: '1px solid rgba(51,65,85,0.7)',
                background: 'rgba(15,23,42,0.8)', color: '#94a3b8',
                fontWeight: 700, textDecoration: 'none',
              }}>
                Về trang chủ
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  /* ─── SUCCESS ─── */
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      style={{ minHeight: '100vh', paddingTop: 96, paddingBottom: 64, background: '#020617' }}
    >
      {/* Confetti */}
      <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>

      {/* Ambient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(34,197,94,0.06), transparent)',
      }} />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px', position: 'relative' }}>

        {/* Success icon */}
        <motion.div
          variants={scaleIn} initial="hidden" animate="show" transition={{ ...spring, delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: 28 }}
        >
          <motion.div
            style={{
              width: 90, height: 90, borderRadius: '50%', margin: '0 auto 16px',
              background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            animate={{ boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 32px rgba(34,197,94,0.4)', '0 0 0px rgba(34,197,94,0)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <motion.svg
              width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            >
              <motion.path d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.4 }} />
            </motion.svg>
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.3 }}
            style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>
            Đặt vé thành công! 🎉
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.4 }}
            style={{ color: '#64748b', margin: 0 }}>
            Vé của bạn đã được xác nhận và sẵn sàng
          </motion.p>
        </motion.div>

        {/* Ticket card */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.45 }}
          style={{
            background: 'rgba(15,23,42,0.95)',
            border: '1px solid rgba(51,65,85,0.6)',
            borderRadius: 24, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Movie header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(225,29,72,0.2) 0%, rgba(15,23,42,0.8) 100%)',
            padding: '20px 24px', borderBottom: '1px solid rgba(51,65,85,0.5)',
          }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, lineHeight: 1.3 }}>
              {booking.showtime?.movieTitle}
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
              {formatDateTime(booking.showtime?.startTime)} · {booking.showtime?.roomName} · {booking.showtime?.cinemaName}
            </div>
          </div>

          <div style={{ padding: 24 }}>
            {/* Booking code */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              style={{
                background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
                borderRadius: 14, padding: '16px', textAlign: 'center', marginBottom: 20,
                cursor: 'default',
              }}
            >
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                Mã vé
              </div>
              <motion.div
                style={{
                  color: '#fb7185', fontFamily: 'monospace', fontWeight: 800,
                  fontSize: 26, letterSpacing: '0.15em',
                }}
                animate={{ textShadow: ['0 0 0px rgba(244,63,94,0)', '0 0 20px rgba(244,63,94,0.5)', '0 0 0px rgba(244,63,94,0)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                {booking.bookingCode}
              </motion.div>
            </motion.div>

            {/* QR */}
            {(booking.qrCode || booking.bookingCode) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: 0.6 }}
                style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}
              >
                <div style={{
                  background: '#fff', padding: 14, borderRadius: 16,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                  <QRCode value={booking.qrCode || booking.bookingCode} size={150} />
                </div>
              </motion.div>
            )}

            {/* Seats */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Ghế ngồi
              </div>
              <motion.div
                variants={staggerContainer(0.06, 0.5)} initial="hidden" animate="show"
                style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}
              >
                {(booking.seats || []).map(s => (
                  <motion.span
                    key={s.seatCode} variants={staggerItem}
                    style={{
                      background: 'rgba(51,65,85,0.6)', border: '1px solid rgba(71,85,105,0.7)',
                      color: '#e2e8f0', fontSize: 13, fontWeight: 600,
                      padding: '5px 12px', borderRadius: 8,
                    }}
                  >
                    {s.seatCode} ({s.type})
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Summary */}
            <div style={{ borderTop: '1px solid rgba(51,65,85,0.5)', paddingTop: 16 }}>
              {booking.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Đã giảm giá</span>
                  <span style={{ color: '#4ade80', fontWeight: 600 }}>- {formatPrice(booking.discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: 13 }}>Đã thanh toán</span>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{formatPrice(booking.finalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Phương thức</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{booking.payment?.method || '—'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.6 }}
          style={{ display: 'flex', gap: 12, marginTop: 20 }}
        >
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} style={{ flex: 1 }}>
            <Link to="/bookings" style={{
              display: 'block', textAlign: 'center', padding: '13px 0', borderRadius: 14,
              border: '1px solid rgba(51,65,85,0.6)', background: 'rgba(15,23,42,0.8)',
              color: '#94a3b8', fontWeight: 700, fontSize: 14, textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
              📋 Lịch sử vé
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} style={{ flex: 1 }}>
            <Link to="/" style={{
              display: 'block', textAlign: 'center', padding: '13px 0', borderRadius: 14,
              background: 'linear-gradient(135deg, #e11d48, #be123c)',
              color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(225,29,72,0.4)',
            }}>
              🏠 Về trang chủ
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
