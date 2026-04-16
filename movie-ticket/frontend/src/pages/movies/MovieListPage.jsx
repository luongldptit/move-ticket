import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { movieApi } from '../../api/movieApi'
import Pagination from '../../components/common/Pagination'
import { MOVIE_STATUS, AGE_RATING, formatDate } from '../../utils/helpers'
import {
  fadeUp, fadeIn, staggerContainer, staggerItem, scaleIn, spring, easeOut,
} from '../../utils/motion'

/* ─── Skeleton card ─── */
function SkeletonCard() {
  return (
    <motion.div
      variants={staggerItem}
      style={{
        background: 'rgba(30,41,59,0.8)',
        border: '1px solid rgba(51,65,85,0.6)',
        borderRadius: 16, padding: 12,
        display: 'flex', gap: 14,
      }}
    >
      <motion.div
        style={{ width: 80, borderRadius: 10, flexShrink: 0, aspectRatio: '2/3', background: '#1e293b' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[80, 55, 70].map((w, i) => (
          <motion.div
            key={i}
            style={{ height: 13, width: `${w}%`, borderRadius: 6, background: '#1e293b' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Movie card (list variant) ─── */
function MovieCard({ movie }) {
  const status = MOVIE_STATUS[movie.status] || {}
  const rating = AGE_RATING[movie.ageRating] || { label: movie.ageRating, color: 'bg-dark-600' }

  return (
    <motion.div variants={staggerItem}>
      <Link to={`/movies/${movie.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <motion.div
          whileHover={{ y: -4, boxShadow: '0 16px 44px rgba(0,0,0,0.55), 0 0 0 1px rgba(244,63,94,0.25)' }}
          whileTap={{ scale: 0.98 }}
          transition={spring}
          style={{
            background: 'rgba(15,23,42,0.85)',
            border: '1px solid rgba(51,65,85,0.5)',
            borderRadius: 16, padding: 12,
            display: 'flex', gap: 14, cursor: 'pointer',
          }}
        >
          {/* Poster */}
          <div style={{ width: 80, flexShrink: 0, borderRadius: 10, overflow: 'hidden', position: 'relative', aspectRatio: '2/3' }}>
            <motion.img
              src={movie.posterUrl || 'https://placehold.co/80x120/1e293b/94a3b8?text=?'}
              alt={movie.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            <div style={{
              position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.8)',
              borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700, color: '#fff',
            }}>
              {rating.label}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontWeight: 700, color: '#fff', fontSize: 14, lineHeight: 1.4, margin: '0 0 6px',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {movie.title}
            </h3>

            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
              background: movie.status === 'NOW_SHOWING' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)',
              color: movie.status === 'NOW_SHOWING' ? '#4ade80' : '#fbbf24',
              border: `1px solid ${movie.status === 'NOW_SHOWING' ? 'rgba(34,197,94,0.3)' : 'rgba(251,191,36,0.3)'}`,
            }}>
              {status.label}
            </span>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {(movie.genres || []).slice(0, 3).map((g, i) => (
                <span key={i} style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 6,
                  background: 'rgba(51,65,85,0.8)', color: '#94a3b8',
                }}>
                  {typeof g === 'string' ? g : g.name}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: '#64748b' }}>
              <span>⏱ {movie.duration} phút</span>
              {movie.releaseDate && <span>📅 {formatDate(movie.releaseDate)}</span>}
            </div>
          </div>

          {/* Arrow */}
          <motion.span
            style={{ alignSelf: 'center', color: '#fb7185', fontSize: 20, flexShrink: 0 }}
            initial={{ opacity: 0, x: -8 }}
            whileHover={{ opacity: 1, x: 0 }}
          >
            ›
          </motion.span>
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={easeOut}
      style={{ minHeight: '100vh', paddingTop: 96, paddingBottom: 64, background: '#020617' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

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
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}
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
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}
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
