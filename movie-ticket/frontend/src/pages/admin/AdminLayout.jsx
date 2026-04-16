import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/admin', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', label: 'Dashboard', end: true },
  { to: '/admin/movies', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', label: 'Phim' },
  { to: '/admin/cinemas', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: 'Cụm Rạp' },
  { to: '/admin/showtimes', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Suất Chiếu' },
  { to: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'Khách Hàng' },
  { to: '/admin/promotions', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Khuyến Mãi' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-[#020617] flex pt-20 px-4 sm:px-6 lg:px-8 pb-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex w-full max-w-[1600px] mx-auto gap-8 relative z-10">
        
        {/* Floating Sidebar */}
        <aside className="w-64 max-w-sm flex-shrink-0 flex flex-col h-[calc(100vh-8rem)] sticky top-24 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">Workstation</div>
            <div className="text-xl font-black text-white tracking-widest">ADMIN PANEL</div>
          </div>
          
          {/* Nav */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600/20 to-transparent text-primary-400 border-l-2 border-primary-500 shadow-[inset_0_0_20px_rgba(225,29,72,0.05)]'
                      : 'text-dark-300 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                  }`
                }
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer actions */}
          <div className="p-4 border-t border-white/10 bg-dark-900/30">
            <button 
              onClick={() => navigate('/')} 
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-dark-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              VỀ TRANG CHỦ
            </button>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 min-w-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
