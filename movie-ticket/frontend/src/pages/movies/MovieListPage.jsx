import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { movieApi } from '../../api/movieApi'
import Pagination from '../../components/common/Pagination'
import { PageLoader } from '../../components/common/Spinner'
import { MOVIE_STATUS, AGE_RATING, formatDate } from '../../utils/helpers'

function MovieCard({ movie }) {
  const status = MOVIE_STATUS[movie.status] || {}
  const rating = AGE_RATING[movie.ageRating] || { label: movie.ageRating, color: 'bg-dark-600' }

  return (
    <Link to={`/movies/${movie.id}`} className="card-hover group flex gap-4 p-3">
      <div className="relative w-20 flex-shrink-0 rounded-xl overflow-hidden">
        <img
          src={movie.posterUrl || 'https://placehold.co/80x120/1e293b/94a3b8?text=?'}
          alt={movie.title}
          className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className={`absolute top-1 left-1 ${rating.color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}>
          {rating.label}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-primary-400 transition-colors">{movie.title}</h3>
        <div className={`badge-status mt-1.5 ${status.color}`}>{status.label}</div>
        <div className="flex flex-wrap gap-1 mt-2">
          {(movie.genres || []).slice(0, 3).map((g, i) => (
            <span key={i} className="text-xs bg-dark-800 text-dark-300 px-2 py-0.5 rounded">
              {typeof g === 'string' ? g : g.name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-dark-400">
          <span>⏱ {movie.duration} phút</span>
          {movie.releaseDate && <span>📅 {formatDate(movie.releaseDate)}</span>}
        </div>
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

  const status = searchParams.get('status') || ''
  const genreId = searchParams.get('genreId') || ''
  const keyword = searchParams.get('keyword') || ''
  const page = parseInt(searchParams.get('page') || '0')

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

  const handleSearch = (e) => {
    e.preventDefault()
    setParam('keyword', searchInput)
  }

  const statusTabs = [
    { value: '', label: 'Tất cả' },
    { value: 'NOW_SHOWING', label: 'Đang chiếu' },
    { value: 'COMING_SOON', label: 'Sắp chiếu' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Phim</h1>
          <p className="text-dark-400">Khám phá các bộ phim đang chiếu và sắp ra mắt</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Status tabs */}
          <div className="flex gap-1 bg-dark-900 rounded-xl p-1 border border-dark-700">
            {statusTabs.map(t => (
              <button
                key={t.value}
                onClick={() => setParam('status', t.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  status === t.value
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-300 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Genre */}
          <select
            value={genreId}
            onChange={e => setParam('genreId', e.target.value)}
            className="input-field w-auto"
          >
            <option value="">Tất cả thể loại</option>
            {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              className="input-field flex-1"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn-primary px-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-dark-700 border-t-primary-500 rounded-full animate-spin" /></div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
            </svg>
            <p>Không tìm thấy phim nào</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {movies.map(m => <MovieCard key={m.id} movie={m} />)}
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
