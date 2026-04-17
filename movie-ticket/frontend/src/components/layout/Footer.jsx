import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const socialLinks = [
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
]

const navColumns = [
  {
    title: 'Phim',
    links: [
      { to: '/movies?status=NOW_SHOWING', label: 'Phim đang chiếu' },
      { to: '/movies?status=COMING_SOON', label: 'Phim sắp chiếu' },
      { to: '/movies', label: 'Tất cả phim' },
    ],
  },
  {
    title: 'Tài khoản',
    links: [
      { to: '/login', label: 'Đăng nhập' },
      { to: '/register', label: 'Đăng ký' },
      { to: '/profile', label: 'Hồ sơ cá nhân' },
      { to: '/bookings', label: 'Lịch sử đặt vé' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 to-[#020614]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <motion.div
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30"
                whileHover={{ rotate: 8, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                </svg>
              </motion.div>
              <span className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                Movie<span className="text-primary-500">Ticket</span>
              </span>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed mb-6">
              Nền tảng đặt vé xem phim trực tuyến. Chọn phim, chọn ghế, thanh toán dễ dàng — mọi lúc, mọi nơi.
            </p>
            <div className="flex gap-2">
              {socialLinks.map(({ label, href, icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 hover:bg-dark-700 text-dark-400 hover:text-primary-400 flex items-center justify-center transition-colors"
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {icon}
                </motion.a>
              ))}
            </div>
          </div>

          {navColumns.map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{title}</h3>
              <div className="flex flex-col gap-2.5">
                {links.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-dark-400 hover:text-primary-400 text-sm transition-colors w-fit relative group"
                  >
                    {label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary-500 group-hover:w-full transition-all duration-300" />
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Liên hệ</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-dark-500 text-xs mb-0.5">Hotline hỗ trợ</p>
                  <span className="text-dark-300 text-sm font-medium">1900 - 2099</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-dark-500 text-xs mb-0.5">Email hỗ trợ</p>
                  <span className="text-dark-300 text-sm">support@movieticket.vn</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-dark-500 text-xs mb-0.5">Giờ làm việc</p>
                  <span className="text-dark-300 text-sm">8:00 – 22:00 hằng ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-dark-800/60 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-dark-500 text-xs">© 2026 MovieTicket. All rights reserved.</p>
          <div className="flex gap-1 opacity-20">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-4 h-2.5 rounded-sm border border-dark-600 bg-dark-800" />
            ))}
          </div>
          <p className="text-dark-600 text-xs">Thiết kế với ♥ tại Việt Nam</p>
        </div>
      </div>
    </footer>
  )
}
