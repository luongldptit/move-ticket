import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { logout } from '../../store/slices/authSlice'
import { authApi } from '../../api/authApi'
import { toast } from 'react-toastify'
import { dropdownVariants, mobileMenuVariants } from '../../utils/motion'

export default function Navbar() {
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef(null)
  const navControls = useAnimation()

  useEffect(() => {
    // Entrance animation
    navControls.start({
      opacity: 1, y: 0,
      transition: { type: 'spring', stiffness: 280, damping: 28, delay: 0.05 },
    })
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
    setSearchOpen(false)
  }

  const handleLogout = async () => {
    try { await authApi.logout() } catch (_) {}
    dispatch(logout())
    navigate('/')
    toast.success('Đã đăng xuất')
    setMenuOpen(false)
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-dark-800/60"
      initial={{ opacity: 0, y: -24 }}
      animate={navControls}
      style={{
        backgroundColor: scrolled ? 'rgba(2,6,23,0.98)' : 'rgba(2,6,23,0.95)',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : '0 0 0 rgba(0,0,0,0)',
        backdropFilter: 'blur(16px)',
        transition: 'background-color 0.3s, box-shadow 0.3s',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-center justify-between"
          animate={{ height: scrolled ? 56 : 64 }}
          transition={{ duration: 0.3 }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30"
              whileHover={{ rotate: 8, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
              </svg>
            </motion.div>
            <span className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
              Movie<span className="text-primary-500">Ticket</span>
            </span>
          </Link>

          {/* Desktop nav links + search */}
          <div className="hidden md:flex items-center gap-1">
            <AnimatePresence mode="wait" initial={false}>
              {searchOpen ? (
                <motion.form
                  key="search-form"
                  onSubmit={handleSearch}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                  <div className="relative flex items-center">
                    <svg className="absolute left-3 w-4 h-4 text-dark-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Tìm phim..."
                      className="pl-9 pr-3 py-1.5 w-48 bg-dark-800/80 border border-dark-600 focus:border-primary-500/60 rounded-xl text-sm text-white placeholder-dark-500 outline-none transition-colors"
                      style={{ backdropFilter: 'blur(8px)' }}
                      onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                    />
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                    className="btn-ghost p-1.5 text-dark-400 hover:text-white"
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div key="nav-links" className="flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {[
                    { to: '/movies?status=NOW_SHOWING', label: 'Đang chiếu' },
                    { to: '/movies?status=COMING_SOON', label: 'Sắp chiếu' },
                    { to: '/movies', label: 'Tất cả phim' },
                  ].map((link) => (
                    <motion.div key={link.to} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                      <Link to={link.to} className="btn-ghost text-sm">{link.label}</Link>
                    </motion.div>
                  ))}
                  <motion.button
                    onClick={() => setSearchOpen(true)}
                    className="btn-ghost p-2 text-dark-400 hover:text-white ml-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    title="Tìm kiếm phim"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 transition-colors"
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold text-white">
                    {user?.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-dark-200 max-w-24 truncate hidden sm:block">{user?.fullName}</span>
                  <motion.svg
                    className="w-4 h-4 text-dark-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    animate={{ rotate: menuOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      className="absolute right-0 top-12 w-52 bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                    >
                      <div className="p-3 border-b border-dark-700">
                        <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
                        <p className="text-xs text-dark-400 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-800 hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          Hồ sơ cá nhân
                        </Link>
                        <Link to="/bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-800 hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                          Lịch sử đặt vé
                        </Link>
                        {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
                          <Link to="/staff/verify" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-800 hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Xác nhận vé
                          </Link>
                        )}
                        {user?.role === 'ADMIN' && (
                          <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary-400 hover:bg-dark-800 hover:text-primary-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Quản trị Admin
                          </Link>
                        )}
                        <div className="border-t border-dark-700 mt-1 pt-1">
                          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Đăng nhập</Link>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4 btn-ripple">Đăng ký</Link>
                </motion.div>
              </div>
            )}

            {/* Mobile menu toggle */}
            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden btn-ghost p-2"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.svg key="close" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </motion.svg>
                ) : (
                  <motion.svg key="open" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden bg-dark-900 border-t border-dark-800 px-4 py-3 flex flex-col gap-1"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <form onSubmit={e => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(''); setMobileOpen(false) } }} className="relative mb-2">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm phim..."
                className="w-full pl-9 pr-3 py-2 bg-dark-800 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-500 outline-none focus:border-primary-500/60 transition-colors"
              />
            </form>
            <Link to="/movies?status=NOW_SHOWING" onClick={() => setMobileOpen(false)} className="btn-ghost text-sm text-left">Đang chiếu</Link>
            <Link to="/movies?status=COMING_SOON" onClick={() => setMobileOpen(false)} className="btn-ghost text-sm text-left">Sắp chiếu</Link>
            <Link to="/movies" onClick={() => setMobileOpen(false)} className="btn-ghost text-sm text-left">Tất cả phim</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for dropdown */}
      {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />}
    </motion.nav>
  )
}
