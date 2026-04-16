import { useState, useEffect, useCallback } from 'react'
import ReviewList from '../../components/reviews/ReviewList'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { movieApi } from '../../api/movieApi'
import { cinemaApi } from '../../api/cinemaApi'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentShowtime } from '../../store/slices/bookingSlice'
import { PageLoader } from '../../components/common/Spinner'
import { AGE_RATING, MOVIE_STATUS, formatDate, formatTime, formatPrice, getNextNDays, formatDayLabel } from '../../utils/helpers'
import { fadeUp, fadeLeft, fadeRight, scaleIn, staggerContainer, staggerItem, spring, easeOut } from '../../utils/motion'
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
  const [daysWithShowtimes, setDaysWithShowtimes] = useState(new Set())

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

  // Fetch availability for all 7 days in parallel to show indicators
  useEffect(() => {
    const now = new Date()
    Promise.allSettled(
      days.map(d => movieApi.getMovieShowtimes(id, { date: d }))
    ).then(results => {
      const hasShowtime = new Set()
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          const data = result.value.data.data || []
          // Only count upcoming showtimes
          const upcoming = data.filter(st => new Date(st.startTime) > now)
          if (upcoming.length > 0) hasShowtime.add(days[i])
        }
      })
      setDaysWithShowtimes(hasShowtime)
    })
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

  const now = new Date()

  // Group showtimes by cinema, chỉ lấy suất chưa bắt đầu
  const grouped = showtimes.reduce((acc, st) => {
    if (new Date(st.startTime) <= now) return acc
    const key = st.cinema?.name || 'Rạp'
    if (!acc[key]) acc[key] = []
    acc[key].push(st)
    return acc
  }, {})

  return (
    <motion.div
      className="min-h-screen pt-20"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
    >
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
            <motion.div
              className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0"
              variants={fadeLeft} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.1 }}
            >
              <motion.img
                src={movie.posterUrl || 'https://placehold.co/256x384/1e293b/94a3b8?text=No+Poster'}
                alt={movie.title}
                className="w-full rounded-2xl"
                style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)' }}
                whileHover={{ scale: 1.03 }}
                transition={spring}
              />
            </motion.div>

            {/* Info */}
            <motion.div
              className="flex-1"
              variants={fadeRight} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.18 }}
            >
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
                <motion.button
                  onClick={() => setShowTrailer(true)}
                  whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }}
                  animate={{ boxShadow: ['0 4px 16px rgba(225,29,72,0.3)', '0 4px 28px rgba(225,29,72,0.6)', '0 4px 16px rgba(225,29,72,0.3)'] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16,
                    background: 'linear-gradient(135deg, #e11d48, #be123c)',
                    color: '#fff', border: 'none', padding: '11px 22px',
                    borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  ▶ Xem trailer
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Showtimes */}
      {movie.status === 'NOW_SHOWING' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-bold text-white mb-6">Lịch Chiếu</h2>

          {/* Date picker */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
            {days.map(d => {
              const hasShows = daysWithShowtimes.has(d)
              const isSelected = selectedDate === d
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                    isSelected
                      ? 'bg-primary-600 border-primary-500 text-white'
                      : hasShows
                        ? 'bg-dark-900 border-dark-600 text-dark-200 hover:border-primary-500/50 hover:text-white'
                        : 'bg-dark-900 border-dark-800 text-dark-500 hover:border-dark-600 hover:text-dark-300'
                  }`}
                >
                  <span>{formatDayLabel(d)}</span>
                  {/* Dot indicator */}
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full transition-colors ${
                    isSelected
                      ? 'bg-white/70'
                      : hasShows
                        ? 'bg-green-400'
                        : 'bg-transparent'
                  }`} />
                </button>
              )
            })}
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

                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                  variants={staggerContainer(0.05)} initial="hidden" animate="show"
                >
                  {sts.map(st => (
                    <motion.button
                      key={st.id}
                      variants={staggerItem}
                      whileHover={{ y: -4, borderColor: '#fb7185', background: 'rgba(244,63,94,0.08)', boxShadow: '0 8px 24px rgba(244,63,94,0.25)' }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleBookShowtime(st)}
                      style={{
                        border: '1.5px solid rgba(51,65,85,0.7)',
                        background: 'rgba(15,23,42,0.8)',
                        borderRadius: 14, padding: 12, textAlign: 'left', cursor: 'pointer',
                      }}
                    >
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{formatTime(st.startTime)}</div>
                      <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{st.room?.type} · {st.room?.name}</div>
                      <div style={{ color: '#fb7185', fontSize: 11, marginTop: 4, fontWeight: 600 }}>từ {formatPrice(st.priceStandard)}</div>
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reviews */}
      <ReviewList movieId={parseInt(id)} />

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              className="relative w-full max-w-3xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={spring}
              onClick={e => e.stopPropagation()}
            >
              <motion.button
                onClick={() => setShowTrailer(false)}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm flex items-center gap-1"
              >
                ✕ Đóng
              </motion.button>
              <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={getYoutubeEmbedUrl(movie.trailerUrl)}
                  title={`Trailer - ${movie.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
