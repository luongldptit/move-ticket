import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { movieApi } from '../../api/movieApi'
import Pagination from '../../components/common/Pagination'
import { MOVIE_STATUS, AGE_RATING, formatDate } from '../../utils/helpers'
import { KEYFRAMES, staggerStyle } from '../../utils/animations'

/* ───── Skeleton card ───── */
function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(30,41,59,0.8)',
      border: '1px solid rgba(51,65,85,0.6)',
      borderRadius: 16,
      padding: 12,
      display: 'flex', gap: 16,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ width: 80, borderRadius: 10, aspectRatio: '2/3', flexShrink: 0,
        background: 'linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmerSlide 1.5s ease-in-out infinite',
      }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 14, width: '80%', borderRadius: 6,
          background: 'linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmerSlide 1.5s ease-in-out infinite 0.1s',
        }} />
        <div style={{ height: 14, width: '55%', borderRadius: 6,
          background: 'linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmerSlide 1.5s ease-in-out infinite 0.2s',
        }} />
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {[40, 55, 48].map((w, i) => (
            <div key={i} style={{ height: 20, width: w, borderRadius: 6,
              background: 'linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
              backgroundSize: '200% 100%',
              animation: `shimmerSlide 1.5s ease-in-out infinite ${0.1 * i}s`,
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───── Movie card ───── */
function MovieCard({ movie, index = 0 }) {
  const [hovered, setHovered] = useState(false)
  const status = MOVIE_STATUS[movie.status] || {}
  const rating = AGE_RATING[movie.ageRating] || { label: movie.ageRating, color: 'bg-dark-600' }

  return (
    <Link
      to={`/movies/${movie.id}`}
      style={{ textDecoration: 'none', display: 'block', ...staggerStyle(index) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: hovered ? 'rgba(30,41,59,0.95)' : 'rgba(15,23,42,0.8)',
        border: hovered ? '1px solid rgba(244,63,94,0.4)' : '1px solid rgba(51,65,85,0.5)',
        borderRadius: 16,
        padding: 12,
        display: 'flex', gap: 14,
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(244,63,94,0.15)' : '0 2px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer', overflow: 'hidden',
      }}>
        {/* Poster */}
        <div style={{ width: 80, flexShrink: 0, borderRadius: 10, overflow: 'hidden', position: 'relative', aspectRatio: '2/3' }}>
          <img
            src={movie.posterUrl || 'https://placehold.co/80x120/1e293b/94a3b8?text=?'}
            alt={movie.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.5s ease',
            }}
          />
          <div style={{
            position: 'absolute', top: 4, left: 4,
            background: 'rgba(0,0,0,0.8)',
            borderRadius: 4, padding: '2px 6px',
            fontSize: 10, fontWeight: 700, color: '#fff',
          }}>
            {rating.label}
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontWeight: 700, color: hovered ? '#fb7185' : '#fff',
            fontSize: 14, lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            transition: 'color 0.2s',
            margin: 0,
          }}>
            {movie.title}
          </h3>

          {/* Status badge */}
          <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
              background: movie.status === 'NOW_SHOWING' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)',
              color: movie.status === 'NOW_SHOWING' ? '#4ade80' : '#fbbf24',
              border: `1px solid ${movie.status === 'NOW_SHOWING' ? 'rgba(34,197,94,0.3)' : 'rgba(251,191,36,0.3)'}`,
            }}>
              {status.label}
            </span>
          </div>

          {/* Genres */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {(movie.genres || []).slice(0, 3).map((g, i) => (
              <span key={i} style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 6,
                background: 'rgba(51,65,85,0.8)',
                color: hovered ? '#cbd5e1' : '#94a3b8',
                transition: 'color 0.2s',
              }}>
                {typeof g === 'string' ? g : g.name}
              </span>
            ))}
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: '#64748b' }}>
            <span>⏱ {movie.duration} phút</span>
            {movie.releaseDate && <span>📅 {formatDate(movie.releaseDate)}</span>}
          </div>
        </div>

        {/* Arrow indicator */}
        <div style={{
          alignSelf: 'center', flexShrink: 0,
          color: '#fb7185', fontSize: 18, fontWeight: 300,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(-8px)',
          transition: 'all 0.25s ease',
        }}>›</div>
      </div>
    </Link>
  )
}

