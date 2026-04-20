import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { showtimeApi } from '../../api/showtimeApi'
import { toggleSeat, clearSeats } from '../../store/slices/bookingSlice'
import { PageLoader } from '../../components/common/Spinner'
import { formatPrice, formatTime, formatDate } from '../../utils/helpers'
import { fadeUp, fadeIn, fadeRight, staggerContainer, staggerItem, spring, easeOut, modalPanel } from '../../utils/motion'
import { toast } from 'react-toastify'
import { useMotionValue, useSpring } from 'framer-motion'

/* ─── Seat style configs ─── */
const SEAT_CFG = {
  available:       { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.2)', color: '#cbd5e1' },
  selected:        { bg: 'rgba(225,29,72,0.85)',   border: '#fb7185',               color: '#fff'    },
  booked:          { bg: 'rgba(15,23,42,0.6)',     border: 'rgba(51,65,85,0.8)',    color: '#475569' },
  held:            { bg: 'rgba(234,179,8,0.18)',   border: '#ca8a04',               color: '#fbbf24' },
  vip:             { bg: 'rgba(139,92,246,0.15)',  border: '#8b5cf6',               color: '#c4b5fd' },
  vip_selected:    { bg: 'rgba(139,92,246,0.85)',  border: '#a78bfa',               color: '#fff'    },
  couple:          { bg: 'rgba(236,72,153,0.15)',  border: '#ec4899',               color: '#f9a8d4' },
  couple_selected: { bg: 'rgba(236,72,153,0.85)',  border: '#f472b6',               color: '#fff'    },
}

