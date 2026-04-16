import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { movieApi } from '../../api/movieApi'
import { PageLoader } from '../../components/common/Spinner'
import { MOVIE_STATUS, AGE_RATING, formatDate } from '../../utils/helpers'
import {
  fadeUp, fadeIn, fadeLeft, fadeRight, scaleIn, slideDown,
  staggerContainer, staggerItem, spring, easeOut,
} from '../../utils/motion'

/* ─── Floating orb (background decoration) ─── */
function Orb({ style }) {
  return (
    <motion.div
      style={style}
      animate={{ y: [0, -28, 12, 0], x: [0, 14, -10, 0], scale: [1, 1.06, 0.96, 1] }}
      transition={{ duration: 14 + Math.random() * 6, repeat: Infinity, ease: 'easeInOut' }}
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

/* ─── Movie card ─── */
function MovieCard({ movie }) {
  const status = MOVIE_STATUS[movie.status] || {}
  const rating = AGE_RATING[movie.ageRating] || { label: movie.ageRating, color: 'bg-dark-600' }

  return (
    <motion.div variants={staggerItem} whileHover="hover" whileTap={{ scale: 0.97 }}>
      <Link to={`/movies/${movie.id}`} className="block">
        <motion.div
          className="card group overflow-hidden"
          variants={{ hover: { y: -6, boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(244,63,94,0.2)' } }}
          transition={spring}
        >
          {/* Poster */}
          <div className="relative overflow-hidden aspect-[2/3]">
            <motion.img
              src={movie.posterUrl || 'https://placehold.co/300x450/1e293b/94a3b8?text=No+Poster'}
              alt={movie.title}
              className="w-full h-full object-cover"
              variants={{ hover: { scale: 1.1 } }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"
              initial={{ opacity: 0 }}
              variants={{ hover: { opacity: 1 } }}
              transition={{ duration: 0.3 }}
            />
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              variants={{ hover: { opacity: 1 } }}
              initial={{ opacity: 0 }}
            >
              <motion.div
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                }}
                variants={{ hover: { x: ['−100%', '200%'] } }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
              />
            </motion.div>
            {/* Badges */}
            <div className={`absolute top-2 left-2 ${rating.color} text-white text-xs font-bold px-2 py-0.5 rounded shadow`}>
              {rating.label}
            </div>
            <div className={`absolute top-2 right-2 ${status.color} text-xs font-semibold px-2 py-1 rounded-full`}>
              {status.label}
            </div>
            {/* CTA */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-3"
              initial={{ y: '100%' }}
              variants={{ hover: { y: 0 } }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            >
              <div className="btn-primary w-full text-center text-sm py-2 shadow-lg shadow-primary-500/40">
                🎬 Đặt vé
              </div>
            </motion.div>
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="font-semibold text-white text-sm line-clamp-2 leading-tight group-hover:text-primary-400 transition-colors">
              {movie.title}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-dark-400 text-xs">{movie.duration} phút</span>
              {movie.releaseDate && <span className="text-dark-500 text-xs">{formatDate(movie.releaseDate)}</span>}
            </div>
            {movie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {movie.genres.slice(0, 2).map((g, i) => (
                  <span key={i} className="text-xs bg-dark-800 text-dark-300 px-2 py-0.5 rounded group-hover:bg-primary-900/40 group-hover:text-primary-300 transition-colors">
                    {typeof g === 'string' ? g : g.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

/* ─── Stat item ─── */
function StatItem({ num, label, icon, delay }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ ...easeOut, delay }}
      className="text-center"
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-black text-primary-400">
        <AnimatedCounter target={num} />
      </div>
      <div className="text-dark-500 text-xs mt-1">{label}</div>
    </motion.div>
  )
}

export default function HomePage() {
  const [nowShowing, setNowShowing] = useState([])
  const [comingSoon, setComingSoon] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      movieApi.getNowShowing({ size: 8 }),
      movieApi.getComingSoon({ size: 6 }),
    ]).then(([nsRes, csRes]) => {
      const ns = nsRes.data.data
      const cs = csRes.data.data
      setNowShowing(ns.content || ns || [])
      setComingSoon(cs.content || cs || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center" style={{ paddingTop: 80 }}>

        {/* BG gradient */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 120% 100% at 50% 0%, #1e1b4b 0%, #0f172a 55%, #020617 100%)',
        }} />

        {/* Floating orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Orb style={{
            position: 'absolute', top: '12%', left: '5%', width: 520, height: 520,
            background: 'radial-gradient(circle, rgba(244,63,94,0.18) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(45px)',
          }} />
          <Orb style={{
            position: 'absolute', top: '38%', right: '5%', width: 380, height: 380,
            background: 'radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(55px)',
          }} />
          <Orb style={{
            position: 'absolute', bottom: '8%', left: '28%', width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(65px)',
          }} />
          {/* Scatter particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                left: `${8 + i * 12}%`,
                top: `${18 + (i % 3) * 22}%`,
                width: 4 + (i % 3) * 2,
                height: 4 + (i % 3) * 2,
                borderRadius: '50%',
                background: i % 2 === 0 ? 'rgba(244,63,94,0.65)' : 'rgba(139,92,246,0.65)',
              }}
              animate={{ y: [0, -22, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 4 + i * 0.7, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
            />
          ))}
          {/* Scan line */}
          <motion.div
            style={{
              position: 'absolute', left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.4), transparent)',
            }}
            animate={{ top: ['-5%', '110%'] }}
            transition={{ duration: 6, repeat: Infinity, delay: 2, ease: 'linear', repeatDelay: 4 }}
          />
          {/* Grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(244,63,94,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,0.025) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }} />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 w-full">

          {/* Badge */}
          <motion.div
            variants={slideDown}
            initial="hidden"
            animate="show"
            transition={{ ...easeOut, delay: 0 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.26)',
              color: '#fb7185', fontSize: 13, fontWeight: 600,
              padding: '8px 22px', borderRadius: 999, marginBottom: 32,
            }}
          >
            <motion.span
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#fb7185', display: 'inline-block' }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            🎬 Hệ thống đặt vé trực tuyến số 1 Việt Nam
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ ...easeOut, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.6rem, 7vw, 5.5rem)',
              fontWeight: 900, color: '#ffffff', lineHeight: 1.1, marginBottom: 24,
            }}
          >
            Xem phim,{' '}
            <span style={{
              background: 'linear-gradient(135deg, #fb7185 0%, #e11d48 40%, #a855f7 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>đặt vé</span>
            <br />dễ như ăn bánh
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ ...easeOut, delay: 0.22 }}
            style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}
          >
            Chọn phim yêu thích, chọn ghế ngồi, thanh toán nhanh chóng.<br />
            Nhận QR code xác nhận ngay lập tức.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ ...easeOut, delay: 0.32 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }} transition={spring}>
              <Link to="/movies?status=NOW_SHOWING" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                color: '#fff', fontWeight: 700, fontSize: 15,
                padding: '14px 32px', borderRadius: 16, textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(225,29,72,0.4)',
              }}>
                🎬 Đặt vé ngay
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }} transition={spring}>
              <Link to="/movies?status=COMING_SOON" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)', color: '#fff', fontWeight: 700, fontSize: 15,
                padding: '14px 32px', borderRadius: 16, textDecoration: 'none',
              }}>
                🗓 Sắp ra mắt
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 380, margin: '64px auto 0' }}
            initial="hidden"
            animate="show"
          >
            <StatItem num="50+" label="Phim / tháng" icon="🎥" delay={0.5} />
            <StatItem num="20+" label="Rạp chiếu"    icon="🏟️" delay={0.6} />
            <StatItem num="100K+" label="Khách hàng" icon="👥" delay={0.7} />
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(to bottom, transparent, #020617)',
          pointerEvents: 'none',
        }} />
      </section>

      {/* ─── TICKER ─── */}
      <div style={{
        overflow: 'hidden',
        borderTop: '1px solid rgba(244,63,94,0.1)',
        borderBottom: '1px solid rgba(244,63,94,0.1)',
        background: 'rgba(244,63,94,0.03)',
        padding: '10px 0',
      }}>
        <motion.div
          style={{ display: 'flex', width: 'max-content', gap: 0 }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(2)].map((_, rep) =>
            ['🔥 Phim hot tuần này', '⭐ Ưu đãi thành viên', '🎟️ Giảm 20% thứ 4', '🍿 Combo bắp nước', '🎬 Phim mới mỗi tuần', '🏆 Top #1 Việt Nam']
              .map((item, i) => (
                <span key={`${rep}-${i}`} style={{
                  whiteSpace: 'nowrap', padding: '0 48px',
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
                  color: i % 2 === 0 ? '#fb7185' : '#94a3b8',
                }}>
                  {item}
                </span>
              ))
          )}
        </motion.div>
      </div>

      {/* ─── MOVIE SECTIONS ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-16">

        {/* Now Showing */}
        <AnimatePresence>
          {nowShowing.length > 0 && (
            <motion.section
              className="mb-20"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              transition={easeOut}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <motion.div
                    style={{
                      width: 4, height: 36, borderRadius: 4,
                      background: 'linear-gradient(to bottom, #fb7185, #e11d48)',
                    }}
                    animate={{ boxShadow: ['0 0 8px rgba(244,63,94,0.3)', '0 0 20px rgba(244,63,94,0.65)', '0 0 8px rgba(244,63,94,0.3)'] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>Đang Chiếu</h2>
                    <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Những bộ phim đang được chiếu tại rạp</p>
                  </div>
                </div>
                <motion.div whileHover={{ x: 4 }} transition={spring}>
                  <Link to="/movies?status=NOW_SHOWING" style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: '#fb7185', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    padding: '8px 16px', borderRadius: 10,
                    border: '1px solid rgba(244,63,94,0.2)',
                    background: 'rgba(244,63,94,0.05)',
                  }}>
                    Xem tất cả →
                  </Link>
                </motion.div>
              </div>

              {/* Cards */}
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                variants={staggerContainer(0.07)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
              >
                {nowShowing.slice(0, 6).map(m => <MovieCard key={m.id} movie={m} />)}
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Feature banner */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          transition={easeOut}
          style={{
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(225,29,72,0.12) 0%, rgba(139,92,246,0.12) 100%)',
            border: '1px solid rgba(244,63,94,0.2)',
            padding: '40px 48px', marginBottom: 80,
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <Orb style={{
            position: 'absolute', top: -60, right: -60, width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(244,63,94,0.2), transparent)',
            borderRadius: '50%', filter: 'blur(30px)',
          }} />
          {[
            { icon: '⚡', title: 'Đặt vé siêu nhanh', desc: 'Chọn ghế & thanh toán chỉ trong 60 giây' },
            { icon: '🎟️', title: 'QR code tức thì',   desc: 'Nhận vé điện tử ngay sau khi thanh toán' },
            { icon: '🔐', title: 'Bảo mật tuyệt đối', desc: 'Thông tin được mã hóa SSL an toàn' },
            { icon: '🎁', title: 'Ưu đãi hấp dẫn',   desc: 'Nhiều mã giảm giá và combo hot mỗi tuần' },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ ...easeOut, delay: i * 0.08 }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginBottom: 4 }}>{f.title}</div>
              <div style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Coming Soon */}
        <AnimatePresence>
          {comingSoon.length > 0 && (
            <motion.section
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              transition={easeOut}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <motion.div
                    style={{
                      width: 4, height: 36, borderRadius: 4,
                      background: 'linear-gradient(to bottom, #a855f7, #7c3aed)',
                    }}
                    animate={{ boxShadow: ['0 0 8px rgba(168,85,247,0.3)', '0 0 20px rgba(168,85,247,0.65)', '0 0 8px rgba(168,85,247,0.3)'] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>Sắp Chiếu</h2>
                    <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Những bộ phim sắp ra mắt</p>
                  </div>
                </div>
                <motion.div whileHover={{ x: 4 }} transition={spring}>
                  <Link to="/movies?status=COMING_SOON" style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: '#a855f7', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    padding: '8px 16px', borderRadius: 10,
                    border: '1px solid rgba(168,85,247,0.2)',
                    background: 'rgba(168,85,247,0.05)',
                  }}>
                    Xem tất cả →
                  </Link>
                </motion.div>
              </div>

              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                variants={staggerContainer(0.07)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
              >
                {comingSoon.slice(0, 6).map(m => <MovieCard key={m.id} movie={m} />)}
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
