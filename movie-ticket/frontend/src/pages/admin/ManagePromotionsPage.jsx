import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Khuyến mãi</h1>
        <button onClick={openAdd} className="btn-primary">+ Tạo mã</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-800 border-b border-dark-700">
              <tr>
                {['Mã', 'Loại giảm', 'Giá trị', 'Hiệu lực', 'Sử dụng', 'Trạng thái', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-dark-300 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-dark-400">Đang tải...</td></tr>
              ) : promos.map(p => (
                <tr key={p.id} className="hover:bg-dark-800/50">
                  <td className="px-4 py-3 font-mono text-primary-400 font-semibold">{p.code}</td>
                  <td className="px-4 py-3 text-dark-300">{p.discountType === 'PERCENTAGE' ? '%' : 'Cố định'}</td>
                  <td className="px-4 py-3 text-white">{p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `${p.discountValue.toLocaleString()}đ`}</td>
                  <td className="px-4 py-3 text-dark-400 text-xs">{formatDate(p.startDate)} → {formatDate(p.endDate)}</td>
                  <td className="px-4 py-3 text-dark-300">{p.usedCount}/{p.usageLimit || '∞'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge-status ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-dark-500/20 text-dark-400'}`}>
                      {p.isActive ? 'Kích hoạt' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs bg-dark-700 hover:bg-dark-600 text-white px-3 py-1.5 rounded-lg">Sửa</button>
                      <button onClick={() => handleDelete(p)} className="text-xs bg-red-900/40 hover:bg-red-900/60 text-red-400 px-3 py-1.5 rounded-lg">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Sửa khuyến mãi' : 'Tạo mã khuyến mãi'} size="md">
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="label">Mã khuyến mãi *</label>
            <input required className="input-field font-mono uppercase" value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              disabled={!!editItem} placeholder="SUMMER20" />
          </div>
          <div>
            <label className="label">Mô tả</label>
            <input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Loại giảm</label>
              <select className="input-field" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định</option>
              </select>
            </div>
            <div>
              <label className="label">Giá trị *</label>
              <input required type="number" min="0" className="input-field" value={form.discountValue}
                onChange={e => setForm({ ...form, discountValue: e.target.value })} />
            </div>
            <div>
              <label className="label">Đơn tối thiểu (đ)</label>
              <input type="number" min="0" className="input-field" value={form.minOrderAmount}
                onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} />
            </div>
            <div>
              <label className="label">Giảm tối đa (đ)</label>
              <input type="number" min="0" className="input-field" value={form.maxDiscountAmount}
                onChange={e => setForm({ ...form, maxDiscountAmount: e.target.value })} />
            </div>
            <div>
              <label className="label">Ngày bắt đầu *</label>
              <input required type="date" className="input-field" value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Ngày kết thúc *</label>
              <input required type="date" className="input-field" value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Giới hạn dùng</label>
              <input type="number" min="0" className="input-field" placeholder="Không giới hạn" value={form.usageLimit}
                onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="isActive" checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-primary-500" />
              <label htmlFor="isActive" className="text-dark-300 text-sm">Kích hoạt ngay</label>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full mt-1">
            {saving ? 'Đang lưu...' : (editItem ? 'Cập nhật' : 'Tạo mã')}
          </button>
        </form>
      </Modal>
    </div>
  )
}