function Seat({ seat, selected, onToggle, onHover }) {
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
      onMouseEnter={() => !disabled && onHover(seat)}
      onMouseLeave={() => onHover(null)}
      title={`${seat.seatCode} · ${seat.type} · ${formatPrice(seat.price)}`}
      whileHover={!disabled ? { 
        scale: 1.35, 
        zIndex: 50,
        boxShadow: `0 0 30px ${cfg.border}cc`,
        borderColor: '#fff',
        backgroundColor: cfg.bg === 'rgba(255,255,255,0.05)' ? 'rgba(255,255,255,0.2)' : cfg.bg,
      } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      animate={selected ? {
        boxShadow: [`0 0 0px ${cfg.border}00`, `0 0 20px ${cfg.border}99`, `0 0 8px ${cfg.border}55`],
      } : {}}
      transition={spring}
      style={{
        width: isCouple ? 60 : 36, height: 36, 
        background: cfg.bg, border: `1.5px solid ${cfg.border}`,
        color: cfg.color, 
        transformStyle: 'preserve-3d',
      }}
      className={`relative flex items-center justify-center text-[10px] font-black outline-none transition-colors ${isCouple ? 'rounded-t-2xl rounded-b-lg' : 'rounded-t-xl rounded-b-md'} ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-white/50'}`}
    >
      <span style={{ transform: 'translateZ(10px)' }}>{seat.seatCode}</span>
      {/* Selection outer ring effect */}
      {selected && !disabled && (
        <motion.span
          layoutId={`ring-${seat.id}`}
          className="absolute -inset-1.5 pointer-events-none rounded-xl"
          style={{ border: `2px solid ${cfg.border}`, filter: 'blur(1px)' }}
          initial={{ opacity: 0, scale: 1.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.button>
  )
}

function LegendItem({ bg, border, label }) {
  return (
    <div className="flex items-center gap-2.5 text-dark-300 text-[10px] font-black tracking-[0.2em] uppercase">
      <div className="w-5 h-4 rounded-t-lg rounded-b-sm" style={{ background: bg, border: `1.5px solid ${border}` }} />
      {label}
    </div>
  )
}

function SeatPOVPreview({ seat, x, y }) {
  // Trích xuất thông tin hàng và số ghế
  const rowChar = seat.seatCode.charAt(0)
  const seatNum = parseInt(seat.seatCode.substring(1))
  
  // Tính toán góc quay ngang (Horizontal Rotation)
  const centerX = 8.5 
  const diffX = seatNum - centerX
  const rotationY = diffX * -4 
  
  const rowOffset = rowChar.charCodeAt(0) - 65 
  const scale = 1.1 - (rowOffset * 0.04) 
  const blur = Math.max(0, rowOffset - 2)

  return (
    <motion.div
      variants={modalPanel} initial="hidden" animate="show" exit="exit"
      style={{ x, y, left: 20, top: 20 }}
      className="absolute z-[100] pointer-events-none"
    >
      <div className="bg-dark-900/95 backdrop-blur-3xl border border-white/20 p-4 rounded-[2rem] shadow-[0_50px_120px_rgba(0,0,0,0.9)] w-60 overflow-hidden ring-1 ring-white/10">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[9px] font-black text-primary-400 uppercase tracking-widest bg-primary-500/10 py-0.5 px-2 rounded-full border border-primary-500/20">
            POV: {seat.seatCode}
          </div>
        </div>
        
        {/* POV Screen Simulation */}
        <div className="relative aspect-video bg-[#050505] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/5 to-transparent z-0" />

          <motion.div 
            style={{ perspective: '800px', width: '100%', height: '100%' }}
            className="flex items-center justify-center relative z-10"
          >
            <motion.div 
              animate={{ 
                rotateY: rotationY,
                scale: scale,
                x: -diffX * 2,
                filter: `blur(${blur}px)`
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-[90%] h-[75%] bg-gradient-to-br from-primary-400/30 via-white/5 to-primary-950/60 rounded-sm shadow-[0_0_50px_rgba(244,63,94,0.4)] border border-white/10 flex items-center justify-center relative"
            >
               <div className="w-[80%] h-[60%] border border-white/5 rounded-sm bg-black/40 flex items-center justify-center overflow-hidden">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-full h-full bg-gradient-to-tr from-primary-500/20 to-transparent blur-xl"
                  />
               </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
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
  const [hoveredSeat, setHoveredSeat] = useState(null)

  // Mouse Tracking for POV Preview
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { damping: 25, stiffness: 150 })
  const springY = useSpring(mouseY, { damping: 25, stiffness: 150 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

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
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-screen pt-24 pb-12 bg-[#020617] relative overflow-hidden"
    >
      {/* Mảng sương mù gradient làm nền */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-96 bg-primary-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Info bar Header */}
        {showtime && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" transition={easeOut}
            className="flex flex-wrap items-center gap-6 lg:gap-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl py-4 px-6 md:px-10 mb-10 shadow-2xl"
          >
            {[
              { label: 'Phóng sự',   val: showtime.movie?.title || showtime.movieTitle, highlight: true },
              { label: 'Suất chiếu', val: `${formatTime(showtime.startTime)} · ${formatDate(showtime.startTime)}` },
              { label: 'Phòng rạp',  val: `${showtime.room?.name} - ${showtime.cinema?.name || showtime.cinemaName}` },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-6">
                {i > 0 && <div className="hidden md:block w-px h-10 bg-white/10" />}
                <div>
                  <div className="text-dark-400 text-[10px] font-black uppercase tracking-widest mb-1">{item.label}</div>
                  <div className={`text-base font-black ${item.highlight ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-200' : 'text-white'}`}>
                    {item.val}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Cấu trúc Layout Chính */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

            <div 
              onMouseMove={handleMouseMove}
              className="flex-1 w-full bg-dark-950/40 backdrop-blur-md border border-white/5 rounded-[3rem] p-6 sm:p-10 shadow-2xl overflow-hidden relative group/hall"
            >
              
              {/* Floor Reflection Effect */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary-900/10 to-transparent pointer-events-none z-0" />
              
              {/* ─── Massive IMAX Curved Screen Redesign ─── */}
              <motion.div 
                variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.1 }} 
                className="mb-8 mt-2 relative z-30"
                style={{ perspective: '1000px' }}
              >
                <div className="relative w-full max-w-4xl mx-auto h-32 flex flex-col items-center justify-start">
                  
                  {/* Screen Body with 3D Tilt */}
                  <motion.div 
                    initial={{ rotateX: -20, y: -20, opacity: 0 }}
                    animate={{ rotateX: -10, y: 0, opacity: 1 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full h-8 bg-white/5 border-t border-white/20 rounded-[50%_50%_0_0/100%_100%_0_0] shadow-[0_-20px_80px_rgba(244,63,94,0.4)] overflow-hidden"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                     {/* Screen Gloss & Reflection */}
                     <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                     <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20" />
                     
                     {/* Dynamic Projector Light (Flicker) */}
                     <motion.div 
                        animate={{ opacity: [0.1, 0.3, 0.1, 0.2, 0.1] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute inset-0 bg-primary-500/20 blur-xl"
                     />
                  </motion.div>

                  {/* Main Screen Surface (The "Glowing" part) */}
                  <div className="absolute top-0 w-[110%] h-48 -translate-y-16 pointer-events-none">
                     {/* Primary Screen Glow */}
                     <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary-500/10 via-primary-500/5 to-transparent blur-[80px]" />
                     
                     {/* Sharp Rim Light */}
                     <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[90%] h-1 border-t border-primary-400/50 rounded-[50%] blur-[1px] shadow-[0_0_20px_rgba(244,63,94,1)]" />
                  </div>

                  {/* Bottom Perspective Reflection on the "Floor" */}
                  <div className="absolute -bottom-10 w-[80%] h-20 bg-primary-900/10 blur-[40px] rounded-[50%] opacity-40" />

                  {/* Techy Screen Label */}
                  <div className="absolute top-12 flex flex-col items-center gap-1">
                    <span className="text-white/20 text-[8px] font-black tracking-[1em] uppercase">
                      {showtime?.room?.type || 'CINEMA'} ROOM
                    </span>
                    <motion.span 
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-primary-400 text-xs font-black tracking-[0.8em] uppercase drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                    >
                      {showtime?.room?.name || 'MÀN HÌNH CHÍNH'}
                    </motion.span>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mt-1" />
                  </div>
                </div>
              </motion.div>

              {/* 3D Perspective Wrapper */}
              <div style={{ perspective: '1200px' }} className="relative z-10 py-0">
                <motion.div
                  initial={{ rotateX: 10, scale: 0.95, y: 30 }}
                  animate={{ 
                    rotateX: window.innerWidth < 768 ? 10 : 25, 
                    scale: 1, 
                    y: -20 
                  }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-4 md:gap-5 items-center origin-bottom"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <motion.div
                    variants={staggerContainer(0.04, 0.15)} initial="hidden" animate="show"
                    className="flex flex-col gap-5 items-center"
                  >
                    {rows.map((row, rowIndex) => (
                      <motion.div 
                        key={row.rowLabel} 
                        variants={staggerItem} 
                        className="flex items-center gap-8"
                        style={{ transform: `translateZ(${rowIndex * 4}px)` }} // Slight depth per row
                      >
                        {/* Tên hàng ghế */}
                        <div className="w-8 text-dark-500 text-sm font-black text-right shrink-0 opacity-40">
                          {row.rowLabel}
                        </div>
                        
                        {/* Danh sách ghế */}
                        <div className="flex gap-3">
                          {(row.seats || []).map(seat => (
                            <Seat
                              key={seat.id}
                              seat={seat}
                              selected={!!selectedSeats.find(s => s.id === seat.id)}
                              onToggle={handleToggle}
                              onHover={setHoveredSeat}
                            />
                          ))}
                        </div>

                        {/* Tên hàng ghế (Phải) */}
                        <div className="w-8 text-dark-500 text-sm font-black text-left shrink-0 opacity-40">
                          {row.rowLabel}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>

              {/* Seat POV Preview Overlay follows mouse */}
              <AnimatePresence>
                {hoveredSeat && (
                  <SeatPOVPreview seat={hoveredSeat} x={springX} y={springY} />
                )}
              </AnimatePresence>

              {/* Chú thích màu ghế (Legend) */}
              <motion.div
                variants={fadeIn} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.8 }}
                className="mt-20 pt-6 py-5 px-8 bg-black/60 backdrop-blur-xl rounded-3xl flex flex-wrap justify-center gap-8 border border-white/10 shadow-inner z-20 relative"
              >
                <LegendItem bg="rgba(255,255,255,0.05)" border="rgba(255,255,255,0.2)" label="Trống" />
                <LegendItem bg="rgba(15,23,42,0.6)" border="rgba(51,65,85,0.8)" label="Đã đặt" />
                <LegendItem bg="rgba(139,92,246,0.2)" border="#8b5cf6" label="Khế VIP" />
                <LegendItem bg="rgba(236,72,153,0.2)" border="#ec4899" label="Couple" />
                <LegendItem bg="rgba(225,29,72,0.9)" border="#fb7185" label="Đang chọn" />
              </motion.div>

            </div>

          {/* ─── BÊN PHẢI: Bảng thanh toán Sticky ─── */}
          <div className="w-full lg:w-96 shrink-0 relative lg:sticky lg:top-28">
            <motion.div variants={fadeRight} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.2 }}>
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                
                {/* Tiêu đề Bảng */}
                <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                  <h3 className="font-black text-white text-xl uppercase tracking-wider">🎟️ Đặt Chỗ</h3>
                  <motion.span
                    animate={{
                      background: selectedSeats.length > 0
                        ? ['rgba(244,63,94,0.1)', 'rgba(244,63,94,0.25)', 'rgba(244,63,94,0.1)']
                        : 'rgba(51,65,85,0.4)',
                    }}
                    transition={{ duration: 2, repeat: selectedSeats.length > 0 ? Infinity : 0 }}
                    className={`px-3 py-1 text-xs font-black rounded-full border ${selectedSeats.length > 0 ? 'text-primary-400 border-primary-500/30' : 'text-dark-400 border-white/10'}`}
                  >
                    {selectedSeats.length}/8
                  </motion.span>
                </div>

                {/* Danh sách ghế cuộn */}
                <div className="max-h-[300px] overflow-y-auto scrollbar-hide pr-2 mb-6">
                  <AnimatePresence>
                    {selectedSeats.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-4 opacity-50">
                          💺
                        </motion.div>
                        <p className="text-dark-300 font-bold uppercase tracking-widest text-xs">Chưa có vị trí nào</p>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                        <AnimatePresence>
                          {selectedSeats.map(s => (
                            <motion.div
                              key={s.id} layout
                              initial={{ opacity: 0, scale: 0.9, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9, x: -20 }} transition={spring}
                              className="flex justify-between items-center bg-white/5 border border-white/10 py-3 px-4 rounded-2xl"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-white font-black text-base">{s.seatCode}</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                    s.type === 'VIP' ? 'bg-purple-500/20 text-purple-300' : s.type === 'COUPLE' ? 'bg-pink-500/20 text-pink-300' : 'bg-dark-700/50 text-dark-300'
                                }`}>
                                  {s.type}
                                </span>
                              </div>
                              <span className="text-primary-400 font-bold text-sm tracking-wide">{formatPrice(s.price)}</span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tổng tiền */}
                <div className="pt-6 border-t border-white/10 mb-8 flex justify-between items-end">
                  <span className="text-dark-300 font-black uppercase tracking-widest text-xs mb-1">Tạm tính</span>
                  <motion.span
                    key={totalPrice}
                    initial={{ scale: 1.2, color: '#fbbf24' }} animate={{ scale: 1, color: '#fff' }} transition={spring}
                    className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-rose-300 drop-shadow-md"
                  >
                    {formatPrice(totalPrice)}
                  </motion.span>
                </div>

                {/* Các thao tác Nút */}
                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={handleContinue}
                    whileHover={selectedSeats.length > 0 ? { scale: 1.03, y: -2 } : {}}
                    whileTap={selectedSeats.length > 0 ? { scale: 0.97 } : {}}
                    animate={selectedSeats.length > 0 ? {
                      boxShadow: ['0 4px 20px rgba(225,29,72,0.35)', '0 4px 28px rgba(225,29,72,0.6)', '0 4px 20px rgba(225,29,72,0.35)'],
                    } : {}}
                    transition={{ duration: 2.5, repeat: selectedSeats.length > 0 ? Infinity : 0 }}
                    disabled={selectedSeats.length === 0}
                    className={`w-full py-4 rounded-2xl font-black text-[15px] tracking-wide transition-all ${
                      selectedSeats.length > 0 ? 'bg-gradient-to-tr from-primary-600 to-rose-600 text-white cursor-pointer' : 'bg-dark-800 text-dark-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    TIẾP TỤC BƯỚC ĐẶT VÉ
                  </motion.button>

                  <motion.button
                    onClick={() => { dispatch(clearSeats()); navigate(-1) }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm text-dark-300 hover:text-white border border-white/5 hover:bg-white/5 transition-all"
                  >
                    ← QUAY LẠI CHỌN SUẤT
                  </motion.button>
                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}
