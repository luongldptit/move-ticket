import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { showtimeApi } from '../../api/showtimeApi'
import { toggleSeat, clearSeats } from '../../store/slices/bookingSlice'
import { PageLoader } from '../../components/common/Spinner'
import { formatPrice, formatTime, formatDate } from '../../utils/helpers'
import { KEYFRAMES } from '../../utils/animations'
import { toast } from 'react-toastify'

/* ───── Seat type configs ───── */
const SEAT_STYLES = {
  available:        { bg: 'rgba(34,197,94,0.2)',  border: '#22c55e', color: '#4ade80', hover: 'rgba(34,197,94,0.4)' },
  selected:         { bg: 'rgba(225,29,72,0.85)', border: '#fb7185', color: '#fff',    hover: 'rgba(225,29,72,0.9)' },
  booked:           { bg: 'rgba(30,41,59,0.5)',   border: '#334155', color: '#475569', hover: null },
  held:             { bg: 'rgba(234,179,8,0.2)',  border: '#ca8a04', color: '#fbbf24', hover: null },
  vip:              { bg: 'rgba(139,92,246,0.25)',border: '#8b5cf6', color: '#c4b5fd', hover: 'rgba(139,92,246,0.45)' },
  vip_selected:     { bg: 'rgba(139,92,246,0.8)', border: '#a78bfa', color: '#fff',    hover: null },
  couple:           { bg: 'rgba(236,72,153,0.25)',border: '#ec4899', color: '#f9a8d4', hover: 'rgba(236,72,153,0.45)' },
  couple_selected:  { bg: 'rgba(236,72,153,0.8)', border: '#f472b6', color: '#fff',    hover: null },
}

function Seat({ seat, selected, onToggle }) {
  const [popped, setPopped] = useState(false)
  const isBooked = seat.seatStatus === 'BOOKED'
  const isHeld   = seat.seatStatus === 'HELD'
  const disabled  = isBooked || isHeld

  let styleKey = 'available'
  if (isBooked) styleKey = 'booked'
  else if (isHeld) styleKey = 'held'
  else if (selected) {
    styleKey = seat.type === 'VIP' ? 'vip_selected' : seat.type === 'COUPLE' ? 'couple_selected' : 'selected'
  } else {
    if (seat.type === 'VIP') styleKey = 'vip'
    if (seat.type === 'COUPLE') styleKey = 'couple'
  }
  const s = SEAT_STYLES[styleKey]
  const isCouple = seat.type === 'COUPLE'

  const handleClick = () => {
    if (disabled) return
    setPopped(true)
    setTimeout(() => setPopped(false), 400)
    onToggle(seat)
  }

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      title={`${seat.seatCode} · ${seat.type} · ${formatPrice(seat.price)}`}
      style={{
        width: isCouple ? 52 : 36,
        height: 32,
        borderRadius: 6,
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        color: s.color,
        fontSize: 10,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
        animation: popped ? 'seatPop 0.4s ease-out' : 'none',
        transform: !disabled && 'none',
        boxShadow: selected ? `0 0 12px ${s.border}55` : 'none',
        opacity: disabled ? 0.45 : 1,
        outline: 'none',
      }}
      onMouseEnter={e => {
        if (disabled || !s.hover) return
        e.currentTarget.style.background = s.hover
        e.currentTarget.style.transform = 'scale(1.15)'
        e.currentTarget.style.zIndex = 2
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = s.bg
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.zIndex = 1
      }}
    >
      {seat.seatCode}
    </button>
  )
}

/* ───── Legend pill ───── */
function LegendItem({ color, border, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
      <div style={{
        width: 20, height: 14, borderRadius: 4,
        background: color, border: `1.5px solid ${border}`,
      }} />
      {label}
    </div>
  )
}

