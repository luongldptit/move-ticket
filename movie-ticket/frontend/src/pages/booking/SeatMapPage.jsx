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

function SeatPOVPreview({ seat, x, y, config }) {
  if (!seat || !seat.seatCode) return null;

  const match = seat.seatCode.match(/([A-Z]+)(\d+)/);
  const rowChar = match ? match[1] : 'A';
  const seatNum = match ? parseInt(match[2]) : 8;
  
  const rowIndex = rowChar.charCodeAt(0) - 65; 
  const totalSeatsInRow = 16; 
  const centerX = (totalSeatsInRow + 1) / 2;
  const diffX = seatNum - centerX;
  
  // Lấy params từ config hoặc dùng default
  const povCfg = config?.pov || { rotationYMult: -6, rotationXBase: -22, rotationXMult: 3.8 };

  // Góc quay Y (ngang): Ghế biên nhìn vào tâm màn hình
  const rotationY = diffX * (povCfg.rotationYMult || -6); 
  
  // Góc quay X (dọc): Hàng đầu ngước lên, hàng cuối nhìn ngang
  const rotationX = (povCfg.rotationXBase || -22) + (rowIndex * (povCfg.rotationXMult || 3.8)); 
  
  // Hiệu ứng cong màn hình (Curvature)
  const distFromCenter = Math.abs(diffX);
  const screenScale = (1.25 - (rowIndex * 0.05)) * (1 + (distFromCenter * 0.015));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, rotateX: 20 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.4 }}
      style={{ x, y, left: 20, top: -125 }}
      className="absolute z-[100] pointer-events-none"
    >
      <div className="bg-slate-950/95 backdrop-blur-3xl border border-white/20 p-4 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,1)] w-72 overflow-hidden ring-1 ring-white/20">
        <div className="flex justify-between items-end mb-3 px-1">
          <div>
             <div className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-0.5">Perspective View</div>
             <div className="text-2xl font-black text-white italic tracking-tighter">GATE {seat.seatCode}</div>
          </div>
          <div className="bg-white/10 px-2 py-1 rounded text-[9px] font-bold text-slate-300 border border-white/10 uppercase">
            {seat.type}
          </div>
        </div>
        
        {/* POV Screen with IMAX Curvature Simulation */}
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/5 flex items-center justify-center shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/10 via-transparent to-black/60 z-0" />

          <div style={{ perspective: '800px' }} className="w-full h-full flex items-center justify-center">
            <motion.div 
              animate={{ 
                rotateY: rotationY,
                rotateX: rotationX,
                scale: screenScale,
              }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              className="w-[95%] h-[82%] bg-zinc-900 rounded-[5px] shadow-[0_0_120px_rgba(244,63,94,0.45)] relative overflow-hidden"
              style={{ transformStyle: 'preserve-3d' }}
            >
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=500&auto=format&fit=crop')] bg-cover bg-center opacity-75" />
               <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
               
               <motion.div 
                 animate={{ opacity: [0.1, 0.3, 0.1, 0.2, 0.1] }}
                 transition={{ duration: 0.1, repeat: Infinity }}
                 className="absolute inset-0 bg-primary-400/10 blur-3xl"
               />
            </motion.div>
          </div>

          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.9)]" />
        </div>
        
        <div className="mt-4 flex justify-between items-center border-t border-white/10 pt-3">
           <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest">Premium Ticket</span>
           <span className="text-lg font-black text-primary-400">{formatPrice(seat.price)}</span>
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
  const [roomConfig, setRoomConfig] = useState(null)

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
      const data = seatsRes.data.data;
      setRows(data.rows || [])
      if (data.config) {
        try { setRoomConfig(JSON.parse(data.config)) } catch(e) { console.error("Parse config error", e) }
      }
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

  // Cấu hình linh hoạt
  const cfg = roomConfig || {};
  const screenCfg = cfg.screen || { rotateX: -15, scale: 1, mb: 16, offsetX: 0, offsetY: 0 };
  const hallCfg = cfg.hall || { rotateX: 38, staggerZ: 45, staggerY: -12 };

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
              onMouseLeave={() => setHoveredSeat(null)}
              className="flex-1 w-full bg-dark-950/40 backdrop-blur-md border border-white/5 rounded-[3rem] p-6 sm:p-10 shadow-2xl relative group/hall"
            >
              
              {/* Floor Reflection Effect */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary-900/10 to-transparent pointer-events-none z-0" />
              
              {/* ─── Dynamic Curved Screen Redesign ─── */}
              <motion.div 
                variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.1 }} 
                className="mt-2 relative z-30"
                style={{ 
                  perspective: '1500px', 
                  marginBottom: `${screenCfg.mb || 16}rem`,
                  x: screenCfg.offsetX || 0,
                  y: screenCfg.offsetY || 0,
                }}
              >
                <div className="relative w-full max-w-4xl mx-auto h-24 flex flex-col items-center justify-center">
                  
                  {/* Real Screen Surface with Curvature */}
                  <motion.div 
                    initial={{ rotateX: -30, scale: 0.9, opacity: 0 }}
                    animate={{ rotateX: screenCfg.rotateX !== undefined ? screenCfg.rotateX : -15, scale: screenCfg.scale || 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full h-12 bg-white/10 border-t-2 border-white/30 rounded-[50%_50%_0_0/100%_100%_0_0] shadow-[0_-20px_100px_rgba(244,63,94,0.5)] overflow-hidden"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                     <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-primary-500/5 to-transparent" />
                     <motion.div 
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-primary-400/20 blur-2xl"
                     />
                  </motion.div>

                  <div className="absolute top-10 flex flex-col items-center">
                    <span className="text-primary-400 text-[10px] font-black tracking-[1.2em] uppercase drop-shadow-[0_0_15px_rgba(244,63,94,1)]">
                       {showtime?.room?.type || 'IMAX'} SCREEN
                    </span>
                    <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent mt-2" />
                  </div>
                </div>
              </motion.div>

              {/* 3D Perspective Hall with Stadium Seating */}
              <div style={{ perspective: '2000px' }} className="relative z-10 py-0">
                <motion.div
                  initial={{ rotateX: 20, scale: 0.9, y: 50 }}
                  animate={{ 
                    rotateX: hallCfg.rotateX !== undefined ? hallCfg.rotateX : 38, 
                    scale: 1, 
                    y: 0 
                  }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-6 md:gap-8 items-center origin-bottom"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <motion.div
                    variants={staggerContainer(0.04, 0.15)} initial="hidden" animate="show"
                    className="flex flex-col gap-6 items-center"
                  >
                    {rows.map((row, rowIndex) => (
                      <motion.div 
                        key={row.rowLabel} 
                        variants={staggerItem} 
                        className="flex items-center gap-10"
                        style={{ 
                            transform: `translateZ(${rowIndex * (hallCfg.staggerZ || 45)}px) translateY(${rowIndex * (hallCfg.staggerY || -12)}px)` 
                        }}
                      >
                        <div className="w-8 text-white/20 text-xs font-black text-right shrink-0">{row.rowLabel}</div>
                        <div className="flex gap-3">
                          {(row.seats || []).map(seat => (
                            <div key={seat.id} style={{ transform: `translate3d(${seat.offsetX || 0}px, ${seat.offsetY || 0}px, ${seat.offsetZ || 0}px)` }}>
                                <Seat
                                seat={seat}
                                selected={!!selectedSeats.find(s => s.id === seat.id)}
                                onToggle={handleToggle}
                                onHover={setHoveredSeat}
                                />
                            </div>
                          ))}
                        </div>
                        <div className="w-8 text-white/20 text-xs font-black text-left shrink-0">{row.rowLabel}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>

              {/* Seat POV Preview Overlay follows mouse */}
              <AnimatePresence>
                {hoveredSeat && (
                  <SeatPOVPreview key={hoveredSeat.id} seat={hoveredSeat} x={springX} y={springY} />
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
