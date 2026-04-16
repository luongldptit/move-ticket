import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { movieApi } from '../../api/movieApi'
import Pagination from '../../components/common/Pagination'
import { MOVIE_STATUS, AGE_RATING, formatDate } from '../../utils/helpers'
import {
  fadeUp, fadeIn, staggerContainer, staggerItem, scaleIn, spring, easeOut,
} from '../../utils/motion'

/* ─── Skeleton card (Vertical) ─── */
function SkeletonCard() {
  return (
    <motion.div
      variants={staggerItem}
      style={{
        background: 'rgba(15,23,42,0.6)',
        border: '1px solid rgba(51,65,85,0.4)',
        borderRadius: 20, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <motion.div
        style={{ width: '100%', aspectRatio: '2/3', background: '#1e293b' }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[80, 50, 65].map((w, i) => (
          <motion.div
            key={i}
            style={{ height: 12, width: `${w}%`, borderRadius: 6, background: '#334155' }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Premium Movie Card (Vertical Portrait) ─── */
function MovieCard({ movie }) {
  const status = MOVIE_STATUS[movie.status] || {}
  const rating = AGE_RATING[movie.ageRating] || { label: movie.ageRating, color: 'bg-dark-600' }

  return (
    <motion.div variants={staggerItem} style={{ userSelect: 'none' }}>
      <Link to={`/movies/${movie.id}`} className="block group" style={{ textDecoration: 'none' }}>
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative rounded-2xl overflow-hidden bg-black shadow-lg"
          style={{ aspectRatio: '2/3', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Glassmorphism reflection */}
          <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
               style={{ background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.1) 25%, transparent 30%)' }} />

          {/* Poster Image */}
          <motion.img
            src={movie.posterUrl || 'https://placehold.co/400x600/1e293b/94a3b8?text=No+Poster'}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Core Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300" />

          {/* Top Badges */}
          <div className="absolute top-3 inset-x-3 flex justify-between items-start z-10">
            <span className={`${rating.color} text-white text-[11px] font-black px-2 py-1 rounded-md shadow-md uppercase tracking-wider`}>
              {rating.label}
            </span>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow" style={{
              background: movie.status === 'NOW_SHOWING' ? 'rgba(34,197,94,0.8)' : 'rgba(251,191,36,0.8)',
              color: '#fff', backdropFilter: 'blur(4px)'
            }}>
              {status.label}
            </span>
          </div>

          {/* Hover Play Button */}
          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-primary-600/80 backdrop-blur-md flex items-center justify-center text-white shadow-xl scale-75 group-hover:scale-100 transition-transform duration-300">
              ▶
            </div>
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 inset-x-0 p-4 z-10 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-extrabold text-white text-base lg:text-lg line-clamp-2 leading-tight mb-2 drop-shadow-md">
              {movie.title}
            </h3>
            
            <div className="flex flex-wrap gap-1.5 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
              {(movie.genres || []).slice(0, 3).map((g, i) => (
                <span key={i} className="text-[10px] bg-white/10 text-white/90 px-2 py-0.5 rounded backdrop-blur-sm border border-white/5 whitespace-nowrap">
                  {typeof g === 'string' ? g : g.name}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1"><span className="text-primary-400">⏱</span> {movie.duration}p</span>
              {movie.releaseDate && <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"><span className="text-blue-400">📅</span> {formatDate(movie.releaseDate)}</span>}
            </div>
          </div>
          
          {/* Card outer glow on hover */}
          <div className="absolute inset-0 rounded-2xl ring-2 ring-primary-500/0 group-hover:ring-primary-500/50 transition-all duration-300 pointer-events-none shadow-[inset_0_0_20px_rgba(244,63,94,0)] group-hover:shadow-[inset_0_0_20px_rgba(244,63,94,0.3)]" />
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default function MovieListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  const status  = searchParams.get('status')  || ''
  const genreId = searchParams.get('genreId') || ''
  const keyword = searchParams.get('keyword') || ''
  const page    = parseInt(searchParams.get('page') || '0')
  const [searchInput, setSearchInput] = useState(keyword)

  useEffect(() => {
    movieApi.getGenres().then(r => setGenres(r.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    movieApi.getMovies({ status, genreId, keyword, page, size: 12 })
      .then(r => {
        const d = r.data.data
        setMovies(d.content || [])
        setTotalPages(d.totalPages || 0)
      }).catch(console.error).finally(() => setLoading(false))
  }, [status, genreId, keyword, page])

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const handleSearch = (e) => { e.preventDefault(); setParam('keyword', searchInput) }

  const statusTabs = [
    { value: '', label: '🎬 Tất cả' },
    { value: 'NOW_SHOWING', label: '▶ Đang chiếu' },
    { value: 'COMING_SOON', label: '🗓 Sắp chiếu' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '100vh', paddingTop: 96, paddingBottom: 64, background: '#020617', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div style={{ relative: 'true', maxWidth: 1280, margin: '0 auto', padding: '0 24px', zIndex: 10 }}>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={easeOut} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>
            Danh sách{' '}
            <span style={{
              background: 'linear-gradient(135deg, #fb7185, #a855f7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Phim</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Khám phá các bộ phim đang chiếu và sắp ra mắt</p>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ ...easeOut, delay: 0.08 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}
        >
          {/* Status tabs */}
          <div style={{
            display: 'flex', gap: 4, background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(51,65,85,0.8)', borderRadius: 14, padding: 4,
          }}>
            {statusTabs.map(t => (
              <motion.button
                key={t.value}
                onClick={() => setParam('status', t.value)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                  background: status === t.value ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'transparent',
                  color: status === t.value ? '#fff' : '#94a3b8',
                  boxShadow: status === t.value ? '0 4px 12px rgba(225,29,72,0.4)' : 'none',
                  transition: 'color 0.2s, background 0.2s',
                }}
              >
                {t.label}
              </motion.button>
            ))}
          </div>

          {/* Genre */}
          <select
            value={genreId} onChange={e => setParam('genreId', e.target.value)}
            style={{
              background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(51,65,85,0.8)',
              borderRadius: 12, padding: '8px 16px', color: '#cbd5e1', fontSize: 13, cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">🎭 Tất cả thể loại</option>
            {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: '#64748b', fontSize: 16, pointerEvents: 'none',
              }}>🔍</span>
              <input
                type="text" placeholder="Tìm kiếm phim..." value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                style={{
                  width: '100%', padding: '10px 16px 10px 42px',
                  background: 'rgba(15,23,42,0.9)', border: '1.5px solid rgba(51,65,85,0.8)',
                  borderRadius: 12, color: '#fff', fontSize: 13, outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(244,63,94,0.5)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(51,65,85,0.8)' }}
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              style={{
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                border: 'none', borderRadius: 12, padding: '10px 20px',
                color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13,
                boxShadow: '0 4px 12px rgba(225,29,72,0.35)',
              }}
            >
              Tìm
            </motion.button>
          </form>
        </motion.div>

        {/* Result hint */}
        <AnimatePresence>
          {!loading && movies.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}
            >
              Tìm thấy <span style={{ color: '#fb7185', fontWeight: 700 }}>{movies.length}</span> phim
              {keyword && <> cho "<span style={{ color: '#e2e8f0' }}>{keyword}</span>"</>}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Movie list */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              variants={staggerContainer(0.06)} initial="hidden" animate="show"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}
            >
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : movies.length === 0 ? (
            <motion.div
              key="empty"
              variants={scaleIn} initial="hidden" animate="show"
              style={{ textAlign: 'center', padding: '80px 0' }}
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: 64, marginBottom: 16 }}
              >
                🎬
              </motion.div>
              <p style={{ color: '#64748b', fontSize: 16 }}>Không tìm thấy phim nào</p>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                onClick={() => setSearchParams({})}
                style={{
                  marginTop: 16, background: 'rgba(244,63,94,0.1)',
                  border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185',
                  borderRadius: 10, padding: '8px 20px', cursor: 'pointer', fontSize: 13,
                }}
              >
                Xem tất cả phim
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="list">
              <motion.div
                variants={staggerContainer(0.055)} initial="hidden" animate="show"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}
              >
                {movies.map(m => <MovieCard key={m.id} movie={m} />)}
              </motion.div>
              <Pagination
                currentPage={page} totalPages={totalPages}
                onPageChange={p => {
                  const next = new URLSearchParams(searchParams)
                  next.set('page', p)
                  setSearchParams(next)
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
