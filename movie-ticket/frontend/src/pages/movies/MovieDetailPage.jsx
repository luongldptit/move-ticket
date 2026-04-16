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

/* ─── Hero Cinematic Background (No Autoplay Video) ─── */
function HeroDetailBackground({ movie }) {
  return (
    <div className="absolute inset-0 z-0 bg-[#020617] pointer-events-none overflow-hidden">
      <motion.img 
        src={movie?.posterUrl} 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover opacity-30 transform scale-125" 
        style={{ filter: 'blur(40px)' }} 
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.3, scale: 1.25 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#020617]/30 to-transparent" />
      
      {/* Cinematic ambient spotlight */}
      <motion.div 
        className="absolute left-1/4 top-1/4 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] mix-blend-screen"
        animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

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
      className="min-h-screen pt-20 pb-20 relative"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      style={{ background: '#020617' }}
    >
      <HeroDetailBackground movie={movie} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* CỘT TRÁI - STICKY (Poster & Trailer Btn) */}
          <div className="lg:col-span-4 lg:col-start-1">
            <div className="lg:sticky lg:top-28 flex flex-col items-center lg:items-start" style={{ alignSelf: 'start' }}>
              <motion.div
                className="w-56 sm:w-72 lg:w-full relative group perspective-[1000px] mb-6"
                variants={fadeLeft} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.1 }}
              >
                <motion.img
                  src={movie.posterUrl || 'https://placehold.co/400x600/1e293b/94a3b8?text=No+Poster'}
                  alt={movie.title}
                  className="w-full rounded-2xl relative z-10 border border-white/10"
                  style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05)' }}
                  whileHover={{ scale: 1.04, rotateY: 4, rotateX: 4 }}
                  transition={spring}
                />
                <div className="absolute inset-0 bg-primary-600/40 blur-[60px] rounded-full scale-100 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </motion.div>

              {movie.trailerUrl && (
                <motion.button
                  onClick={() => setShowTrailer(true)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, y: 0, 
                    boxShadow: ['0 4px 16px rgba(225,29,72,0.3)', '0 4px 28px rgba(225,29,72,0.6)', '0 4px 16px rgba(225,29,72,0.3)'] 
                  }}
                  transition={{ 
                    opacity: { duration: 0.6, delay: 0.2 },
                    y: { duration: 0.6, delay: 0.2 },
                    boxShadow: { duration: 2.5, repeat: Infinity, ease: "linear" }
                  }}
                  whileHover={{ scale: 1.03, y: -2 }} 
                  whileTap={{ scale: 0.97 }}
                  className="w-full max-w-xs lg:max-w-none flex items-center justify-center gap-2 mt-2 bg-gradient-to-tr from-primary-600 to-rose-600 text-white border-none py-3.5 rounded-xl text-[15px] font-bold cursor-pointer transition-all"
                >
                  <span className="text-xl">▶</span> XEM TRAILER
                </motion.button>
              )}
            </div>
          </div>

          {/* CỘT PHẢI - CUỘN DỌC (Nội dung chính) */}
          <div className="lg:col-span-8 flex flex-col text-center lg:text-left pt-6 lg:pt-0">
            <motion.div variants={fadeRight} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.18 }}>
              <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap mb-4">
                <span className={`${rating.color} text-white font-black text-xs px-3 py-1.5 rounded-lg uppercase tracking-wider backdrop-blur-md shadow-lg border border-white/10`} title={rating.title}>
                  {rating.label}
                </span>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg border ${movie.status === 'NOW_SHOWING' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                  {status.label}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-dark-400 mb-6 tracking-tighter drop-shadow-2xl leading-tight" style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>
                {movie.title}
              </h1>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 mb-10">
                {(movie.genres || []).map(g => (
                  <span key={g.id} className="bg-white/5 backdrop-blur-md border border-white/10 text-dark-100 text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                    {g.name}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mb-10 justify-center lg:justify-start">
                {[
                  { icon: '⏱', label: 'Thời lượng', val: `${movie.duration} phút` },
                  { icon: '🎬', label: 'Đạo diễn', val: movie.director || '—' },
                  { icon: '📅', label: 'Khởi chiếu', val: movie.releaseDate ? formatDate(movie.releaseDate) : '—' },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="flex items-center gap-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-5 py-3 shadow-xl">
                    <div className="text-2xl opacity-90 drop-shadow-md">{icon}</div>
                    <div className="text-left">
                      <div className="text-dark-400 text-[10px] font-black uppercase tracking-widest mb-0.5">{label}</div>
                      <div className="text-white text-sm font-bold">{val}</div>
                    </div>
                  </div>
                ))}
              </div>

              {movie.castMembers && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
                    <div className="text-dark-400 text-sm font-black uppercase tracking-widest">Diễn viên</div>
                  </div>
                  <div className="text-white/90 text-[15px] font-medium leading-relaxed pl-4 border-l border-white/5">{movie.castMembers}</div>
                </div>
              )}

              {movie.description && (
                <div className="mb-10 lg:mb-16">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
                    <div className="text-dark-400 text-sm font-black uppercase tracking-widest">Nội dung</div>
                  </div>
                  <p className="text-dark-200 text-base leading-loose pl-4 border-l border-white/5">{movie.description}</p>
                </div>
              )}
            </motion.div>

            {/* Showtimes Section */}
            {movie.status === 'NOW_SHOWING' && (
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-16">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">Đặt Vé Nhanh</h2>
                  <div className="flex-1 h-px bg-dark-800/80"></div>
                </div>

          {/* Date picker */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 mb-6 pt-2">
            {days.map(d => {
              const hasShows = daysWithShowtimes.has(d)
              const isSelected = selectedDate === d
              return (
                <motion.button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 flex flex-col items-center px-5 py-3 rounded-2xl text-sm font-semibold transition-all border shadow-lg ${
                    isSelected
                      ? 'bg-gradient-to-br from-primary-600 to-rose-600 border-primary-400 text-white shadow-primary-500/30'
                      : hasShows
                        ? 'bg-dark-800/80 border-dark-600 text-dark-200 hover:border-primary-500/50 hover:text-white'
                        : 'bg-dark-900/50 border-dark-800 text-dark-600 hover:border-dark-700 hover:text-dark-400'
                  }`}
                  style={{ backdropFilter: 'blur(8px)' }}
                >
                  <span className="mb-1">{formatDayLabel(d)}</span>
                  {/* Dot indicator */}
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    isSelected
                      ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                      : hasShows
                        ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'
                        : 'bg-transparent'
                  }`} />
                </motion.button>
              )
            })}
          </div>

          {/* Cinema filter */}
          <div className="mb-8">
            <select
              value={selectedCinema}
              onChange={e => setSelectedCinema(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-sm font-semibold rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none backdrop-blur-md transition-all w-full sm:w-auto cursor-pointer appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto', paddingRight: '2.5rem' }}
            >
              <option value="" className="bg-dark-900">Tất cả cụm rạp</option>
              {cinemas.map(c => <option key={c.id} value={c.id} className="bg-dark-900">{c.name}</option>)}
            </select>
          </div>

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
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: 16, padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
                      }}
                    >
                      <div className="text-white font-black text-lg tracking-wide">{formatTime(st.startTime)}</div>
                      <div className="text-dark-400 text-[10px] uppercase font-bold tracking-widest mt-1.5">{st.room?.type} · {st.room?.name}</div>
                      <div className="text-primary-400 text-[11px] mt-1 font-black">TỪ {formatPrice(st.priceStandard)}</div>
                    </motion.button>
                  ))}
                </motion.div>
                  </div>
                ))
              )}
            </motion.div>
            )}

            {/* Reviews Section */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-wide">Đánh Giá</h2>
                <div className="flex-1 h-px bg-dark-800/80"></div>
              </div>
              <ReviewList movieId={parseInt(id)} />
            </motion.div>

          </div> {/* END Right Column */}
        </div> {/* END Grid */}
      </div> {/* END Container */}

      {/* Trailer Modal (Elegant Floating Card) */}
      <AnimatePresence>
        {showTrailer && (
          <motion.div
            className="fixed inset-0 z-[100] bg-dark-950/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowTrailer(false)}
          >
            {/* Elegant Background Glow */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vh] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            />

            <motion.div
              className="relative w-full max-w-5xl bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)' }}
            >
              {/* Top overlay shadow to ensure close button is visible */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

              {/* Close Button Inside Modal */}
              <motion.button
                onClick={() => setShowTrailer(false)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/10 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 90 }} 
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Video Container (16:9 Aspect Ratio) */}
              <div className="relative w-full aspect-video bg-dark-900">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`${getYoutubeEmbedUrl(movie.trailerUrl)}&autoplay=1`}
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
