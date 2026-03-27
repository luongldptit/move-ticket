import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import { formatPrice } from '../../utils/helpers'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageLoader } from '../../components/common/Spinner'

export default function DashboardPage() {
  const [revenue, setRevenue] = useState(null)
  const [topMovies, setTopMovies] = useState([])
  const [occupancy, setOccupancy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    const from = new Date(today.getFullYear(), today.getMonth() - 2, 1).toISOString().split('T')[0]
    const to = today.toISOString().split('T')[0]

    Promise.all([
      adminApi.getRevenueReport({ type: 'MONTHLY', from, to }),
      adminApi.getTopMovies({ from, to, limit: 5 }),
      adminApi.getOccupancyReport({ from, to }),
    ]).then(([rv, tm, oc]) => {
      setRevenue(rv.data.data)
      setTopMovies(tm.data.data || [])
      setOccupancy(oc.data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const chartData = (revenue?.breakdown || []).map(b => ({
    period: b.period,
    revenue: b.revenue,
    bookings: b.bookings,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Tổng doanh thu', value: formatPrice(revenue?.totalRevenue || 0), icon: '💰', color: 'text-green-400' },
          { label: 'Tổng lượt đặt', value: (revenue?.totalBookings || 0).toLocaleString(), icon: '🎟', color: 'text-blue-400' },
          { label: 'Tỷ lệ lấp đầy TB', value: `${(occupancy?.averageOccupancyRate || 0).toFixed(1)}%`, icon: '🏟', color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-dark-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {chartData.length > 0 && (
        <div className="card p-5 mb-8">
          <h2 className="font-semibold text-white mb-4">Doanh thu theo tháng</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={v => formatPrice(v)}
              />
              <Area type="monotone" dataKey="revenue" stroke="#e11d48" fill="url(#rv)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top movies */}
      {topMovies.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Top phim doanh thu cao</h2>
          <div className="space-y-3">
            {topMovies.map(m => (
              <div key={m.movieId} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-dark-800 border border-dark-600 flex items-center justify-center text-sm font-bold text-primary-400">
                  {m.rank}
                </div>
                <img src={m.posterUrl || 'https://placehold.co/40x60/1e293b/94a3b8?text=?'} alt="" className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm line-clamp-1">{m.movieTitle}</div>
                  <div className="text-dark-400 text-xs">{m.totalTicketsSold} vé · {m.totalShowtimes} suất</div>
                </div>
                <div className="text-green-400 font-semibold text-sm flex-shrink-0">{formatPrice(m.totalRevenue)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
