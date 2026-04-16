import { useState, useEffect } from 'react'
import { showtimeApi } from '../../api/showtimeApi'
import { movieApi } from '../../api/movieApi'
import { cinemaApi } from '../../api/cinemaApi'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { formatDateTime, formatPrice, getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../../utils/motion'

const SHOWTIME_STATUS = {
  SCHEDULED: { label: 'Đã lên lịch', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  ONGOING: { label: 'Đang chiếu', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  FINISHED: { label: 'Đã kết thúc', color: 'bg-dark-800 text-dark-500 border-white/5' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
}

export default function ManageShowtimesPage() {
  const [showtimes, setShowtimes] = useState([])
  const [movies, setMovies] = useState([])
  const [cinemas, setCinemas] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ movieId: '', roomId: '', startTime: '', priceStandard: '', priceVip: '', priceCouple: '' })
  const [cinemaId, setCinemaId] = useState('')
  const [filterMovieId, setFilterMovieId] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    movieApi.getNowShowing().then(r => setMovies(r.data.data.content || r.data.data || [])).catch(() => {})
    cinemaApi.getCinemas().then(r => setCinemas(r.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!cinemaId) return
    cinemaApi.getCinemaRooms(cinemaId).then(r => setRooms(r.data.data || [])).catch(() => setRooms([]))
  }, [cinemaId])

  const load = () => {
    setLoading(true)
    showtimeApi.getShowtimes({ movieId: filterMovieId || undefined, cinemaId: cinemaId || undefined, date: filterDate || undefined, status: filterStatus || undefined, page, size: 10 })
      .then(r => setShowtimes(r.data.data || []))
      .catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [filterMovieId, cinemaId, filterDate, filterStatus, page])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await showtimeApi.createShowtime({ ...form, movieId: parseInt(form.movieId), roomId: parseInt(form.roomId), priceStandard: parseFloat(form.priceStandard), priceVip: parseFloat(form.priceVip), priceCouple: parseFloat(form.priceCouple) })
      toast.success('Tạo suất chiếu thành công')
      setModalOpen(false); load()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa suất chiếu này?')) return
    try { await showtimeApi.deleteShowtime(id); toast.success('Đã xóa'); load() }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">Quản lý Suất chiếu</h1>
          <p className="text-dark-400 text-xs font-bold mt-1 uppercase tracking-wider">Lập lịch và điều phối thời gian rạp</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)} 
          className="bg-primary-600 hover:bg-primary-500 text-white font-black text-[13px] px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          TẠO SUẤT CHIẾU
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="flex flex-wrap gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
        <select className="bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 outline-none cursor-pointer flex-1 min-w-[150px]" value={filterMovieId} onChange={e => setFilterMovieId(e.target.value)}>
          <option value="" className="text-dark-500">Tất cả phim</option>
          {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <select className="bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 outline-none cursor-pointer flex-1 min-w-[150px]" value={cinemaId} onChange={e => setCinemaId(e.target.value)}>
          <option value="" className="text-dark-500">Tất cả rạp</option>
          {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" className="bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 outline-none [color-scheme:dark] flex-1 min-w-[150px]" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        <select className="bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 outline-none cursor-pointer flex-1 min-w-[150px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="" className="text-dark-500">Tất cả trạng thái</option>
          {Object.entries(SHOWTIME_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Premium Table Area */}
      <div className="bg-black/20 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5">
                {['Tác phẩm', 'Rạp / Phòng', 'Thời gian chiếu', 'Biểu giá vé', 'Trạng thái', ''].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[10px] font-black text-dark-400 uppercase tracking-[0.2em] border-b border-white/5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-20 text-dark-500 font-black text-xs uppercase tracking-widest animate-pulse">Đang truy xuất lịch chiếu...</td></tr>
              ) : showtimes.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-20 text-dark-500 font-black text-xs uppercase tracking-widest">Không có dữ liệu suất chiếu</td></tr>
              ) : (
                showtimes.map((st, idx) => {
                  const s = SHOWTIME_STATUS[st.status] || {}
                  return (
                    <motion.tr 
                      key={st.id} 
                      className="hover:bg-white/[0.02] transition-colors group"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td className="px-6 py-4">
                        <div className="text-white font-black text-sm uppercase group-hover:text-primary-400 transition-colors tracking-tight">{st.movie?.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-dark-200 font-bold text-xs">{st.cinema?.name}</span>
                          <span className="text-dark-500 text-[10px] font-black uppercase tracking-widest mt-1">Phòng {st.room?.name} · {st.room?.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5 mb-1.5">
                            <svg className="w-3 h-3 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-white font-black text-xs leading-none">{formatDateTime(st.startTime)}</span>
                          </div>
                          <div className="text-dark-500 text-[9px] font-medium pl-2">Kết thúc: {formatDateTime(st.endTime)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="grid grid-cols-1 gap-1">
                          <div className="flex justify-between gap-4 text-[10px] font-bold">
                            <span className="text-dark-400 uppercase tracking-tighter">Normal</span>
                            <span className="text-white">{formatPrice(st.priceStandard)}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-[10px] font-bold">
                            <span className="text-primary-400 uppercase tracking-tighter">VIP</span>
                            <span className="text-white">{formatPrice(st.priceVip)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm ${s.color}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(st.id)} 
                          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-900/20 border border-white/5 hover:border-rose-500/30 text-dark-500 hover:text-rose-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-2">
         <Pagination currentPage={page} totalPages={100} onPageChange={setPage} />
      </div>

      {/* Premium Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="LẬP LỊCH SUẤT CHIẾU MỚI" size="md">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Tác phẩm điện ảnh *</label>
              <select required className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary-500 outline-none appearance-none cursor-pointer" value={form.movieId} onChange={e => setForm({ ...form, movieId: e.target.value })}>
                <option value="" className="bg-dark-900 text-dark-500">-- Chọn phim phát hành --</option>
                {movies.map(m => <option key={m.id} value={m.id} className="bg-dark-900">{m.title}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Chọn Cụm Rạp</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary-500 outline-none appearance-none cursor-pointer" value={cinemaId} onChange={e => { setCinemaId(e.target.value); setForm({ ...form, roomId: '' }) }}>
                  <option value="" className="bg-dark-900 text-dark-500">-- Chọn rạp --</option>
                  {cinemas.map(c => <option key={c.id} value={c.id} className="bg-dark-900">{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Phòng Chiếu *</label>
                <select required className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary-500 outline-none appearance-none cursor-pointer" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })}>
                  <option value="" className="bg-dark-900 text-dark-500">-- Chọn phòng --</option>
                  {rooms.map(r => <option key={r.id} value={r.id} className="bg-dark-900">{r.name} ({r.type})</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Thời gian bắt đầu *</label>
              <input required type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary-500 outline-none [color-scheme:dark]" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              {[
                { k: 'priceStandard', l: 'G. Thường', c: 'text-dark-300' }, 
                { k: 'priceVip', l: 'G. VIP', c: 'text-primary-400' }, 
                { k: 'priceCouple', l: 'G. Couple', c: 'text-rose-400' }
              ].map(p => (
                <div key={p.k}>
                  <label className={`text-[9px] font-black uppercase tracking-widest mb-1 shadow-sm px-1 ${p.c}`}>{p.l} (đ)</label>
                  <input required type="number" min="0" className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary-500 outline-none" value={form[p.k]} onChange={e => setForm({ ...form, [p.k]: e.target.value })} />
                </div>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black text-xs py-4 rounded-2xl shadow-xl shadow-primary-900/20 transition-all active:scale-95 uppercase tracking-[0.2em]">
            {saving ? 'Đang Thiết Lập...' : 'XÁC NHẬN LÊN LỊCH'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
