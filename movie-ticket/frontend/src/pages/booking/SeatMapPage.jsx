import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { showtimeApi } from '../../api/showtimeApi'
import { toggleSeat, clearSeats } from '../../store/slices/bookingSlice'
import { PageLoader } from '../../components/common/Spinner'
import { formatPrice, formatTime, formatDate } from '../../utils/helpers'
import { fadeUp, fadeIn, fadeRight, scaleIn, staggerContainer, staggerItem, spring, easeOut } from '../../utils/motion'
import { toast } from 'react-toastify'

/* ─── Seat style configs ─── */
const SEAT_CFG = {
  available:       { bg: 'rgba(34,197,94,0.18)',  border: '#22c55e', color: '#4ade80' },
  selected:        { bg: 'rgba(225,29,72,0.85)',  border: '#fb7185', color: '#fff'    },
  booked:          { bg: 'rgba(30,41,59,0.45)',   border: '#334155', color: '#475569' },
  held:            { bg: 'rgba(234,179,8,0.18)',  border: '#ca8a04', color: '#fbbf24' },
  vip:             { bg: 'rgba(139,92,246,0.22)', border: '#8b5cf6', color: '#c4b5fd' },
  vip_selected:    { bg: 'rgba(139,92,246,0.85)', border: '#a78bfa', color: '#fff'    },
  couple:          { bg: 'rgba(236,72,153,0.22)', border: '#ec4899', color: '#f9a8d4' },
  couple_selected: { bg: 'rgba(236,72,153,0.85)', border: '#f472b6', color: '#fff'    },
}

