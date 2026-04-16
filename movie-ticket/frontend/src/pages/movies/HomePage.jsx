import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { movieApi } from '../../api/movieApi'
import { PageLoader } from '../../components/common/Spinner'
import { MOVIE_STATUS, AGE_RATING, formatDate } from '../../utils/helpers'

function MovieCard({ movie, index = 0 }) {
  const status = MOVIE_STATUS[movie.status] || {}
  const rating = AGE_RATING[movie.ageRating] || { label: movie.ageRating, color: 'bg-dark-600' }

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="card-hover group block"
      style={{
        animation: `cardEntrance 0.5s ease-out both`,
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="relative overflow-hidden aspect-[2/3]">
        <img
          src={movie.posterUrl || 'https://placehold.co/300x450/1e293b/94a3b8?text=No+Poster'}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        {/* Shimmer sweep on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
          <div className="shimmer-sweep absolute inset-0" />
        </div>
        {/* Age rating badge */}
        <div className={`absolute top-2 left-2 ${rating.color} text-white text-xs font-bold px-2 py-0.5 rounded shadow-lg`}>
          {rating.label}
        </div>
        {/* Status badge */}
        <div className={`absolute top-2 right-2 ${status.color} text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm`}>
          {status.label}
        </div>
        {/* Hover CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-350 ease-out">
          <div className="btn-primary w-full text-center text-sm py-2 shadow-lg shadow-primary-500/40">
            🎬 Đặt vé
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-white text-sm line-clamp-2 leading-tight group-hover:text-primary-400 transition-colors duration-200">
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
              <span key={i} className="text-xs bg-dark-800 text-dark-300 px-2 py-0.5 rounded group-hover:bg-primary-900/40 group-hover:text-primary-300 transition-colors duration-200">
                {typeof g === 'string' ? g : g.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

function AnimatedCounter({ target, duration = 1800 }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started) return
    const num = parseFloat(target.replace(/[^0-9.]/g, ''))
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(num * eased)
      setCount(current)
      if (progress < 1) requestAnimationFrame(tick)
      else setCount(num)
    }
    requestAnimationFrame(tick)
  }, [started, target, duration])

  useEffect(() => {
    const id = `counter-${target.replace(/\W/g, '')}`
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.5 }
    )
    const el = document.getElementById(id)
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  const isK = target.includes('K')
  const hasPlus = target.includes('+')
  return (
    <span id={`counter-${target.replace(/\W/g, '')}`}>
      {count}{isK ? 'K' : ''}{hasPlus ? '+' : ''}
    </span>
  )
}

function ScrollReveal({ children, delay = 0, direction = 'up' }) {
  const [visible, setVisible] = useState(false)
  const [ref, setRef] = useState(null)

  useEffect(() => {
    if (!ref) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref])

  const transforms = {
    up: 'translateY(40px)',
    down: 'translateY(-40px)',
    left: 'translateX(-40px)',
    right: 'translateX(40px)',
  }

  return (
    <div
      ref={setRef}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0)' : transforms[direction],
        transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}

export default function HomePage() {
  const [nowShowing, setNowShowing] = useState([])
  const [comingSoon, setComingSoon] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroLoaded, setHeroLoaded] = useState(false)

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

    const t = setTimeout(() => setHeroLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="min-h-screen">
      <style>{`
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          33%  { transform: translateY(-30px) translateX(20px) scale(1.05); }
          66%  { transform: translateY(15px) translateX(-15px) scale(0.97); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          40%  { transform: translateY(25px) translateX(-25px) scale(1.08); }
          70%  { transform: translateY(-20px) translateX(10px) scale(0.95); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%  { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes scanLine {
          0%   { top: -10%; opacity: 0.6; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(244,63,94,0.35), 0 0 60px rgba(244,63,94,0.12); }
          50%       { box-shadow: 0 0 40px rgba(244,63,94,0.55), 0 0 80px rgba(244,63,94,0.22); }
        }
        @keyframes shimmerSweep {
          0%   { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(250%) skewX(-15deg); }
        }
        .shimmer-sweep::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.13), transparent);
          animation: shimmerSweep 0.85s ease-in-out;
        }
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex; width: max-content;
          animation: tickerScroll 22s linear infinite;
        }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>

      <section className="relative overflow-hidden min-h-[88vh] flex items-center" style={{ paddingTop: 80 }}>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 120% 100% at 50% 0%, #1e1b4b 0%, #0f172a 55%, #020617 100%)'
        }} />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position:'absolute', top:'12%', left:'5%',
            width:520, height:520,
            background:'radial-gradient(circle, rgba(244,63,94,0.2) 0%, transparent 70%)',
            borderRadius:'50%', filter:'blur(45px)',
            animation:'floatA 13s ease-in-out infinite',
          }} />
          <div style={{
            position:'absolute', top:'35%', right:'4%',
            width:400, height:400,
            background:'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
            borderRadius:'50%', filter:'blur(55px)',
            animation:'floatB 16s ease-in-out infinite',
          }} />
          <div style={{
            position:'absolute', bottom:'8%', left:'28%',
            width:320, height:320,
            background:'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)',
            borderRadius:'50%', filter:'blur(65px)',
            animation:'floatA 20s ease-in-out infinite reverse',
          }} />
          {[...Array(9)].map((_, i) => (
            <div key={i} style={{
              position:'absolute',
              left:`${8 + i * 11}%`,
              top:`${18 + (i % 3) * 22}%`,
              width: 3 + (i % 4),
              height: 3 + (i % 4),
              borderRadius:'50%',
              background: i % 2 === 0 ? 'rgba(244,63,94,0.7)' : 'rgba(139,92,246,0.7)',
              animation:`floatC ${4 + i * 0.8}s ease-in-out infinite`,
              animationDelay:`${i * 0.45}s`,
            }} />
          ))}
          <div style={{
            position:'absolute', left:0, right:0, height:1,
            background:'linear-gradient(90deg, transparent, rgba(244,63,94,0.45), transparent)',
            animation:'scanLine 7s ease-in-out infinite',
            animationDelay:'3s',
          }} />
          <div style={{
            position:'absolute', inset:0,
            backgroundImage:'linear-gradient(rgba(244,63,94,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,0.025) 1px, transparent 1px)',
            backgroundSize:'80px 80px',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 w-full">
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.28)',
            color:'#fb7185', fontSize:13, fontWeight:600,
            padding:'8px 22px', borderRadius:999, marginBottom:32,
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'none' : 'translateY(-20px) scale(0.9)',
            transition:'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}>
            <span style={{width:8,height:8,borderRadius:'50%',background:'#fb7185',display:'inline-block',animation:'pulse 1.5s ease-in-out infinite'}} />
            🎬 Hệ thống đặt vé trực tuyến số 1 Việt Nam
          </div>

          <h1 style={{
            fontSize:'clamp(2.6rem, 7vw, 5.5rem)',
            fontWeight:900, color:'#ffffff',
            lineHeight:1.1, marginBottom:24,
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'none' : 'translateY(50px) skewY(2deg)',
            transition:'opacity 0.8s ease-out 0.15s, transform 0.8s ease-out 0.15s',
          }}>
            Xem phim,{' '}
            <span style={{
              background:'linear-gradient(135deg, #fb7185 0%, #e11d48 40%, #a855f7 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>đặt vé</span>
            <br />dễ như ăn bánh
          </h1>

          <p style={{
            color:'#94a3b8', fontSize:'clamp(1rem, 2vw, 1.2rem)',
            maxWidth:520, margin:'0 auto 40px', lineHeight:1.7,
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'none' : 'translateY(30px)',
            transition:'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
          }}>
            Chọn phim yêu thích, chọn ghế ngồi, thanh toán nhanh chóng.<br/>
            Nhận QR code xác nhận ngay lập tức.
          </p>

          <div style={{
            display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap',
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'none' : 'translateY(30px)',
            transition:'opacity 0.8s ease-out 0.45s, transform 0.8s ease-out 0.45s',
          }}>
            <Link
              to="/movies?status=NOW_SHOWING"
              style={{
                display:'inline-flex', alignItems:'center', gap:8,
                background:'linear-gradient(135deg, #e11d48, #be123c)',
                color:'#fff', fontWeight:700, fontSize:15,
                padding:'14px 32px', borderRadius:16, textDecoration:'none',
                animation:'borderGlow 3s ease-in-out infinite',
                transition:'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(225,29,72,0.55)' }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
            >
              🎬 Đặt vé ngay
            </Link>
            <Link
              to="/movies?status=COMING_SOON"
              style={{
                display:'inline-flex', alignItems:'center', gap:8,
                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)',
                backdropFilter:'blur(10px)', color:'#fff', fontWeight:700, fontSize:15,
                padding:'14px 32px', borderRadius:16, textDecoration:'none',
                transition:'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.transform='translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.transform='' }}
            >
              🗓 Sắp ra mắt
            </Link>
          </div>

          <div style={{
            display:'grid', gridTemplateColumns:'repeat(3,1fr)',
            gap:24, maxWidth:380, margin:'64px auto 0',
          }}>
            {[
              { num:'50+', label:'Phim / tháng', icon:'🎥', delay:600 },
              { num:'20+', label:'Rạp chiếu', icon:'🏟️', delay:700 },
              { num:'100K+', label:'Khách hàng', icon:'👥', delay:800 },
            ].map((s) => (
              <div key={s.label} style={{
                textAlign:'center',
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? 'none' : 'scale(0.8) translateY(20px)',
                transition:`opacity 0.6s ease-out ${s.delay}ms, transform 0.6s ease-out ${s.delay}ms`,
              }}>
                <div style={{ fontSize:24, marginBottom:4 }}>{s.icon}</div>
                <div style={{ fontSize:22, fontWeight:800, color:'#fb7185' }}>
                  <AnimatedCounter target={s.num} />
                </div>
                <div style={{ color:'#64748b', fontSize:11, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:120,
          background:'linear-gradient(to bottom, transparent, #020617)',
          pointerEvents:'none',
        }} />
      </section>

      <div style={{
        overflow:'hidden',
        borderTop:'1px solid rgba(244,63,94,0.1)',
        borderBottom:'1px solid rgba(244,63,94,0.1)',
        background:'rgba(244,63,94,0.03)',
        padding:'10px 0',
      }}>
        <div className="ticker-track">
          {[...Array(2)].map((_, rep) =>
            ['🔥 Phim hot tuần này','⭐ Ưu đãi thành viên','🎟️ Giảm 20% thứ 4','🍿 Combo bắp nước','🎬 Phim mới mỗi tuần','🏆 Top #1 Việt Nam']
              .map((item, i) => (
                <span key={`${rep}-${i}`} style={{
                  whiteSpace:'nowrap', padding:'0 48px',
                  fontSize:12, fontWeight:600, letterSpacing:'0.05em',
                  color: i % 2 === 0 ? '#fb7185' : '#94a3b8',
                }}>
                  {item}
                </span>
              ))
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-16">

        {nowShowing.length > 0 && (
          <section className="mb-20">
            <ScrollReveal delay={0}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div style={{
                    width:4, height:36, borderRadius:4,
                    background:'linear-gradient(to bottom, #fb7185, #e11d48)',
                    boxShadow:'0 0 16px rgba(244,63,94,0.5)',
                  }} />
                  <div>
                    <h2 style={{ fontSize:26, fontWeight:800, color:'#fff', margin:0, lineHeight:1.2 }}>Đang Chiếu</h2>
                    <p style={{ color:'#64748b', fontSize:13, margin:'4px 0 0' }}>Những bộ phim đang được chiếu tại rạp</p>
                  </div>
                </div>
                <Link to="/movies?status=NOW_SHOWING" style={{
                  display:'flex', alignItems:'center', gap:6,
                  color:'#fb7185', fontSize:13, fontWeight:600, textDecoration:'none',
                  padding:'8px 16px', borderRadius:10,
                  border:'1px solid rgba(244,63,94,0.2)',
                  background:'rgba(244,63,94,0.05)',
                  transition:'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(244,63,94,0.12)'; e.currentTarget.style.transform='translateX(4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(244,63,94,0.05)'; e.currentTarget.style.transform='' }}
                >Xem tất cả →</Link>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {nowShowing.slice(0, 6).map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
            </div>
          </section>
        )}

        <ScrollReveal delay={100}>
          <div style={{
            borderRadius:24,
            background:'linear-gradient(135deg, rgba(225,29,72,0.12) 0%, rgba(139,92,246,0.12) 100%)',
            border:'1px solid rgba(244,63,94,0.2)',
            padding:'40px 48px', marginBottom:80,
            display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:32,
            position:'relative', overflow:'hidden',
          }}>
            <div style={{
              position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(244,63,94,0.18), transparent)',
              filter:'blur(30px)', animation:'floatA 10s ease-in-out infinite',
            }} />
            {[
              { icon:'⚡', title:'Đặt vé siêu nhanh', desc:'Chọn ghế & thanh toán chỉ trong 60 giây' },
              { icon:'🎟️', title:'QR code tức thì', desc:'Nhận vé điện tử ngay sau khi thanh toán' },
              { icon:'🔐', title:'Bảo mật tuyệt đối', desc:'Thông tin được mã hóa SSL an toàn' },
              { icon:'🎁', title:'Ưu đãi hấp dẫn', desc:'Nhiều mã giảm giá và combo hot mỗi tuần' },
            ].map((f, i) => (
              <div key={i} style={{ animation:`cardEntrance 0.5s ease-out both`, animationDelay:`${i * 100}ms` }}>
                <div style={{ fontSize:32, marginBottom:10 }}>{f.icon}</div>
                <div style={{ fontWeight:700, color:'#fff', fontSize:15, marginBottom:4 }}>{f.title}</div>
                <div style={{ color:'#64748b', fontSize:13, lineHeight:1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {comingSoon.length > 0 && (
          <section>
            <ScrollReveal delay={0}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div style={{
                    width:4, height:36, borderRadius:4,
                    background:'linear-gradient(to bottom, #a855f7, #7c3aed)',
                    boxShadow:'0 0 16px rgba(168,85,247,0.5)',
                  }} />
                  <div>
                    <h2 style={{ fontSize:26, fontWeight:800, color:'#fff', margin:0, lineHeight:1.2 }}>Sắp Chiếu</h2>
                    <p style={{ color:'#64748b', fontSize:13, margin:'4px 0 0' }}>Những bộ phim sắp ra mắt</p>
                  </div>
                </div>
                <Link to="/movies?status=COMING_SOON" style={{
                  display:'flex', alignItems:'center', gap:6,
                  color:'#a855f7', fontSize:13, fontWeight:600, textDecoration:'none',
                  padding:'8px 16px', borderRadius:10,
                  border:'1px solid rgba(168,85,247,0.2)',
                  background:'rgba(168,85,247,0.05)',
                  transition:'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(168,85,247,0.12)'; e.currentTarget.style.transform='translateX(4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(168,85,247,0.05)'; e.currentTarget.style.transform='' }}
                >Xem tất cả →</Link>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {comingSoon.slice(0, 6).map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