export default function MovieListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const status = searchParams.get('status') || ''
  const genreId = searchParams.get('genreId') || ''
  const keyword = searchParams.get('keyword') || ''
  const page = parseInt(searchParams.get('page') || '0')
  const [searchInput, setSearchInput] = useState(keyword)

  useEffect(() => {
    setTimeout(() => setMounted(true), 80)
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

  const handleSearch = (e) => {
    e.preventDefault()
    setParam('keyword', searchInput)
  }

  const statusTabs = [
    { value: '', label: '🎬 Tất cả' },
    { value: 'NOW_SHOWING', label: '▶ Đang chiếu' },
    { value: 'COMING_SOON', label: '🗓 Sắp chiếu' },
  ]

  return (
    <div style={{ minHeight: '100vh', paddingTop: 96, paddingBottom: 64, background: '#020617' }}>
      <style>{KEYFRAMES}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{
          marginBottom: 32,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(-20px)',
          transition: 'all 0.6s ease',
        }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.2 }}>
            Danh sách{' '}
            <span style={{
              background: 'linear-gradient(135deg, #fb7185, #a855f7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Phim</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: 6, margin: 0 }}>
            Khám phá các bộ phim đang chiếu và sắp ra mắt
          </p>
        </div>

        {/* Filter bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(16px)',
          transition: 'all 0.6s ease 0.1s',
        }}>
          {/* Status tabs */}
          <div style={{
            display: 'flex', gap: 4,
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(51,65,85,0.8)',
            borderRadius: 14, padding: 4,
            backdropFilter: 'blur(10px)',
          }}>
            {statusTabs.map(t => (
              <button
                key={t.value}
                onClick={() => setParam('status', t.value)}
                style={{
                  padding: '8px 18px', borderRadius: 10,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: status === t.value
                    ? 'linear-gradient(135deg, #e11d48, #be123c)'
                    : 'transparent',
                  color: status === t.value ? '#fff' : '#94a3b8',
                  transition: 'all 0.2s',
                  boxShadow: status === t.value ? '0 4px 12px rgba(225,29,72,0.4)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Genre select */}
          <select
            value={genreId}
            onChange={e => setParam('genreId', e.target.value)}
            style={{
              background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(51,65,85,0.8)',
              borderRadius: 12, padding: '8px 16px', color: '#cbd5e1', fontSize: 13,
              cursor: 'pointer', backdropFilter: 'blur(10px)', outline: 'none',
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
                type="text"
                placeholder="Tìm kiếm phim..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                style={{
                  width: '100%', padding: '10px 16px 10px 42px',
                  background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(51,65,85,0.8)',
                  borderRadius: 12, color: '#fff', fontSize: 13,
                  backdropFilter: 'blur(10px)', outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(244,63,94,0.5)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(51,65,85,0.8)' }}
              />
            </div>
            <button type="submit" style={{
              background: 'linear-gradient(135deg, #e11d48, #be123c)',
              border: 'none', borderRadius: 12, padding: '10px 20px',
              color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13,
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 4px 12px rgba(225,29,72,0.35)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              Tìm
            </button>
          </form>
        </div>

        {/* Result count */}
        {!loading && movies.length > 0 && (
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16, animation: 'fadeIn 0.4s ease-out' }}>
            Tìm thấy <span style={{ color: '#fb7185', fontWeight: 700 }}>{movies.length}</span> phim
            {keyword && <span> cho "<span style={{ color: '#e2e8f0' }}>{keyword}</span>"</span>}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : movies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', animation: 'fadeSlideUp 0.5s ease-out' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎬</div>
            <p style={{ color: '#64748b', fontSize: 16 }}>Không tìm thấy phim nào</p>
            <button
              onClick={() => setSearchParams({})}
              style={{
                marginTop: 16, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
                color: '#fb7185', borderRadius: 10, padding: '8px 20px', cursor: 'pointer', fontSize: 13,
              }}
            >
              Xem tất cả phim
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {movies.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={p => {
                const next = new URLSearchParams(searchParams)
                next.set('page', p)
                setSearchParams(next)
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