/* ───── Selected seat pill ───── */
function SeatPill({ seat, style }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 12px', borderRadius: 10,
      background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
      ...style,
    }}>
      <div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{seat.seatCode}</span>
        <span style={{ color: '#64748b', fontSize: 11, marginLeft: 6 }}>{seat.type}</span>
      </div>
      <span style={{ color: '#fb7185', fontWeight: 600, fontSize: 13 }}>{formatPrice(seat.price)}</span>
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    Promise.all([
      showtimeApi.getShowtimeSeats(showtimeId),
      !currentShowtime ? showtimeApi.getShowtimeById(showtimeId) : Promise.resolve(null),
    ]).then(([seatsRes, stRes]) => {
      setRows(seatsRes.data.data.rows || [])
      if (stRes) setShowtime(stRes.data.data)
    }).catch(() => navigate('/movies')).finally(() => {
      setLoading(false)
      setTimeout(() => setMounted(true), 60)
    })
  }, [showtimeId])

  const handleToggle = (seat) => {
    const alreadySelected = selectedSeats.find(s => s.id === seat.id)
    if (!alreadySelected && selectedSeats.length >= 8) {
      toast.warn('Bạn chỉ có thể chọn tối đa 8 ghế!')
      return
    }
    dispatch(toggleSeat({ ...seat, showtimeId }))
  }

  const totalPrice = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0)

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.warn('Vui lòng chọn ít nhất 1 ghế')
      return
    }
    navigate('/booking/confirm')
  }

  if (loading) return <PageLoader />

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, paddingBottom: 32, background: '#020617' }}>
      <style>{KEYFRAMES}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        {/* Showtime info bar */}
        {showtime && (
          <div style={{
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(51,65,85,0.6)',
            borderRadius: 16, padding: '14px 20px',
            marginBottom: 24, backdropFilter: 'blur(12px)',
            display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center',
            animation: 'fadeSlideUp 0.5s ease-out',
          }}>
            {[
              { label: 'Phim', val: showtime.movie?.title || showtime.movieTitle },
              { label: 'Suất chiếu', val: `${formatTime(showtime.startTime)} · ${formatDate(showtime.startTime)}` },
              { label: 'Phòng', val: `${showtime.room?.name} (${showtime.room?.type})` },
              { label: 'Rạp', val: showtime.cinema?.name || showtime.cinemaName },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {i > 0 && <div style={{ width: 1, height: 32, background: 'rgba(51,65,85,0.8)' }} />}
                <div>
                  <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {item.label}
                  </div>
                  <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, marginTop: 2 }}>{item.val}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

          {/* ── Seat map ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Screen */}
            <div style={{
              textAlign: 'center', marginBottom: 32,
              animation: 'fadeSlideUp 0.6s ease-out 0.1s both',
            }}>
              <div style={{
                width: '70%', maxWidth: 500, height: 4, margin: '0 auto 8px',
                background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.7), transparent)',
                borderRadius: 4,
                boxShadow: '0 0 20px rgba(244,63,94,0.4)',
                animation: 'glowPulse 3s ease-in-out infinite',
              }} />
              <span style={{ color: '#64748b', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                ▲ MÀN HÌNH ▲
              </span>
            </div>

            {/* Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {rows.map((row, rowIdx) => (
                <div key={row.rowLabel} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  animation: `fadeSlideUp 0.4s ease-out both`,
                  animationDelay: `${rowIdx * 40}ms`,
                }}>
                  <div style={{
                    width: 24, color: '#475569', fontSize: 11, fontWeight: 700,
                    textAlign: 'right', flexShrink: 0, fontFamily: 'monospace',
                  }}>
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
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 32, justifyContent: 'center',
              animation: 'fadeIn 0.6s ease-out 0.3s both',
              padding: '16px 20px',
              background: 'rgba(15,23,42,0.6)',
              borderRadius: 12, border: '1px solid rgba(51,65,85,0.4)',
            }}>
              <LegendItem color="rgba(34,197,94,0.2)"  border="#22c55e" label="Trống" />
              <LegendItem color="rgba(30,41,59,0.5)"   border="#334155" label="Đã đặt" />
              <LegendItem color="rgba(234,179,8,0.2)"  border="#ca8a04" label="Đang giữ" />
              <LegendItem color="rgba(139,92,246,0.25)" border="#8b5cf6" label="VIP" />
              <LegendItem color="rgba(236,72,153,0.25)" border="#ec4899" label="Couple" />
              <LegendItem color="rgba(225,29,72,0.85)" border="#fb7185" label="Đã chọn" />
            </div>
          </div>

          {/* ── Summary panel ── */}
          <div style={{
            width: 280, flexShrink: 0,
            animation: 'slideInRight 0.6s ease-out both',
          }}>
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
                <h3 style={{ fontWeight: 800, color: '#fff', margin: 0, fontSize: 15 }}>
                  🎟️ Ghế đã chọn
                </h3>
                <span style={{
                  background: selectedSeats.length > 0 ? 'rgba(244,63,94,0.15)' : 'rgba(51,65,85,0.4)',
                  color: selectedSeats.length > 0 ? '#fb7185' : '#64748b',
                  border: `1px solid ${selectedSeats.length > 0 ? 'rgba(244,63,94,0.3)' : 'rgba(51,65,85,0.5)'}`,
                  borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 700,
                }}>
                  {selectedSeats.length}/8
                </span>
              </div>

              {/* Seat list */}
              {selectedSeats.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '24px 0', color: '#475569',
                  fontSize: 13, lineHeight: 1.6,
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8, animation: 'floatUpDown 2s ease-in-out infinite' }}>🪑</div>
                  Chưa chọn ghế nào
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {selectedSeats.map((s, i) => (
                    <SeatPill
                      key={s.id}
                      seat={s}
                      style={{ animation: `scaleIn 0.3s ease-out both`, animationDelay: `${i * 60}ms` }}
                    />
                  ))}
                </div>
              )}

              {/* Total */}
              <div style={{
                borderTop: '1px solid rgba(51,65,85,0.5)',
                paddingTop: 14, marginBottom: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Tổng cộng</span>
                  <span style={{
                    color: '#fb7185', fontWeight: 800, fontSize: 20,
                    textShadow: '0 0 20px rgba(244,63,94,0.4)',
                  }}>
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* CTA buttons */}
              <button
                onClick={handleContinue}
                style={{
                  width: '100%', padding: '13px 0',
                  background: selectedSeats.length > 0
                    ? 'linear-gradient(135deg, #e11d48, #be123c)'
                    : 'rgba(51,65,85,0.5)',
                  border: 'none', borderRadius: 12,
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: selectedSeats.length > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  boxShadow: selectedSeats.length > 0
                    ? '0 4px 20px rgba(225,29,72,0.4)'
                    : 'none',
                  animation: selectedSeats.length > 0 ? 'glowPulse 3s ease-in-out infinite' : 'none',
                }}
                onMouseEnter={e => {
                  if (selectedSeats.length > 0) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(225,29,72,0.55)'
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = selectedSeats.length > 0
                    ? '0 4px 20px rgba(225,29,72,0.4)' : 'none'
                }}
              >
                Tiếp tục →
              </button>

              <button
                onClick={() => { dispatch(clearSeats()); navigate(-1) }}
                style={{
                  width: '100%', padding: '10px 0', marginTop: 8,
                  background: 'transparent', border: '1px solid rgba(51,65,85,0.5)',
                  borderRadius: 12, color: '#64748b', fontWeight: 600, fontSize: 13,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(100,116,139,0.8)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(51,65,85,0.5)' }}
              >
                ← Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
