import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from 'framer-motion'
import { movieApi } from '../../api/movieApi'
import { PageLoader } from '../../components/common/Spinner'
import { MOVIE_STATUS, AGE_RATING, formatDate } from '../../utils/helpers'
import { fadeUp, fadeLeft, fadeRight, scaleIn, spring, easeOut } from '../../utils/motion'

/* ─── Background orb ─── */
function Orb({ style }) {
  return (
    <motion.div
      style={style}
      animate={{ y: [0, -24, 10, 0], x: [0, 12, -8, 0], scale: [1, 1.05, 0.97, 1] }}
      transition={{ duration: 16 + Math.random() * 6, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

/* ─── Animated counter ─── */
function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0)
  const isK = target.includes('K')
  const hasPlus = target.includes('+')
  const num = parseFloat(target.replace(/[^0-9.]/g, ''))

  useEffect(() => {
    const start = Date.now()
    const dur = 1800
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setCount(Math.floor(num * ease))
      if (p < 1) requestAnimationFrame(tick)
      else setCount(num)
    }
    requestAnimationFrame(tick)
  }, [num])

  return <>{count}{isK ? 'K' : ''}{hasPlus ? '+' : ''}</>
}

/* ─── Days until release ─── */
function DaysUntil({ dateStr }) {
  if (!dateStr) return null
  const days = Math.ceil((new Date(dateStr) - new Date()) / 86400000)
  if (days <= 0) return <span className="text-green-400 text-xs font-semibold">Đang chiếu</span>
  return <span className="text-primary-400 text-xs font-semibold">{days} ngày nữa</span>
}

/* ─── Tilt poster (hero right panel) ─── */
function TiltPoster({ movie }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-1, 1], [12, -12]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-1, 1], [-12, 12]), { stiffness: 200, damping: 20 })
  const glowX = useTransform(x, [-1, 1], ['0%', '100%'])
  const glowY = useTransform(y, [-1, 1], ['0%', '100%'])
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(255,255,255,0.14) 0%, transparent 60%)`

  const handleMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
    y.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }
  const handleLeave = () => { x.set(0); y.set(0) }

  const rating = AGE_RATING[movie?.ageRating] || { label: movie?.ageRating || 'P', color: 'bg-green-600' }
  const posterUrl = movie?.posterUrl || 'https://placehold.co/400x600/1e293b/94a3b8?text=No+Poster'

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ perspective: 800 }}
      className="relative w-full max-w-[280px] lg:max-w-[320px] mx-auto"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative rounded-2xl overflow-hidden shadow-2xl"
      >
        <img
          src={posterUrl}
          alt={movie?.title || ''}
          className="w-full object-cover"
          style={{ aspectRatio: '2/3', display: 'block' }}
        />
        {/* Dynamic light glare */}
        <motion.div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: glowBackground,
          }}
        />
        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
          padding: '24px 16px 16px',
        }}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`${rating.color} text-white text-xs font-bold px-2 py-0.5 rounded`}>{rating.label}</span>
            {movie?.genres?.slice(0, 2).map((g, i) => (
              <span key={i} className="text-xs text-dark-300 bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">
                {typeof g === 'string' ? g : g.name}
              </span>
            ))}
          </div>
          <div className="text-white font-bold text-sm line-clamp-2 leading-snug">{movie?.title}</div>
        </div>
        {/* Border glow */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 16,
          boxShadow: 'inset 0 0 0 1px rgba(244,63,94,0.25)',
          pointerEvents: 'none',
        }} />
      </motion.div>
      {/* Outer glow */}
      <div style={{
        position: 'absolute', inset: -20,
        background: 'radial-gradient(ellipse, rgba(244,63,94,0.22) 0%, transparent 70%)',
        filter: 'blur(20px)', zIndex: -1,
      }} />
    </motion.div>
  )
}

/* ─── Hero Cinematic Background ─── */
function HeroBackground({ movie }) {
  const videoId = movie?.trailerUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1]

  if (videoId) {
    return (
      <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-[110vw] h-[110vh] min-w-[177vh] min-h-[56.25vw]"
             style={{ transform: 'translate(-50%, -50%)', opacity: 0.6 }}>
          <iframe
            className="w-full h-full rounded-none"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&showinfo=0&rel=0&modestbranding=1&disablekb=1`}
            title="Background Trailer"
            allow="autoplay; encrypted-media"
            style={{ border: 'none' }}
          />
        </div>
        {/* Gradients to fade out the video towards the edges and bottom */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-transparent to-[#020617]" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#020617]/80 via-transparent to-transparent" />
      </div>
    )
  }

  if (movie?.posterUrl) {
    return (
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#020617] pointer-events-none">
        <img src={movie.posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" style={{ filter: 'blur(12px)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-transparent to-[#020617]" />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none" style={{
      background: 'radial-gradient(ellipse 130% 90% at 30% 0%, #1e1038 0%, #0f172a 50%, #020617 100%)',
    }} />
  )
}

