import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../api/adminApi'
import { formatPrice } from '../../utils/helpers'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageLoader } from '../../components/common/Spinner'

const today = new Date().toISOString().split('T')[0]
const defaultFrom = new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0]

const PRESETS = [
  { label: '7 ngày', getDates: () => { const d = new Date(); const f = new Date(d); f.setDate(d.getDate() - 6); return [f.toISOString().split('T')[0], d.toISOString().split('T')[0]] } },
  { label: '30 ngày', getDates: () => { const d = new Date(); const f = new Date(d); f.setDate(d.getDate() - 29); return [f.toISOString().split('T')[0], d.toISOString().split('T')[0]] } },
  { label: 'Tháng này', getDates: () => { const d = new Date(); return [`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`, d.toISOString().split('T')[0]] } },
  { label: '3 tháng', getDates: () => { const d = new Date(); const f = new Date(d.getFullYear(), d.getMonth() - 2, 1); return [f.toISOString().split('T')[0], d.toISOString().split('T')[0]] } },
  { label: 'Năm nay', getDates: () => { const d = new Date(); return [`${d.getFullYear()}-01-01`, d.toISOString().split('T')[0]] } },
]

export default function DashboardPage() {
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(today)
  const [activePreset, setActivePreset] = useState('3 tháng')
  const [revenue, setRevenue] = useState(null)
  const [topMovies, setTopMovies] = useState([])
  const [occupancy, setOccupancy] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback((f, t) => {
    setLoading(true)
    Promise.all([
      adminApi.getRevenueReport({ type: 'MONTHLY', from: f, to: t }),
      adminApi.getTopMovies({ from: f, to: t, limit: 5 }),
      adminApi.getOccupancyReport({ from: f, to: t }),
    ]).then(([rv, tm, oc]) => {
      setRevenue(rv.data.data)
      setTopMovies(tm.data.data || [])
      setOccupancy(oc.data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(from, to) }, [])

  const handlePreset = (preset) => {
    const [f, t] = preset.getDates()
    setFrom(f)
    setTo(t)
    setActivePreset(preset.label)
    load(f, t)
  }

  const handleApply = () => {
    setActivePreset('')
    load(from, to)
  }

  const chartData = (revenue?.breakdown || []).map(b => ({
    period: b.period,
    revenue: b.revenue,
    bookings: b.bookings,
  }))

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>

        {/* Date filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Presets */}
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                activePreset === p.label
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-dark-300 hover:text-white border border-dark-700'
              }`}
            >
              {p.label}
            </button>
          ))}

          {/* Custom range */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={from}
              max={to}
              onChange={e => { setFrom(e.target.value); setActivePreset('') }}
              className="input-field py-1.5 text-xs w-36"
            />
            <span className="text-dark-400 text-xs">→</span>
            <input
              type="date"
              value={to}
              min={from}
              max={today}
              onChange={e => { setTo(e.target.value); setActivePreset('') }}
              className="input-field py-1.5 text-xs w-36"
            />
            <button onClick={handleApply} className="btn-primary py-1.5 px-3 text-xs">
              Áp dụng
            </button>
          </div>
        </div>
      </div>

      {loading ? <PageLoader /> : (
        <>
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
          {chartData.length > 0 ? (
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
          ) : (
            <div className="card p-5 mb-8 text-center text-dark-400 py-10">Không có dữ liệu doanh thu trong khoảng thời gian này</div>
          )}

          {/* Top movies */}
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4">Top phim doanh thu cao</h2>
            {topMovies.length === 0 ? (
              <div className="text-center text-dark-400 py-6">Không có dữ liệu</div>
            ) : (
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
            )}
          </div>
        </>
      )}
    </div>
  )
}
