import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../../utils/motion'

const emptyForm = {
  code: '', description: '', discountType: 'PERCENTAGE', discountValue: '',
  minOrderAmount: '0', maxDiscountAmount: '', usageLimit: '',
  startDate: '', endDate: '', isActive: true,
}

export default function ManagePromotionsPage() {
  const [promos, setPromos] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    adminApi.getPromotions({ page, size: 10 })
      .then(r => { setPromos(r.data.data.content || []); setTotalPages(r.data.data.totalPages || 0) })
      .catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [page])

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (p) => { setEditItem(p); setForm({ ...emptyForm, ...p, discountValue: String(p.discountValue), minOrderAmount: String(p.minOrderAmount), maxDiscountAmount: String(p.maxDiscountAmount || ''), usageLimit: String(p.usageLimit || '') }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: parseFloat(form.minOrderAmount) || 0,
        maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
      }
      if (editItem) await adminApi.updatePromotion(editItem.id, payload)
      else await adminApi.createPromotion(payload)
      toast.success(editItem ? 'Cập nhật thành công' : 'Tạo mã thành công')
      setModalOpen(false); load()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const handleDelete = async (p) => {
    if (!confirm(`Xóa mã "${p.code}"?`)) return
    try { await adminApi.deletePromotion(p.id); toast.success('Đã xóa'); load() }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">Quản lý Khuyến mãi</h1>
          <p className="text-dark-400 text-xs font-bold mt-1 uppercase tracking-wider">Chiến dịch marketing và mã giảm giá</p>
        </div>
        <button 
          onClick={openAdd} 
          className="bg-primary-600 hover:bg-primary-500 text-white font-black text-[13px] px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          TẠO MÃ GIẢM GIÁ
        </button>
      </div>

      {/* Premium Table Area */}
      <div className="bg-black/20 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5">
                {['Mã / Mô tả', 'Loại giảm', 'Giá trị', 'Thời hạn', 'Lượt dùng', 'Trạng thái', ''].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[10px] font-black text-dark-400 uppercase tracking-[0.2em] border-b border-white/5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-20 text-dark-500 font-black text-xs uppercase tracking-widest animate-pulse">Đang nạp dữ liệu khuyến mãi...</td></tr>
              ) : promos.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-20 text-dark-500 font-black text-xs uppercase tracking-widest">Không có mã giảm giá nào</td></tr>
              ) : (
                promos.map((p, idx) => (
                  <motion.tr 
                    key={p.id} 
                    className="hover:bg-white/[0.02] transition-colors group"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-primary-400 font-black font-mono tracking-tighter text-sm mb-0.5 group-hover:scale-105 origin-left transition-transform">{p.code}</span>
                        <span className="text-dark-500 text-[10px] font-bold uppercase truncate max-w-[150px]">{p.description || 'Không có mô tả'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-dark-300 font-black text-[10px] uppercase tracking-widest">{p.discountType === 'PERCENTAGE' ? 'PHẦN TRĂM' : 'CỐ ĐỊNH'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-black text-xs tracking-tight">
                        {p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `${p.discountValue.toLocaleString()}đ`}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-400 text-[10px] font-bold">
                      <div className="flex items-center gap-1.5 mb-1 text-white/80">
                        <svg className="w-3 h-3 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {formatDate(p.startDate)}
                      </div>
                      <div className="pl-4.5 opacity-50">đến {formatDate(p.endDate)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[60px]">
                           <div className="h-full bg-primary-500 rounded-full" style={{ width: p.usageLimit ? `${(p.usedCount / p.usageLimit) * 100}%` : '0%' }}></div>
                        </div>
                        <span className="text-white font-black text-[10px] tracking-widest">{p.usedCount}/{p.usageLimit || '∞'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm ${p.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-dark-800 text-dark-500 border-white/5 opacity-50'}`}>
                        {p.isActive ? 'ACTIVE' : 'TẠM TẮT'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-dark-300 hover:text-white flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L12 21.232H8.5V17.732L17.586 8.314z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(p)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-900/20 border border-white/5 text-dark-300 hover:text-rose-400 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-end pt-2">
         <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'CẬP NHẬT CHIẾN DỊCH' : 'TỔ CHỨC KHUYẾN MÃI MỚI'} size="md">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Mã giảm giá (Code) *</label>
            <input required className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-primary-400 font-mono font-black uppercase tracking-widest focus:border-primary-500 outline-none" value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              disabled={!!editItem} placeholder="CGVPROMO100" />
          </div>
          <div>
            <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Mô tả ngắn</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary-500 outline-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Hình thức giảm</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary-500 outline-none appearance-none cursor-pointer" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                <option value="PERCENTAGE" className="bg-dark-900">Phần trăm (%)</option>
                <option value="FIXED" className="bg-dark-900">Tiền cố định (VND)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Giá trị giảm *</label>
              <input required type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-black focus:border-primary-500 outline-none" value={form.discountValue}
                onChange={e => setForm({ ...form, discountValue: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <label className="text-[9px] font-black text-dark-400 uppercase tracking-widest mb-1.5 block">Đơn tối thiểu (đ)</label>
              <input type="number" min="0" className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary-500" value={form.minOrderAmount}
                onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} />
            </div>
            <div>
              <label className="text-[9px] font-black text-dark-400 uppercase tracking-widest mb-1.5 block">Giảm tối đa (đ)</label>
              <input type="number" min="0" className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary-500" value={form.maxDiscountAmount}
                onChange={e => setForm({ ...form, maxDiscountAmount: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Ngày bắt đầu *</label>
              <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-primary-500 [color-scheme:dark]" value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Ngày kết thúc *</label>
              <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-primary-500 [color-scheme:dark]" value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
            <div className="flex-1">
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-1.5 block">Tổng lượt phát hành</label>
              <input type="number" min="0" className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary-500" placeholder="Để trống nếu vô hạn" value={form.usageLimit}
                onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
            </div>
            <div className="flex items-center gap-3 pl-6 mt-5">
              <input type="checkbox" id="isActive" checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-5 h-5 accent-primary-600 cursor-pointer" />
              <label htmlFor="isActive" className="text-white text-[10px] font-black uppercase tracking-widest cursor-pointer">Kích hoạt ngay</label>
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black text-xs py-4 rounded-2xl shadow-xl shadow-primary-900/20 transition-all active:scale-95 uppercase tracking-[0.2em]">
            {saving ? 'Đang Lưu...' : 'XÁC NHẬN PHÁT HÀNH'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