function Seat({ seat, selected, onToggle }) {
  const isBooked = seat.seatStatus === 'BOOKED'
  const isHeld   = seat.seatStatus === 'HELD'
  const disabled = isBooked || isHeld

  let cfgKey = 'available'
  if (isBooked) cfgKey = 'booked'
  else if (isHeld) cfgKey = 'held'
  else if (selected) {
    cfgKey = seat.type === 'VIP' ? 'vip_selected' : seat.type === 'COUPLE' ? 'couple_selected' : 'selected'
  } else {
    if (seat.type === 'VIP') cfgKey = 'vip'
    if (seat.type === 'COUPLE') cfgKey = 'couple'
  }
  const cfg = SEAT_CFG[cfgKey]
  const isCouple = seat.type === 'COUPLE'

  return (
    <motion.button
      disabled={disabled}
      onClick={() => !disabled && onToggle(seat)}
      title={`${seat.seatCode} · ${seat.type} · ${formatPrice(seat.price)}`}
      whileHover={!disabled ? { scale: 1.18, zIndex: 10 } : {}}
      whileTap={!disabled ? { scale: 0.88 } : {}}
      animate={selected ? {
        boxShadow: [`0 0 0px ${cfg.border}00`, `0 0 16px ${cfg.border}99`, `0 0 6px ${cfg.border}55`],
      } : {}}
      transition={spring}
      style={{
        width: isCouple ? 54 : 36, height: 32, borderRadius: 6,
        background: cfg.bg, border: `1.5px solid ${cfg.border}`,
        color: cfg.color, fontSize: 10, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.4 : 1, outline: 'none',
        position: 'relative',
      }}
    >
      {seat.seatCode}
      {/* Selection ring */}
      {selected && !disabled && (
        <motion.span
          layoutId={`ring-${seat.id}`}
          style={{
            position: 'absolute', inset: -3, borderRadius: 8,
            border: `2px solid ${cfg.border}`, pointerEvents: 'none',
          }}
          initial={{ opacity: 0, scale: 1.3 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.button>
  )
}

function LegendItem({ bg, border, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 12 }}>
      <div style={{ width: 20, height: 14, borderRadius: 4, background: bg, border: `1.5px solid ${border}` }} />
      {label}
    </div>
  )
}

export default function SeatMapPage() {
  const { id: showtimeId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedSeats, currentShowtime } = useSelector(s => s.booking)
  const [rows, setRows] = useState([])
  const [showtime, setShowtime] = useState(currentShowtime)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      showtimeApi.getShowtimeSeats(showtimeId),
      !currentShowtime ? showtimeApi.getShowtimeById(showtimeId) : Promise.resolve(null),
    ]).then(([seatsRes, stRes]) => {
      setRows(seatsRes.data.data.rows || [])
      if (stRes) setShowtime(stRes.data.data)
    }).catch(() => navigate('/movies')).finally(() => setLoading(false))
  }, [showtimeId])

  const handleToggle = (seat) => {
    if (!selectedSeats.find(s => s.id === seat.id) && selectedSeats.length >= 8) {
      toast.warn('Bạn chỉ có thể chọn tối đa 8 ghế!')
      return
    }
    dispatch(toggleSeat({ ...seat, showtimeId }))
  }

  const totalPrice = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0)

  const handleContinue = () => {
    if (selectedSeats.length === 0) { toast.warn('Vui lòng chọn ít nhất 1 ghế'); return }
    navigate('/booking/confirm')
  }

  if (loading) return <PageLoader />

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      style={{ minHeight: '100vh', paddingTop: 80, paddingBottom: 32, background: '#020617' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        {/* Info bar */}
        {showtime && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" transition={easeOut}
            style={{
              background: 'rgba(15,23,42,0.9)',
              border: '1px solid rgba(51,65,85,0.6)',
              borderRadius: 16, padding: '14px 20px', marginBottom: 24,
              backdropFilter: 'blur(12px)',
              display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center',
            }}
          >
            {[
              { label: 'Phim',       val: showtime.movie?.title || showtime.movieTitle },
              { label: 'Suất chiếu', val: `${formatTime(showtime.startTime)} · ${formatDate(showtime.startTime)}` },
              { label: 'Phòng',      val: `${showtime.room?.name} (${showtime.room?.type})` },
              { label: 'Rạp',        val: showtime.cinema?.name || showtime.cinemaName },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {i > 0 && <div style={{ width: 1, height: 32, background: 'rgba(51,65,85,0.8)' }} />}
                <div>
                  <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                  <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, marginTop: 2 }}>{item.val}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

          {/* ─── Seat map ─── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Screen */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.1 }}
              style={{ textAlign: 'center', marginBottom: 32 }}
            >
              <motion.div
                style={{
                  width: '70%', maxWidth: 500, height: 4, margin: '0 auto 8px',
                  background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.7), transparent)',
                  borderRadius: 4,
                }}
                animate={{ boxShadow: ['0 0 10px rgba(244,63,94,0.2)', '0 0 30px rgba(244,63,94,0.6)', '0 0 10px rgba(244,63,94,0.2)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <span style={{ color: '#64748b', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>▲ MÀN HÌNH ▲</span>
            </motion.div>

            {/* Rows */}
            <motion.div
              variants={staggerContainer(0.04, 0.15)} initial="hidden" animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
            >
              {rows.map(row => (
                <motion.div
                  key={row.rowLabel}
                  variants={staggerItem}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <div style={{ width: 24, color: '#475569', fontSize: 11, fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>
                    {row.rowLabel}
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {(row.seats || []).map(seat => (
                      <Seat
                        key={seat.id}
                        seat={seat}
                        selected={!!selectedSeats.find(s => s.id === seat.id)}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Legend */}
            <motion.div
              variants={fadeIn} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.5 }}
              style={{
                display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 28, justifyContent: 'center',
                padding: '14px 20px', background: 'rgba(15,23,42,0.6)',
                borderRadius: 12, border: '1px solid rgba(51,65,85,0.4)',
              }}
            >
              <LegendItem bg="rgba(34,197,94,0.18)"  border="#22c55e" label="Trống" />
              <LegendItem bg="rgba(30,41,59,0.45)"   border="#334155" label="Đã đặt" />
              <LegendItem bg="rgba(234,179,8,0.18)"  border="#ca8a04" label="Đang giữ" />
              <LegendItem bg="rgba(139,92,246,0.22)" border="#8b5cf6" label="VIP" />
              <LegendItem bg="rgba(236,72,153,0.22)" border="#ec4899" label="Couple" />
              <LegendItem bg="rgba(225,29,72,0.85)"  border="#fb7185" label="Đã chọn" />
            </motion.div>
          </div>

          {/* ─── Summary panel ─── */}
          <motion.div
            variants={fadeRight} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.2 }}
            style={{ width: 280, flexShrink: 0 }}
          >
            <div style={{
              background: 'rgba(15,23,42,0.95)',
              border: '1px solid rgba(51,65,85,0.6)',
              borderRadius: 20, padding: 20,
              position: 'sticky', top: 90,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 800, color: '#fff', margin: 0, fontSize: 15 }}>🎟️ Ghế đã chọn</h3>
                <motion.span
                  animate={{
                    background: selectedSeats.length > 0
                      ? ['rgba(244,63,94,0.15)', 'rgba(244,63,94,0.3)', 'rgba(244,63,94,0.15)']
                      : 'rgba(51,65,85,0.4)',
                  }}
                  transition={{ duration: 2, repeat: selectedSeats.length > 0 ? Infinity : 0 }}
                  style={{
                    color: selectedSeats.length > 0 ? '#fb7185' : '#64748b',
                    border: `1px solid ${selectedSeats.length > 0 ? 'rgba(244,63,94,0.3)' : 'rgba(51,65,85,0.5)'}`,
                    borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 700,
                    display: 'inline-block',
                  }}
                >
                  {selectedSeats.length}/8
                </motion.span>
              </div>

              {/* Seat list */}
              <AnimatePresence>
                {selectedSeats.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ textAlign: 'center', padding: '24px 0', color: '#475569', fontSize: 13 }}
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ fontSize: 36, marginBottom: 8 }}
                    >
                      🪑
                    </motion.div>
                    Chưa chọn ghế nào
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}
                  >
                    <AnimatePresence>
                      {selectedSeats.map(s => (
                        <motion.div
                          key={s.id}
                          layout
                          initial={{ opacity: 0, scale: 0.85, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.85, x: 30 }}
                          transition={spring}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 12px', borderRadius: 10,
                            background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.18)',
                          }}
                        >
                          <div>
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{s.seatCode}</span>
                            <span style={{
                              marginLeft: 7, fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                              background: s.type === 'VIP' ? 'rgba(139,92,246,0.2)' : s.type === 'COUPLE' ? 'rgba(236,72,153,0.2)' : 'rgba(51,65,85,0.6)',
                              color: s.type === 'VIP' ? '#c4b5fd' : s.type === 'COUPLE' ? '#f9a8d4' : '#94a3b8',
                            }}>
                              {s.type}
                            </span>
                          </div>
                          <span style={{ color: '#fb7185', fontWeight: 700, fontSize: 13 }}>{formatPrice(s.price)}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Total */}
              <div style={{ borderTop: '1px solid rgba(51,65,85,0.5)', paddingTop: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Tổng cộng</span>
                  <motion.span
                    key={totalPrice}
                    initial={{ scale: 1.3, color: '#fbbf24' }}
                    animate={{ scale: 1, color: '#fb7185' }}
                    transition={spring}
                    style={{ fontWeight: 800, fontSize: 20 }}
                  >
                    {formatPrice(totalPrice)}
                  </motion.span>
                </div>
              </div>

              {/* Buttons */}
              <motion.button
                onClick={handleContinue}
                whileHover={selectedSeats.length > 0 ? { scale: 1.03, y: -2 } : {}}
                whileTap={selectedSeats.length > 0 ? { scale: 0.97 } : {}}
                animate={selectedSeats.length > 0 ? {
                  boxShadow: ['0 4px 20px rgba(225,29,72,0.35)', '0 4px 28px rgba(225,29,72,0.6)', '0 4px 20px rgba(225,29,72,0.35)'],
                } : {}}
                transition={{ duration: 2.5, repeat: selectedSeats.length > 0 ? Infinity : 0 }}
                style={{
                  width: '100%', padding: '13px 0', border: 'none', borderRadius: 12,
                  background: selectedSeats.length > 0 ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'rgba(51,65,85,0.5)',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: selectedSeats.length > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                Tiếp tục →
              </motion.button>

              <motion.button
                onClick={() => { dispatch(clearSeats()); navigate(-1) }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%', padding: '10px 0', marginTop: 8, border: '1px solid rgba(51,65,85,0.5)',
                  borderRadius: 12, background: 'transparent', color: '#64748b',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
              >
                ← Quay lại
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
