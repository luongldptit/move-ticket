import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingApi } from '../../api/bookingApi'
import Pagination from '../../components/common/Pagination'
import { PageLoader } from '../../components/common/Spinner'
import { BOOKING_STATUS, formatDateTime, formatPrice } from '../../utils/helpers'

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
        <h1 className="text-2xl font-bold text-white mb-6">Lịch sử đặt vé</h1>

        {/* Status tabs */}
        <div className="flex gap-1 bg-dark-900 rounded-xl p-1 border border-dark-700 mb-6 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t.value}
              onClick={() => { setStatusFilter(t.value); setPage(0) }}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === t.value ? 'bg-primary-600 text-white' : 'text-dark-300 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? <PageLoader /> : bookings.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <p>Chưa có vé nào</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {bookings.map(b => {
                const st = BOOKING_STATUS[b.status] || {}
                return (
                  <Link key={b.id} to={`/bookings/${b.id}`} className="card-hover block p-4">
                    <div className="flex gap-4">
                      {b.posterUrl && (
                        <img src={b.posterUrl} alt="" className="w-14 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-white line-clamp-1">{b.movieTitle}</h3>
                          <span className={`badge-status flex-shrink-0 ${st.color}`}>{st.label}</span>
                        </div>
                        <div className="text-dark-400 text-sm mt-1">{formatDateTime(b.startTime)}</div>
                        <div className="text-dark-400 text-sm">{b.cinemaName}</div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex gap-1 flex-wrap">
                            {(b.seatCodes || []).map(c => (
                              <span key={c} className="text-xs bg-dark-800 text-dark-300 px-2 py-0.5 rounded">{c}</span>
                            ))}
                          </div>
                          <span className="text-primary-400 font-semibold text-sm">{formatPrice(b.finalAmount)}</span>
                        </div>
                        <div className="text-dark-500 text-xs mt-1 font-mono">{b.bookingCode}</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