/* ─── Now showing card (carousel, larger than coming soon) ─── */
function NowShowingCard({ movie }) {
  const status = MOVIE_STATUS[movie.status] || {}
  const rating = AGE_RATING[movie.ageRating] || { label: movie.ageRating, color: 'bg-dark-600' }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={spring}
      className="flex-shrink-0 w-40 sm:w-48 md:w-52"
      style={{ userSelect: 'none' }}
    >
      <Link to={`/movies/${movie.id}`} className="block group">
        <div className="relative rounded-xl overflow-hidden mb-3 border border-dark-700/50" style={{ aspectRatio: '2/3' }}>
          <img
            src={movie.posterUrl || 'https://placehold.co/208x312/1e293b/94a3b8?text=No+Poster'}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          {/* Badges top */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <span className={`${rating.color} text-white text-xs font-bold px-2 py-0.5 rounded shadow`}>{rating.label}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
          </div>
          {/* CTA on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-3"
            initial={{ y: '100%' }}
            whileHover={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          >
            <div className="btn-primary w-full text-center text-xs py-2 shadow-lg shadow-primary-500/40">
              🎬 Đặt vé
            </div>
          </motion.div>
        </div>
        <div className="px-1">
          <h3 className="font-semibold text-white text-sm line-clamp-2 leading-snug group-hover:text-primary-400 transition-colors mb-1">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between mb-1">
            <span className="text-dark-500 text-xs">{movie.duration} phút</span>
            {movie.releaseDate && <span className="text-dark-600 text-xs">{formatDate(movie.releaseDate)}</span>}
          </div>
          {movie.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((g, i) => (
                <span key={i} className="text-xs bg-dark-800 text-dark-400 px-2 py-0.5 rounded">
                  {typeof g === 'string' ? g : g.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── Coming soon card (carousel) ─── */
function ComingSoonCard({ movie }) {
  const rating = AGE_RATING[movie.ageRating] || { label: movie.ageRating, color: 'bg-dark-600' }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={spring}
      className="flex-shrink-0 w-44 sm:w-52"
      style={{ userSelect: 'none' }}
    >
      <Link to={`/movies/${movie.id}`} className="block group">
        <div className="relative rounded-xl overflow-hidden mb-3 border border-dark-700/50" style={{ aspectRatio: '2/3' }}>
          <img
            src={movie.posterUrl || 'https://placehold.co/208x312/1e293b/94a3b8?text=No+Poster'}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <span className={`${rating.color} text-white text-xs font-bold px-2 py-0.5 rounded shadow`}>{rating.label}</span>
            <span className="bg-dark-900/80 backdrop-blur-sm text-xs px-2 py-0.5 rounded-full border border-dark-700/50">
              <DaysUntil dateStr={movie.releaseDate} />
            </span>
          </div>
          {movie.releaseDate && (
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="text-dark-300 text-xs flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {formatDate(movie.releaseDate)}
              </div>
            </div>
          )}
        </div>
        <div className="px-1">
          <h3 className="font-semibold text-white text-sm line-clamp-2 leading-snug group-hover:text-primary-400 transition-colors mb-1">
            {movie.title}
          </h3>
          {movie.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((g, i) => (
                <span key={i} className="text-xs bg-dark-800 text-dark-400 px-2 py-0.5 rounded">
                  {typeof g === 'string' ? g : g.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── Section header ─── */
function SectionHeader({ title, subtitle, accentColor, linkTo, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <motion.div
          style={{ width: 3, height: 32, borderRadius: 4, background: accentColor }}
          animate={{
            boxShadow: [`0 0 6px ${accentColor}50`, `0 0 18px ${accentColor}80`, `0 0 6px ${accentColor}50`],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-dark-500 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {linkTo && (
        <motion.div whileHover={{ x: 3 }} transition={spring}>
          <Link to={linkTo} className="text-sm font-medium text-dark-400 hover:text-white transition-colors flex items-center gap-1">
            {linkLabel} <span>→</span>
          </Link>
        </motion.div>
      )}
    </div>
  )
}

/* ─── Features data ─── */
const FEATURES = [
  {
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Đặt vé siêu nhanh',
    desc: 'Chọn ghế & thanh toán chỉ trong 60 giây',
    bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.2)', color: '#fb7185',
  },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
      </svg>
    ),
    title: 'QR code tức thì',
    desc: 'Nhận vé điện tử ngay sau khi thanh toán',
    bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)', color: '#a855f7',
  },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Bảo mật tuyệt đối',
    desc: 'Thông tin được mã hóa SSL an toàn',
    bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', color: '#22c55e',
  },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'Ưu đãi hấp dẫn',
    desc: 'Nhiều mã giảm giá và combo hot mỗi tuần',
    bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', color: '#fbbf24',
  },
]

/* ═══════════════════════════════════════════ */
export default function HomePage() {
  const [nowShowing, setNowShowing] = useState([])
  const [comingSoon, setComingSoon] = useState([])
  const [loading, setLoading] = useState(true)
  const carouselRef = useRef(null)
  const nowShowingCarouselRef = useRef(null)

  useEffect(() => {
    Promise.all([
      movieApi.getNowShowing({ size: 8 }),
      movieApi.getComingSoon({ size: 8 }),
    ]).then(([nsRes, csRes]) => {
      const ns = nsRes.data.data
      const cs = csRes.data.data
      setNowShowing(ns.content || ns || [])
      setComingSoon(cs.content || cs || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  // Lấy phim đầu tiên có trailer, nếu ko có trailer thì phim có ảnh, nếu không có gì thì bỏ qua tìm phim tiếp theo
  const featuredMovie = nowShowing.find(m => m.trailerUrl || m.posterUrl) || null


  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >

      {/* ═══ HERO — Split Layout ═══ */}
      <section
        className="relative overflow-hidden flex items-center"
        style={{ minHeight: '92vh', paddingTop: 80 }}
      >
        {/* Background Film/Trailer */}
        <HeroBackground movie={featuredMovie} />
        
        {/* Grid lines (optional texture over background) */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{
          backgroundImage: 'linear-gradient(rgba(244,63,94,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,0.015) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Orb style={{
            position: 'absolute', top: '5%', left: '-5%', width: 560, height: 560,
            background: 'radial-gradient(circle, rgba(225,29,72,0.16) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(50px)',
          }} />
          <Orb style={{
            position: 'absolute', top: '45%', right: '-8%', width: 420, height: 420,
            background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(60px)',
          }} />
          <motion.div
            style={{
              position: 'absolute', left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.35), transparent)',
            }}
            animate={{ top: ['-5%', '110%'] }}
            transition={{ duration: 7, repeat: Infinity, delay: 3, ease: 'linear', repeatDelay: 5 }}
          />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <motion.div
                variants={fadeRight}
                initial="hidden"
                animate="show"
                transition={{ ...easeOut, delay: 0 }}
                className="inline-flex items-center gap-2 mb-6"
                style={{
                  background: 'rgba(244,63,94,0.07)',
                  border: '1px solid rgba(244,63,94,0.22)',
                  color: '#fb7185', fontSize: 12, fontWeight: 600,
                  padding: '7px 18px', borderRadius: 999,
                }}
              >
                <motion.span
                  style={{ width: 7, height: 7, borderRadius: '50%', background: '#fb7185', display: 'inline-block' }}
                  animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
                🎬 Số 1 Việt Nam về đặt vé trực tuyến
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={fadeRight}
                initial="hidden"
                animate="show"
                transition={{ ...easeOut, delay: 0.1 }}
                style={{
                  fontSize: 'clamp(2.4rem, 5.5vw, 4.8rem)',
                  fontWeight: 900, color: '#ffffff',
                  lineHeight: 1.1, marginBottom: 20,
                  letterSpacing: '-0.02em',
                }}
              >
                Xem phim hay,{' '}
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #fb7185 0%, #e11d48 45%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>đặt vé dễ</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeRight}
                initial="hidden"
                animate="show"
                transition={{ ...easeOut, delay: 0.2 }}
                className="mx-auto lg:mx-0"
                style={{
                  color: '#94a3b8', fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                  maxWidth: 440, lineHeight: 1.75, marginBottom: 36,
                }}
              >
                Chọn phim, chọn ghế, thanh toán nhanh chóng.
                Nhận QR code xác nhận ngay lập tức.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={fadeRight}
                initial="hidden"
                animate="show"
                transition={{ ...easeOut, delay: 0.28 }}
                className="flex gap-3 flex-wrap justify-center lg:justify-start mb-12"
              >
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={spring}>
                  <Link to="/movies?status=NOW_SHOWING" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'linear-gradient(135deg, #e11d48, #9f1239)',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    padding: '13px 28px', borderRadius: 14, textDecoration: 'none',
                    boxShadow: '0 6px 28px rgba(225,29,72,0.38)',
                  }}>
                    🎬 Đặt vé ngay
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={spring}>
                  <Link to="/movies?status=COMING_SOON" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(10px)',
                    color: '#cbd5e1', fontWeight: 600, fontSize: 14,
                    padding: '13px 28px', borderRadius: 14, textDecoration: 'none',
                  }}>
                    🗓 Sắp ra mắt
                  </Link>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeRight}
                initial="hidden"
                animate="show"
                transition={{ ...easeOut, delay: 0.38 }}
                className="flex gap-8 justify-center lg:justify-start"
              >
                {[
                  { num: '50+', label: 'Phim / tháng' },
                  { num: '20+', label: 'Rạp chiếu' },
                  { num: '100K+', label: 'Khách hàng' },
                ].map((s, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="text-xl font-black text-white">
                      <AnimatedCounter target={s.num} />
                    </div>
                    <div className="text-dark-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Featured poster with tilt */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              animate="show"
              transition={{ ...easeOut, delay: 0.15 }}
              className="flex-shrink-0 lg:w-[340px] xl:w-[380px] mt-10 lg:mt-0 z-10"
            >
              {featuredMovie ? (
                <TiltPoster movie={featuredMovie} />
              ) : (
                <div className="w-[280px] aspect-[2/3] rounded-2xl bg-dark-800 border border-dark-700 mx-auto" />
              )}
              {featuredMovie && (
                <motion.div
                  variants={fadeLeft}
                  initial="hidden"
                  animate="show"
                  transition={{ ...easeOut, delay: 0.32 }}
                  className="mt-4 text-center"
                >
                  <span className="text-dark-400 text-xs shadow-black drop-shadow-md">Đang chiếu • </span>
                  <Link to={`/movies/${featuredMovie.id}`} className="text-primary-400 text-xs font-semibold hover:text-primary-300 transition-colors shadow-black drop-shadow-md">
                    {featuredMovie.title}
                  </Link>
                </motion.div>
              )}
            </motion.div>

          </div>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
          background: 'linear-gradient(to bottom, transparent, #020617)',
          pointerEvents: 'none',
        }} />
      </section>

      {/* ═══ TICKER ═══ */}
      <div style={{
        overflow: 'hidden',
        borderTop: '1px solid rgba(244,63,94,0.08)',
        borderBottom: '1px solid rgba(244,63,94,0.08)',
        background: 'rgba(255,255,255,0.015)',
        backdropFilter: 'blur(8px)',
        padding: '9px 0',
      }}>
        <motion.div
          style={{ display: 'flex', width: 'max-content' }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(2)].map((_, rep) =>
            ['🔥 Phim hot tuần này', '⭐ Ưu đãi thành viên', '🎟️ Giảm 20% thứ 4', '🍿 Combo bắp nước', '🎬 Phim mới mỗi tuần', '🏆 Top #1 Việt Nam']
              .map((item, i) => (
                <span key={`${rep}-${i}`} style={{
                  whiteSpace: 'nowrap', padding: '0 52px',
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: i % 2 === 0 ? '#fb7185' : '#475569',
                }}>
                  {item}
                </span>
              ))
          )}
        </motion.div>
      </div>

      {/* ═══ MOVIE SECTIONS ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-14">

        {/* ── Now Showing — Drag Carousel ── */}
        {nowShowing.length > 0 && (
          <motion.section
            className="mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            transition={easeOut}
          >
            <SectionHeader
              title="Đang Chiếu"
              subtitle="Những bộ phim đang được chiếu tại rạp"
              accentColor="#e11d48"
              linkTo="/movies?status=NOW_SHOWING"
              linkLabel="Xem tất cả"
            />

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, #020617, transparent)' }} />
              <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to left, #020617, transparent)' }} />

              <motion.div
                ref={nowShowingCarouselRef}
                drag="x"
                dragConstraints={{ right: 0, left: -(nowShowing.length * 224) }}
                dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
                whileDrag={{ cursor: 'grabbing' }}
                className="flex gap-4 cursor-grab pb-4"
                style={{ touchAction: 'pan-y' }}
              >
                {nowShowing.map(m => <NowShowingCard key={m.id} movie={m} />)}
              </motion.div>
            </div>

            <p className="text-center text-dark-600 text-xs mt-1">← Kéo để xem thêm →</p>
          </motion.section>
        )}

        {/* ── Features ── */}
        <motion.section
          className="mb-16"
          variants={scaleIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          transition={easeOut}
        >
          <div
            className="rounded-2xl border border-dark-700/50 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(225,29,72,0.04) 0%, rgba(124,58,237,0.04) 100%)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ ...easeOut, delay: i * 0.07 }}
                  className="p-6 transition-colors duration-300 relative"
                  style={{
                    borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                  whileHover={{ backgroundColor: f.bg }}
                >
                  <motion.div
                    className="mb-4 w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: f.bg, border: `1px solid ${f.border}`, color: f.color }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={spring}
                  >
                    {f.icon()}
                  </motion.div>
                  <div className="font-bold text-white text-sm mb-1.5">{f.title}</div>
                  <div className="text-dark-400 text-xs leading-relaxed">{f.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Coming Soon — Drag Carousel ── */}
        {comingSoon.length > 0 && (
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            transition={easeOut}
          >
            <SectionHeader
              title="Sắp Chiếu"
              subtitle="Những bộ phim sắp ra mắt"
              accentColor="#a855f7"
              linkTo="/movies?status=COMING_SOON"
              linkLabel="Xem tất cả"
            />

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, #020617, transparent)' }} />
              <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to left, #020617, transparent)' }} />

              <motion.div
                ref={carouselRef}
                drag="x"
                dragConstraints={{ right: 0, left: -(comingSoon.length * 224) }}
                dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
                whileDrag={{ cursor: 'grabbing' }}
                className="flex gap-4 cursor-grab pb-4"
                style={{ touchAction: 'pan-y' }}
              >
                {comingSoon.map(m => <ComingSoonCard key={m.id} movie={m} />)}
              </motion.div>
            </div>

            <p className="text-center text-dark-600 text-xs mt-1">← Kéo để xem thêm →</p>
          </motion.section>
        )}

      </div>
    </motion.div>
  )
}
