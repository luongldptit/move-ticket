import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/admin', icon: '📊', label: 'Dashboard', end: true },
  { to: '/admin/movies', icon: '🎬', label: 'Phim' },
  { to: '/admin/cinemas', icon: '🏟', label: 'Rạp & Phòng' },
  { to: '/admin/showtimes', icon: '🗓', label: 'Suất chiếu' },
  { to: '/admin/users', icon: '👥', label: 'Người dùng' },
  { to: '/admin/promotions', icon: '🎁', label: 'Khuyến mãi' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen pt-16 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-dark-900 border-r border-dark-700/60 fixed top-16 bottom-0 left-0 flex flex-col">
        <div className="p-4 border-b border-dark-700/60">
          <div className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Admin Panel</div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-dark-700/60">
          <button onClick={() => navigate('/')} className="btn-ghost w-full text-sm text-left flex items-center gap-2">
            ← Về trang chủ
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
