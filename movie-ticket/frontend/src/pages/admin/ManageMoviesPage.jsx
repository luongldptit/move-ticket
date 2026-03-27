import { useState, useEffect } from 'react'
import { movieApi } from '../../api/movieApi'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { MOVIE_STATUS, AGE_RATING, formatDate, getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'

const emptyForm = {
  title: '', description: '', director: '', castMembers: '',
  duration: '', releaseDate: '', posterUrl: '', trailerUrl: '',
  ageRating: 'P', status: 'COMING_SOON', genreIds: [],
}

export default function ManageMoviesPage() {
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    movieApi.getGenres().then(r => setGenres(r.data.data || [])).catch(() => {})
  }, [])

  const load = () => {
    setLoading(true)
    movieApi.getMovies({ keyword: search, page, size: 10 })
      .then(r => { setMovies(r.data.data.content || []); setTotalPages(r.data.data.totalPages || 0) })
      .catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [page, search])

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (m) => {
    setEditItem(m)
    setForm({ ...emptyForm, ...m, genreIds: (m.genres || []).map(g => g.id || g) })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, duration: parseInt(form.duration) }
      if (editItem) await movieApi.updateMovie(editItem.id, payload)
      else await movieApi.createMovie(payload)
      toast.success(editItem ? 'Cập nhật phim thành công' : 'Thêm phim thành công')
      setModalOpen(false)
      load()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const handleDelete = async (m) => {
    if (!confirm(`Ẩn phim "${m.title}"?`)) return
    try {
      await movieApi.deleteMovie(m.id)
      toast.success('Đã ẩn phim')
      load()
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const toggleGenre = (id) => {
    setForm(f => ({
      ...f,
      genreIds: f.genreIds.includes(id) ? f.genreIds.filter(x => x !== id) : [...f.genreIds, id]
    }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Phim</h1>
        <button onClick={openAdd} className="btn-primary">+ Thêm phim</button>
      </div>

      {/* Search */}
      <input
        type="text" placeholder="Tìm phim..." className="input-field mb-4 max-w-sm"
        value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
      />

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-800 border-b border-dark-700">
              <tr>
                {['Phim', 'Thể loại', 'Thời lượng', 'Ngày chiếu', 'Trạng thái', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-dark-300 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-dark-400">Đang tải...</td></tr>
              ) : movies.map(m => {
                const st = MOVIE_STATUS[m.status] || {}
                return (
                  <tr key={m.id} className="hover:bg-dark-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={m.posterUrl || 'https://placehold.co/32x48/1e293b/94a3b8?text=?'} alt="" className="w-8 rounded object-cover" />
                        <div className="text-white font-medium line-clamp-1">{m.title}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dark-400">{(m.genres || []).map(g => typeof g === 'string' ? g : g.name).join(', ')}</td>
                    <td className="px-4 py-3 text-dark-300">{m.duration} phút</td>
                    <td className="px-4 py-3 text-dark-300">{formatDate(m.releaseDate)}</td>
                    <td className="px-4 py-3"><span className={`badge-status ${st.color}`}>{st.label}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(m)} className="text-xs bg-dark-700 hover:bg-dark-600 text-white px-3 py-1.5 rounded-lg">Sửa</button>
                        <button onClick={() => handleDelete(m)} className="text-xs bg-red-900/40 hover:bg-red-900/60 text-red-400 px-3 py-1.5 rounded-lg">Ẩn</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Sửa phim' : 'Thêm phim mới'} size="lg">
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Tên phim *</label>
              <input required className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Đạo diễn</label>
              <input className="input-field" value={form.director} onChange={e => setForm({ ...form, director: e.target.value })} />
            </div>
            <div>
              <label className="label">Thời lượng (phút) *</label>
              <input required type="number" min="1" className="input-field" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div>
              <label className="label">Ngày khởi chiếu</label>
              <input type="date" className="input-field" value={form.releaseDate} onChange={e => setForm({ ...form, releaseDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Xếp hạng tuổi</label>
              <select className="input-field" value={form.ageRating} onChange={e => setForm({ ...form, ageRating: e.target.value })}>
                {Object.keys(AGE_RATING).map(k => <option key={k} value={k}>{AGE_RATING[k].title || k}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Trạng thái</label>
              <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {Object.entries(MOVIE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">URL Poster</label>
              <input className="input-field" placeholder="https://..." value={form.posterUrl} onChange={e => setForm({ ...form, posterUrl: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">URL Trailer</label>
              <input className="input-field" placeholder="https://youtube.com/..." value={form.trailerUrl} onChange={e => setForm({ ...form, trailerUrl: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Diễn viên</label>
              <input className="input-field" placeholder="Tên diễn viên, cách nhau bằng dấu phẩy" value={form.castMembers} onChange={e => setForm({ ...form, castMembers: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Mô tả</label>
              <textarea rows={3} className="input-field resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Thể loại</label>
              <div className="flex flex-wrap gap-2">
                {genres.map(g => (
                  <button type="button" key={g.id}
                    onClick={() => toggleGenre(g.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      form.genreIds.includes(g.id)
                        ? 'bg-primary-600 border-primary-500 text-white'
                        : 'bg-dark-800 border-dark-600 text-dark-300 hover:border-dark-500'
                    }`}
                  >{g.name}</button>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full mt-2">
            {saving ? 'Đang lưu...' : (editItem ? 'Cập nhật' : 'Thêm phim')}
          </button>
        </form>
      </Modal>
    </div>
  )
}
