import { useState, useEffect } from 'react'
import { showtimeApi } from '../../api/showtimeApi'
import { movieApi } from '../../api/movieApi'
import { cinemaApi } from '../../api/cinemaApi'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { formatDateTime, formatPrice, getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'

const SHOWTIME_STATUS = {
  SCHEDULED: { label: 'Đã lên lịch', color: 'bg-blue-500/20 text-blue-400' },
  ONGOING: { label: 'Đang chiếu', color: 'bg-green-500/20 text-green-400' },
  FINISHED: { label: 'Đã kết thúc', color: 'bg-dark-500/20 text-dark-400' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-500/20 text-red-400' },
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Suất chiếu</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary">+ Tạo suất chiếu</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select className="input-field w-auto" value={filterMovieId} onChange={e => setFilterMovieId(e.target.value)}>
          <option value="">Tất cả phim</option>
          {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <select className="input-field w-auto" value={cinemaId} onChange={e => setCinemaId(e.target.value)}>
          <option value="">Tất cả rạp</option>
          {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" className="input-field w-auto" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        <select className="input-field w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(SHOWTIME_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-800 border-b border-dark-700">
              <tr>
                {['Phim', 'Rạp / Phòng', 'Thời gian', 'Giá vé', 'Trạng thái', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-dark-300 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-dark-400">Đang tải...</td></tr>
              ) : showtimes.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-dark-400">Không có suất chiếu nào</td></tr>
              ) : showtimes.map(st => {
                const s = SHOWTIME_STATUS[st.status] || {}
                return (
                  <tr key={st.id} className="hover:bg-dark-800/50">
                    <td className="px-4 py-3 text-white font-medium">{st.movie?.title}</td>
                    <td className="px-4 py-3">
                      <div className="text-dark-300">{st.cinema?.name}</div>
                      <div className="text-dark-500 text-xs">{st.room?.name} ({st.room?.type})</div>
                    </td>
                    <td className="px-4 py-3 text-dark-300 text-xs">
                      <div>{formatDateTime(st.startTime)}</div>
                      <div className="text-dark-500">→ {formatDateTime(st.endTime)}</div>
                    </td>
                    <td className="px-4 py-3 text-dark-400 text-xs">
                      <div>Thường: {formatPrice(st.priceStandard)}</div>
                      <div>VIP: {formatPrice(st.priceVip)}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`badge-status ${s.color}`}>{s.label}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(st.id)} className="text-xs bg-red-900/40 hover:bg-red-900/60 text-red-400 px-3 py-1.5 rounded-lg">Xóa</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tạo suất chiếu mới">
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="label">Phim *</label>
            <select required className="input-field" value={form.movieId} onChange={e => setForm({ ...form, movieId: e.target.value })}>
              <option value="">-- Chọn phim --</option>
              {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Rạp</label>
            <select className="input-field" value={cinemaId} onChange={e => { setCinemaId(e.target.value); setForm({ ...form, roomId: '' }) }}>
              <option value="">-- Chọn rạp --</option>
              {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Phòng chiếu *</label>
            <select required className="input-field" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })}>
              <option value="">-- Chọn phòng --</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Giờ bắt đầu *</label>
            <input required type="datetime-local" className="input-field" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['priceStandard', 'Ghế thường'], ['priceVip', 'Ghế VIP'], ['priceCouple', 'Ghế Couple']].map(([k, l]) => (
              <div key={k}>
                <label className="label">{l} (đ)</label>
                <input required type="number" min="0" className="input-field" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Đang tạo...' : 'Tạo suất chiếu'}</button>
        </form>
      </Modal>
    </div>
  )
}
