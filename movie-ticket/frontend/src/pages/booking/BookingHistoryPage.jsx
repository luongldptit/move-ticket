import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { bookingApi } from '../../api/bookingApi'
import Pagination from '../../components/common/Pagination'
import { PageLoader } from '../../components/common/Spinner'
import { BOOKING_STATUS, formatDateTime, formatPrice } from '../../utils/helpers'
import { staggerContainer, staggerItem, fadeUp, easeOut } from '../../utils/motion'

const STATUS_ACCENT = {
  CONFIRMED: 'bg-emerald-500',
  PENDING: 'bg-amber-500',
  CANCELLED: 'bg-red-500',
  EXPIRED: 'bg-dark-500',
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    bookingApi.getMyBookings({ status: statusFilter || undefined, page, size: 10 })
      .then(r => {
        const d = r.data.data
        setBookings(d.content || [])
        setTotalPages(d.totalPages || 0)
      }).catch(console.error).finally(() => setLoading(false))
  }, [statusFilter, page])

  const tabs = [
    { value: '', label: 'Tất cả' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'PENDING', label: 'Chờ thanh toán' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={easeOut}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary-500/15 border border-primary-500/25 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Lịch sử đặt vé</h1>
          </div>
          <p className="text-dark-400 text-sm ml-11">Xem lại tất cả các vé bạn đã đặt</p>
        </motion.div>

        {/* Status tabs */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.08 }}
          className="relative flex gap-1 bg-dark-900 rounded-xl p-1 border border-dark-700/60 mb-6 overflow-x-auto scrollbar-hide"
        >
          {tabs.map(t => (
            <button
              key={t.value}
              onClick={() => { setStatusFilter(t.value); setPage(0) }}
              className="relative flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors z-10"
              style={{ color: statusFilter === t.value ? '#fff' : '#94a3b8' }}
            >
              {statusFilter === t.value && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 bg-primary-600 rounded-lg"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {t.label}
            </button>
          ))}
        </motion.div>

        {loading ? <PageLoader /> : bookings.length === 0 ? (
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" transition={easeOut}
            className="text-center py-24"
          >
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-dark-800/60 border border-dark-700 flex items-center justify-center opacity-50">
              <svg className="w-10 h-10 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-dark-400 font-medium">Chưa có vé nào</p>
            <p className="text-dark-500 text-sm mt-1">Hãy đặt vé xem phim đầu tiên của bạn!</p>
            <Link to="/movies" className="inline-block mt-5 btn-primary text-sm py-2 px-5">Khám phá phim</Link>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="space-y-3"
              variants={staggerContainer(0.05)}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {bookings.map(b => {
                  const st = BOOKING_STATUS[b.status] || {}
                  const accentColor = STATUS_ACCENT[b.status] || 'bg-dark-500'
                  return (
                    <motion.div key={b.id} variants={staggerItem} layout>
                      <Link
                        to={`/bookings/${b.id}`}
                        className="group block rounded-2xl border border-dark-700/60 hover:border-primary-500/30 bg-dark-900/60 hover:bg-dark-800/60 transition-all duration-200 overflow-hidden"
                        style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}
                      >
                        <div className="flex">
                          <div className={`w-1 flex-shrink-0 ${accentColor} opacity-70`} />
                          <div className="flex gap-4 p-4 flex-1 min-w-0">
                            {/* Poster */}
                            {b.posterUrl ? (
                              <motion.div
                                className="w-16 flex-shrink-0 rounded-xl overflow-hidden"
                                style={{ minHeight: 88 }}
                                whileHover={{ scale: 1.04 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              >
                                <img src={b.posterUrl} alt="" className="w-full h-full object-cover" />
                              </motion.div>
                            ) : (
                              <div className="w-16 flex-shrink-0 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center" style={{ minHeight: 88 }}>
                                <svg className="w-6 h-6 text-dark-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                </svg>
                              </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <h3 className="font-semibold text-white line-clamp-1 group-hover:text-primary-300 transition-colors text-[15px]">
                                  {b.movieTitle}
                                </h3>
                                <span className={`badge-status flex-shrink-0 ${st.color}`}>{st.label}</span>
                              </div>

                              <div className="flex items-center gap-1.5 text-dark-400 text-xs mb-1">
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDateTime(b.startTime)}
                              </div>

                              <div className="flex items-center gap-1.5 text-dark-400 text-xs mb-3">
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {b.cinemaName}
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <div className="flex gap-1 flex-wrap">
                                  {(b.seatCodes || []).map(c => (
                                    <span key={c} className="text-xs bg-dark-800 border border-dark-700 text-dark-300 px-2 py-0.5 rounded-md font-mono">{c}</span>
                                  ))}
                                </div>
                                <span className="text-primary-400 font-bold text-sm flex-shrink-0">{formatPrice(b.finalAmount)}</span>
                              </div>

                              <div className="mt-2 flex items-center gap-1.5">
                                <svg className="w-3 h-3 text-dark-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                </svg>
                                <span className="text-dark-500 text-xs font-mono tracking-wide">{b.bookingCode}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
