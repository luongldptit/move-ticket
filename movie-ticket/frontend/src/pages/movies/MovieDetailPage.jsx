import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { movieApi } from '../../api/movieApi'
import { cinemaApi } from '../../api/cinemaApi'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentShowtime } from '../../store/slices/bookingSlice'
import { PageLoader } from '../../components/common/Spinner'
import { AGE_RATING, MOVIE_STATUS, formatDate, formatTime, formatPrice, getNextNDays, formatDayLabel } from '../../utils/helpers'
import { toast } from 'react-toastify'

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(s => s.auth)

  const [movie, setMovie] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [cinemas, setCinemas] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedCinema, setSelectedCinema] = useState('')
  const [loading, setLoading] = useState(true)
  const [stLoading, setStLoading] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)

  const getYoutubeEmbedUrl = useCallback((url) => {
    if (!url) return null
    // https://youtu.be/ID  hoặc  https://www.youtube.com/watch?v=ID
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`
    // Nếu đã là embed URL hoặc URL khác, trả về nguyên
    return url
  }, [])

  const days = getNextNDays(7)

  useEffect(() => {
    movieApi.getMovieById(id)
      .then(r => setMovie(r.data.data))
      .catch(() => navigate('/movies'))
      .finally(() => setLoading(false))
    cinemaApi.getCinemas().then(r => setCinemas(r.data.data || []))
  }, [id])

  useEffect(() => {
    if (!movie) return
    setStLoading(true)
    movieApi.getMovieShowtimes(id, { date: selectedDate, cinemaId: selectedCinema || undefined })
      .then(r => setShowtimes(r.data.data || []))
      .catch(() => setShowtimes([]))
      .finally(() => setStLoading(false))
  }, [id, selectedDate, selectedCinema, movie])

  const handleBookShowtime = (st) => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để đặt vé')
      navigate('/login')
      return
    }
    dispatch(setCurrentShowtime(st))
    navigate(`/showtimes/${st.id}/seats`)
  }

  if (loading) return <PageLoader />
  if (!movie) return null

  const rating = AGE_RATING[movie.ageRating] || { label: movie.ageRating, color: 'bg-dark-600', title: '' }
  const status = MOVIE_STATUS[movie.status] || {}

  // Group showtimes by cinema
  const grouped = showtimes.reduce((acc, st) => {
    const key = st.cinema?.name || 'Rạp'
    if (!acc[key]) acc[key] = []
    acc[key].push(st)
    return acc
  }, {})

  return (
    <div className="min-h-screen pt-20">
      {/* Hero / Banner */}
      <div className="relative">
        {/* Blurred backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl scale-110"
          style={{ backgroundImage: `url(${movie.posterUrl || ''})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950/60 via-dark-950/80 to-dark-950" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <img
                src={movie.posterUrl || 'https://placehold.co/256x384/1e293b/94a3b8?text=No+Poster'}
                alt={movie.title}
                className="w-full rounded-2xl shadow-2xl shadow-black/50"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-3">
                <span className={`${rating.color} text-white text-sm font-bold px-3 py-1 rounded-lg`} title={rating.title}>
                  {rating.label}
                </span>
                <span className={`badge-status ${status.color}`}>{status.label}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-white mb-4">{movie.title}</h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {(movie.genres || []).map(g => (
                  <span key={g.id} className="bg-dark-700 border border-dark-600 text-dark-200 text-sm px-3 py-1 rounded-full">
                    {g.name}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { icon: '⏱', label: 'Thời lượng', val: `${movie.duration} phút` },
                  { icon: '🎬', label: 'Đạo diễn', val: movie.director || '—' },
                  { icon: '📅', label: 'Khởi chiếu', val: movie.releaseDate ? formatDate(movie.releaseDate) : '—' },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="bg-dark-800/60 rounded-xl p-3">
                    <div className="text-lg mb-1">{icon}</div>
                    <div className="text-dark-400 text-xs">{label}</div>
                    <div className="text-white text-sm font-medium mt-0.5">{val}</div>
                  </div>
                ))}
              </div>

              {movie.castMembers && (
                <div className="mb-4">
                  <div className="text-dark-400 text-sm mb-1">Diễn viên</div>
                  <div className="text-white text-sm">{movie.castMembers}</div>
                </div>
              )}

              {movie.description && (
                <div>
                  <div className="text-dark-400 text-sm mb-1">Nội dung</div>
                  <p className="text-dark-200 text-sm leading-relaxed line-clamp-4">{movie.description}</p>
                </div>
              )}

              {/* Trailer */}
              {movie.trailerUrl && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="inline-flex items-center gap-2 mt-4 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-xl transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 0a10 10 0 100 20A10 10 0 0010 0zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                  Xem trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes */}
      {movie.status === 'NOW_SHOWING' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-bold text-white mb-6">Lịch Chiếu</h2>

          {/* Date pick */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
            {days.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  selectedDate === d
                    ? 'bg-primary-600 border-primary-500 text-white'
                    : 'bg-dark-900 border-dark-700 text-dark-300 hover:border-primary-500/50 hover:text-white'
                }`}
              >
                {formatDayLabel(d)}
              </button>
            ))}
          </div>

          {/* Cinema filter */}
          <select
            value={selectedCinema}
            onChange={e => setSelectedCinema(e.target.value)}
            className="input-field w-auto mb-6"
          >
            <option value="">Tất cả rạp</option>
            {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Showtime list */}
          {stLoading ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-dark-700 border-t-primary-500 rounded-full animate-spin" /></div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-10 text-dark-400">
              <p>Không có suất chiếu nào vào ngày này</p>
            </div>
          ) : (
            Object.entries(grouped).map(([cinemaName, sts]) => (
              <div key={cinemaName} className="card mb-4 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-white">{cinemaName}</div>
                    {sts[0]?.cinema?.address && <div className="text-dark-400 text-xs">{sts[0].cinema.address}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {sts.map(st => (
                    <button
                      key={st.id}
                      onClick={() => handleBookShowtime(st)}
                      className="border border-dark-600 hover:border-primary-500 bg-dark-800/50 hover:bg-primary-600/10 rounded-xl p-3 text-left transition-all group"
                    >
                      <div className="text-white font-semibold text-base group-hover:text-primary-400">{formatTime(st.startTime)}</div>
                      <div className="text-dark-400 text-xs mt-0.5">{st.room?.type} · {st.room?.name}</div>
                      <div className="text-dark-400 text-xs mt-1">từ {formatPrice(st.priceStandard)}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm flex items-center gap-1"
            >
              ✕ Đóng
            </button>
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getYoutubeEmbedUrl(movie.trailerUrl)}
                title={`Trailer - ${movie.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
