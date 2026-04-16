import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import { PageLoader } from '../../components/common/Spinner'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../../utils/motion'

const EMPTY_FORM = { email: '', password: '', fullName: '', phone: '', role: 'CUSTOMER' }

export default function ManageUsersPage() {
  const [users, setUsers] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    adminApi.getUsers({ keyword: search, role: roleFilter || undefined, page, size: 15 })
      .then(r => { setUsers(r.data.data.content || []); setTotalPages(r.data.data.totalPages || 0) })
      .catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [page, search, roleFilter])

  const handleRoleChange = async (user, role) => {
    try {
      await adminApi.updateUserRole(user.id, role)
      toast.success('Đổi vai trò thành công')
      load()
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleToggleStatus = async (user) => {
    try {
      await adminApi.updateUserStatus(user.id, !user.isActive)
      toast.success(user.isActive ? 'Đã khóa tài khoản' : 'Đã mở tài khoản')
      load()
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminApi.createUser(form)
      toast.success('Tạo tài khoản thành công')
      setShowModal(false)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const ROLE_LABEL = { CUSTOMER: 'Khách hàng', STAFF: 'Nhân viên', ADMIN: 'Admin' }
  const ROLE_COLOR = { 
    CUSTOMER: 'bg-blue-500/10 text-blue-400 border-blue-500/20', 
    STAFF: 'bg-amber-500/10 text-amber-500 border-amber-500/20', 
    ADMIN: 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
  }

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">Quản lý Người dùng</h1>
          <p className="text-dark-400 text-xs font-bold mt-1 uppercase tracking-wider">Kiểm soát phân quyền và tài khoản hệ thống</p>
        </div>
        <button 
          onClick={() => { setForm(EMPTY_FORM); setShowModal(true) }} 
          className="bg-primary-600 hover:bg-primary-500 text-white font-black text-[13px] px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          THÊM THÀNH VIÊN
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Tìm theo email hoặc tên..." 
            className="w-full bg-dark-900 border border-white/10 rounded-xl px-11 py-2.5 text-xs text-white focus:border-primary-500 outline-none font-medium transition-all"
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(0) }} 
          />
        </div>
        <select 
          className="bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 outline-none cursor-pointer appearance-none min-w-[150px]" 
          value={roleFilter} 
          onChange={e => { setRoleFilter(e.target.value); setPage(0) }}
        >
          <option value="" className="text-dark-500">Tất cả vai trò</option>
          <option value="CUSTOMER">Khách hàng</option>
          <option value="STAFF">Nhân viên</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Premium Table Area */}
      <div className="bg-black/20 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                {['Thành viên', 'Phân quyền', 'Ngày tham gia', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-6 py-5 text-[10px] font-black text-dark-400 uppercase tracking-[0.2em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20 text-dark-500 font-black text-xs uppercase tracking-widest animate-pulse">Đang nạp danh sách thành viên...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 text-dark-500 font-black text-xs uppercase tracking-widest">Không có người dùng nào</td></tr>
              ) : (
                users.map((u, idx) => (
                  <motion.tr 
                    key={u.id} 
                    className="hover:bg-white/[0.02] transition-colors group"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-700/20 flex items-center justify-center text-sm font-black text-primary-400 border border-primary-500/20 shadow-lg group-hover:scale-110 transition-transform">
                          {u.fullName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-black text-sm uppercase tracking-tight group-hover:text-primary-400 transition-colors">{u.fullName}</div>
                          <div className="text-dark-500 text-[10px] font-bold truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u, e.target.value)}
                        className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-2 border-transparent transition-all outline-none cursor-pointer tracking-widest ${ROLE_COLOR[u.role] || 'bg-dark-800'} hover:border-white/20`}
                      >
                        {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k} className="bg-dark-900 border-none">{v.toUpperCase()}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-dark-300 font-bold text-[10px] tracking-widest">{formatDate(u.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm ${u.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-green-900/10' : 'bg-rose-500/10 text-rose-500 border-rose-500/20 opacity-50 grayscale'}`}>
                        {u.isActive ? 'ACTIVE' : 'BANNED'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(u)}
                        className={`text-[9px] font-black uppercase px-4 py-2 rounded-xl transition-all tracking-widest ${u.isActive ? 'bg-rose-900/20 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white' : 'bg-green-900/20 text-green-400 border border-green-500/20 hover:bg-green-500 hover:text-white'}`}>
                        {u.isActive ? 'Khóa Card' : 'Mở Khóa'}
                      </button>
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

      {/* Premium Create User Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="ĐĂNG KÝ THÀNH VIÊN MỚI" size="md">
        <form onSubmit={handleCreateUser} className="space-y-6">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Họ và tên đầy đủ *</label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary-500 outline-none"
                placeholder="Ví dụ: Lương Đình Lương"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Thư điện tử (Email) *</label>
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary-500 outline-none"
                  placeholder="admin@move.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Số điện thoại</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary-500 outline-none"
                  placeholder="0912xxxxxx"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Mật khẩu truy cập *</label>
              <input
                type="password"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary-500 outline-none"
                placeholder="Tối thiểu 6 ký tự bảo mật"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-3 block">Gán vai trò hệ thống</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(ROLE_LABEL).map(([k, v]) => (
                  <button 
                    type="button" 
                    key={k}
                    onClick={() => setForm(f => ({ ...f, role: k }))}
                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      form.role === k 
                        ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/40' 
                        : 'bg-white/5 border-white/5 text-dark-400 hover:text-white'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-dark-500 hover:text-white transition-all">HỦY BỎ</button>
            <button 
              type="submit" 
              disabled={saving} 
              className="flex-[2] bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary-900/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? 'Đang Thực Thi...' : 'XÁC NHẬN TẠO TÀI KHOẢN'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
