import { useState, useEffect } from 'react'
import { movieApi } from '../../api/movieApi'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { MOVIE_STATUS, AGE_RATING, formatDate, getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, staggerContainer, staggerItem } from '../../utils/motion'

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
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">Quản lý Phim</h1>
          <p className="text-dark-400 text-xs font-bold mt-1 uppercase tracking-wider">Cập nhật danh sách phim và trạng thái chiếu</p>
        </div>
        <button 
          onClick={openAdd} 
          className="bg-primary-600 hover:bg-primary-500 text-white font-black text-[13px] px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-900/20 active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          THÊM PHÍM MỚI
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" 
            placeholder="Tìm kiếm tên phim..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-11 py-3 text-sm text-white focus:outline-none focus:border-primary-500/50 backdrop-blur-md transition-all font-medium"
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(0) }}
          />
        </div>
      </div>

      {/* Premium Table Area */}
      <div className="bg-black/20 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-white/5">
                {['Thông tin Phim', 'Thể loại', 'Thời lượng', 'Khởi chiếu', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[10px] font-black text-dark-400 uppercase tracking-[0.2em] border-b border-white/5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-dark-400 text-xs font-black tracking-widest uppercase">Đang đồng bộ dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : movies.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-20 text-dark-500 font-bold uppercase tracking-widest text-xs">Không tìm thấy phim nào</td></tr>
              ) : (
                movies.map((m, idx) => {
                  const st = MOVIE_STATUS[m.status] || {}
                  return (
                    <motion.tr 
                      key={m.id} 
                      className="hover:bg-white/[0.02] group transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0 w-12 h-16 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                            <img src={m.posterUrl || 'https://placehold.co/100x150/1e293b/94a3b8?text=?'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-white font-black text-sm line-clamp-1 mb-1 group-hover:text-primary-400 transition-colors uppercase tracking-tight">{m.title}</div>
                            <div className="text-dark-400 text-[10px] font-bold uppercase tracking-widest">{m.director || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(m.genres || []).map((g, i) => (
                            <span key={i} className="text-[9px] font-black uppercase text-dark-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                              {typeof g === 'string' ? g : g.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-bold text-xs">{m.duration} <span className="text-dark-500 font-medium">phút</span></td>
                      <td className="px-6 py-4 text-dark-300 font-bold text-xs">{formatDate(m.releaseDate)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm ${
                          m.status === 'NOW_SHOWING' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          m.status === 'COMING_SOON' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-dark-800 text-dark-400 border-white/5'
                        }`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                          <button 
                            onClick={() => openEdit(m)} 
                            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-primary-600/20 border border-white/5 hover:border-primary-500/30 text-dark-300 hover:text-primary-400 flex items-center justify-center transition-all"
                            title="Sửa"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(m)} 
                            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-900/20 border border-white/5 hover:border-rose-500/30 text-dark-300 hover:text-rose-400 flex items-center justify-center transition-all"
                            title="Ẩn"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.882 9.882L14.12 14.12M3 3l18 18" />
                            </svg>
                          </button>
                        </div>
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
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Premium Modal Form */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editItem ? 'CẬP NHẬT TÁC PHẨM' : 'THÊM TÁC PHẨM CHIẾU'} 
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Tên phim / Title *</label>
              <input required className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 shadow-inner" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Đạo diễn</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 shadow-inner" value={form.director} onChange={e => setForm({ ...form, director: e.target.value })} />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Thời lượng (Phút) *</label>
              <input required type="number" min="1" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 shadow-inner" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Ngày khởi chiếu</label>
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 shadow-inner [color-scheme:dark]" value={form.releaseDate} onChange={e => setForm({ ...form, releaseDate: e.target.value })} />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Phân loại tuổi</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 shadow-inner outline-none appearance-none cursor-pointer" value={form.ageRating} onChange={e => setForm({ ...form, ageRating: e.target.value })}>
                {Object.keys(AGE_RATING).map(k => <option key={k} value={k} className="bg-dark-900">{AGE_RATING[k].title || k}</option>)}
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Trạng thái phát hành</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 shadow-inner outline-none appearance-none cursor-pointer" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {Object.entries(MOVIE_STATUS).map(([k, v]) => <option key={k} value={k} className="bg-dark-900">{v.label}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Poster Image URL</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 shadow-inner placeholder:text-dark-600" placeholder="https://..." value={form.posterUrl} onChange={e => setForm({ ...form, posterUrl: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Official Trailer URL (YouTube)</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 shadow-inner placeholder:text-dark-600" placeholder="https://youtube.com/..." value={form.trailerUrl} onChange={e => setForm({ ...form, trailerUrl: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Danh sách Diễn viên</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 shadow-inner placeholder:text-dark-600" placeholder="Tên diễn viên, phân cách bằng dấu phẩy" value={form.castMembers} onChange={e => setForm({ ...form, castMembers: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Tóm tắt nội dung</label>
              <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 shadow-inner resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-3 block">Danh mục Thể loại</label>
              <div className="flex flex-wrap gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                {genres.map(g => {
                  const active = form.genreIds.includes(g.id)
                  return (
                    <button 
                      type="button" 
                      key={g.id}
                      onClick={() => toggleGenre(g.id)}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                        active
                          ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/20'
                          : 'bg-white/5 border-white/10 text-dark-400 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {g.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <button 
              type="button" 
              onClick={() => setModalOpen(false)}
              className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-dark-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Hủy bỏ / Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="flex-[2] bg-gradient-to-r from-primary-600 to-rose-600 hover:from-primary-500 hover:to-rose-500 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary-900/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Processing...' : (editItem ? 'Lưu Thay Đổi' : 'Xác Nhận Thêm Phim')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
