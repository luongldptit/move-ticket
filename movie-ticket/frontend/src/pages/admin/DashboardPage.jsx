import { useState, useEffect, useCallback, useMemo } from 'react'
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
    const diffDays = Math.ceil(Math.abs(new Date(t) - new Date(f)) / (1000 * 60 * 60 * 24))
    const reportType = diffDays <= 31 ? 'DAILY' : 'MONTHLY'
    
    Promise.all([
      adminApi.getRevenueReport({ type: reportType, from: f, to: t }),
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

  const diffDays = Math.ceil(Math.abs(new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24))
  const isDaily = diffDays <= 31

  const chartData = useMemo(() => {
    if (!revenue?.breakdown) return []
    
    const map = revenue.breakdown.reduce((acc, b) => {
      const pStr = String(b.period)
      acc[pStr] = b
      if (pStr.length >= 10) acc[pStr.substring(0, 10)] = b
      if (pStr.length >= 7) acc[pStr.substring(0, 7)] = b
      return acc
    }, {})

    const data = []
    let curr = new Date(from)
    const endDate = new Date(to)
    
    if (isDaily) {
      while (curr <= endDate) {
        const periodKey = curr.toISOString().split('T')[0]
        data.push({
          period: periodKey,
          revenue: map[periodKey]?.revenue || 0,
          bookings: map[periodKey]?.bookings || 0
        })
        curr.setDate(curr.getDate() + 1)
      }
    } else {
      curr.setDate(1)
      const endMonth = new Date(endDate)
      endMonth.setDate(1)
      while (curr <= endMonth) {
        const periodKey = curr.toISOString().substring(0, 7)
        data.push({
          period: periodKey,
          revenue: map[periodKey]?.revenue || 0,
          bookings: map[periodKey]?.bookings || 0
        })
        curr.setMonth(curr.getMonth() + 1)
      }
    }
    return data
  }, [revenue, from, to, isDaily])

  return (
    <div className="flex flex-col h-full">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-dark-300 tracking-tight">Overview Dashboard</h1>
          <p className="text-dark-400 text-sm mt-2 font-medium">Báo cáo doanh thu & hiệu suất hệ thống rạp phim</p>
        </div>

        {/* Date filter Glass Panel */}
        <div className="flex flex-wrap items-center gap-3 bg-black/40 border border-white/5 p-2 rounded-2xl backdrop-blur-md">
          {/* Presets */}
          <div className="flex items-center gap-1 border-r border-white/10 pr-3">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => handlePreset(p)}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 ${
                  activePreset === p.label
                    ? 'bg-primary-600 shadow-[0_0_15px_rgba(225,29,72,0.4)] text-white'
                    : 'text-dark-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div className="flex items-center gap-2 pl-1">
            <input
              type="date"
              value={from}
              max={to}
              onChange={e => { setFrom(e.target.value); setActivePreset('') }}
              className="bg-transparent border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-primary-500 outline-none"
            />
            <span className="text-dark-500">→</span>
            <input
              type="date"
              value={to}
              min={from}
              max={today}
              onChange={e => { setTo(e.target.value); setActivePreset('') }}
              className="bg-transparent border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-primary-500 outline-none"
            />
            <button onClick={handleApply} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold py-1.5 px-4 rounded-xl transition-all">
              Filter
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <PageLoader />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Top 3 Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'TỔNG DOANH THU', value: formatPrice(revenue?.totalRevenue || 0), desc: 'Đã thanh toán thành công', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1', color: 'from-green-500 to-emerald-700', glow: 'rgba(16,185,129,0.2)' },
              { label: 'TỔNG VÉ ĐÃ ĐẶT', value: (revenue?.totalBookings || 0).toLocaleString(), desc: 'Lượt giao dịch chốt', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z', color: 'from-blue-500 to-indigo-700', glow: 'rgba(59,130,246,0.2)' },
              { label: 'TỶ LỆ LẤP ĐẦY RẠP', value: `${(occupancy?.averageOccupancyRate || 0).toFixed(1)}%`, desc: 'Tỉ suất bình quân phòng', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'from-purple-500 to-fuchsia-700', glow: 'rgba(168,85,247,0.2)' },
            ].map(s => (
              <div key={s.label} className="relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-6 group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-50 group-hover:opacity-80 transition-opacity" style={{ background: s.glow }} />
                
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${s.color} shadow-lg`}>
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-dark-400">{s.label}</div>
                    <div className="text-xs font-semibold text-dark-300 mt-0.5">{s.desc}</div>
                  </div>
                </div>
                
                <div className="text-4xl font-black text-white tracking-tighter drop-shadow-md relative z-10">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue chart (takes 2 columns) */}
            <div className="lg:col-span-2 bg-black/30 border border-white/5 rounded-3xl p-6 relative min-w-0">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/90 mb-6">Biểu Đồ Doanh Thu</h2>
              {chartData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e11d48" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} tickFormatter={v => new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(v)} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', padding: '12px 16px' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}
                        itemStyle={{ color: '#e11d48', fontWeight: 700, fontSize: '14px' }}
                        formatter={(value) => [formatPrice(value), 'Doanh Thu']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#e11d48" fill="url(#rv)" strokeWidth={3} activeDot={{ r: 6, fill: '#fff', stroke: '#e11d48', strokeWidth: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-dark-500 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-white/5 rounded-2xl">Không có dữ liệu trong kỳ</div>
              )}
            </div>

            {/* Top movies Table */}
            <div className="bg-black/30 border border-white/5 rounded-3xl p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/90 mb-6 flex items-center justify-between">
                <span>Top Tác Phẩm</span>
                <span className="text-[10px] text-dark-400 font-bold bg-white/5 px-2 py-1 rounded">DOANH THU KHỦNG CỦA KỲ</span>
              </h2>
              {topMovies.length === 0 ? (
                <div className="text-center text-dark-500 py-12 border-2 border-dashed border-white/5 rounded-2xl">TRỐNG DANH SÁCH</div>
              ) : (
                <div className="space-y-4">
                  {topMovies.map(m => (
                    <div key={m.movieId} className="flex gap-4 p-3 hover:bg-white/5 rounded-2xl transition-colors border border-transparent hover:border-white/5">
                      <div className="relative w-12 h-16 shrink-0 rounded-xl overflow-hidden shadow-lg border border-white/10">
                        <img src={m.posterUrl || 'https://placehold.co/80x120/1e293b/94a3b8?text=?'} alt="" className="w-full h-full object-cover" />
                        <div className="absolute top-0 left-0 w-5 h-5 bg-black/80 backdrop-blur text-white flex items-center justify-center text-[10px] font-black rounded-br-lg">{m.rank}</div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="text-white font-bold text-sm line-clamp-1 mb-1">{m.movieTitle}</div>
                        <div className="text-dark-400 text-[10px] font-bold tracking-widest uppercase mb-1">{m.totalTicketsSold} VÉ / {m.totalShowtimes} SUẤT</div>
                        <div className="text-primary-400 font-black text-sm">{formatPrice(m.totalRevenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
