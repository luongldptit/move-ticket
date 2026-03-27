import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800/60 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Movie<span className="text-primary-500">Ticket</span></span>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed">
              Nền tảng đặt vé xem phim trực tuyến hàng đầu. Chọn phim, chọn ghế, thanh toán dễ dàng.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Phim</h3>
            <div className="flex flex-col gap-2">
              <Link to="/movies?status=NOW_SHOWING" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">Phim đang chiếu</Link>
              <Link to="/movies?status=COMING_SOON" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">Phim sắp chiếu</Link>
              <Link to="/movies" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">Tất cả phim</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <div className="flex flex-col gap-2">
              <Link to="/bookings" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">Lịch sử đặt vé</Link>
              <Link to="/profile" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">Tài khoản</Link>
              <span className="text-dark-400 text-sm">Hotline: 1900-xxxx</span>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-10 pt-6 text-center">
          <p className="text-dark-500 text-sm">© 2026 MovieTicket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
