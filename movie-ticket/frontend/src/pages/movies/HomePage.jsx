import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { movieApi } from '../../api/movieApi'
import { PageLoader } from '../../components/common/Spinner'
import { MOVIE_STATUS, AGE_RATING, formatDate } from '../../utils/helpers'

function MovieCard({ movie }) {
  const status = MOVIE_STATUS[movie.status] || {}
  const rating = AGE_RATING[movie.ageRating] || { label: movie.ageRating, color: 'bg-dark-600' }

  return (
    <Link to={`/movies/${movie.id}`} className="card-hover group block">
      <div className="relative overflow-hidden aspect-[2/3]">
        <img
          src={movie.posterUrl || 'https://placehold.co/300x450/1e293b/94a3b8?text=No+Poster'}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Age rating badge */}
        <div className={`absolute top-2 left-2 ${rating.color} text-white text-xs font-bold px-2 py-0.5 rounded`}>
          {rating.label}
        </div>
        {/* Status badge */}
        <div className={`absolute top-2 right-2 ${status.color} text-xs font-semibold px-2 py-1 rounded-full`}>
          {status.label}
        </div>
        {/* Hover book button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="btn-primary w-full text-center text-sm py-2">Đặt vé</div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-white text-sm line-clamp-2 leading-tight group-hover:text-primary-400 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-dark-400 text-xs">{movie.duration} phút</span>
          {movie.releaseDate && (
            <span className="text-dark-500 text-xs">{formatDate(movie.releaseDate)}</span>
          )}
        </div>
        {movie.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {movie.genres.slice(0, 2).map((g, i) => (
              <span key={i} className="text-xs bg-dark-800 text-dark-300 px-2 py-0.5 rounded">
                {typeof g === 'string' ? g : g.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium px-4 py-2 rounded-full mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            Hệ thống đặt vé trực tuyến số 1 Việt Nam
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight animate-slide-up">
            Xem phim,{' '}
            <span className="text-gradient">đặt vé</span>
            <br />dễ như ăn bánh
          </h1>

          <p className="text-dark-300 text-lg md:text-xl max-w-xl mx-auto mb-10 animate-slide-up">
            Chọn phim yêu thích, chọn ghế ngồi, thanh toán nhanh chóng. Nhận QR code xác nhận ngay lập tức.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link to="/movies?status=NOW_SHOWING" className="btn-primary py-3 px-8 text-base">
              🎬 Đặt vé ngay
            </Link>
            <Link to="/movies?status=COMING_SOON" className="btn-secondary py-3 px-8 text-base">
              🗓 Sắp ra mắt
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto mt-16">
            {[
              { num: '50+', label: 'Phim mỗi tháng' },
              { num: '20+', label: 'Rạp chiếu' },
              { num: '100K+', label: 'Khách hàng' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-primary-400">{s.num}</div>
                <div className="text-dark-400 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Now Showing */}
        {nowShowing.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Đang Chiếu</h2>
                <p className="text-dark-400 text-sm mt-1">Những bộ phim đang được chiếu tại rạp</p>
              </div>
              <Link to="/movies?status=NOW_SHOWING" className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1">
                Xem tất cả
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {nowShowing.slice(0, 6).map((m) => <MovieCard key={m.id} movie={m} />)}
            </div>
          </section>
        )}

        {/* Coming Soon */}
        {comingSoon.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Sắp Chiếu</h2>
                <p className="text-dark-400 text-sm mt-1">Những bộ phim sắp ra mắt</p>
              </div>
              <Link to="/movies?status=COMING_SOON" className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1">
                Xem tất cả
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {comingSoon.slice(0, 6).map((m) => <MovieCard key={m.id} movie={m} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
