import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import Pagination from '../../components/common/Pagination'
import { PageLoader } from '../../components/common/Spinner'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'

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
  const ROLE_COLOR = { CUSTOMER: 'bg-blue-500/20 text-blue-400', STAFF: 'bg-yellow-500/20 text-yellow-400', ADMIN: 'bg-red-500/20 text-red-400' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Người dùng</h1>
        <button onClick={() => { setForm(EMPTY_FORM); setShowModal(true) }} className="btn-primary">
          + Thêm người dùng
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Tìm email hoặc tên..." className="input-field max-w-xs"
          value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
        <select className="input-field w-auto" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(0) }}>
          <option value="">Tất cả vai trò</option>
          <option value="CUSTOMER">Khách hàng</option>
          <option value="STAFF">Nhân viên</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-800 border-b border-dark-700">
              <tr>
                {['Người dùng', 'Vai trò', 'Ngày tạo', 'Trạng thái', 'Hành động'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-dark-300 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-dark-400">Đang tải...</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-dark-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {u.fullName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{u.fullName}</div>
                        <div className="text-dark-400 text-xs">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-lg border-0 bg-transparent font-medium cursor-pointer ${ROLE_COLOR[u.role]}`}
                    >
                      {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-dark-400">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge-status ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-dark-500/20 text-dark-400'}`}>
                      {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleStatus(u)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${u.isActive ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' : 'bg-green-900/40 text-green-400 hover:bg-green-900/60'}`}>
                      {u.isActive ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Thêm người dùng</h2>
              <button onClick={() => setShowModal(false)} className="text-dark-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-dark-300 text-sm mb-1">Họ tên *</label>
                <input
                  type="text"
                  className="input-field w-full"
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-dark-300 text-sm mb-1">Email *</label>
                <input
                  type="email"
                  className="input-field w-full"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-dark-300 text-sm mb-1">Mật khẩu *</label>
                <input
                  type="password"
                  className="input-field w-full"
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-dark-300 text-sm mb-1">Số điện thoại</label>
                <input
                  type="text"
                  className="input-field w-full"
                  placeholder="0901234567"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-dark-300 text-sm mb-1">Vai trò</label>
                <select
                  className="input-field w-full"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="CUSTOMER">Khách hàng</option>
                  <option value="STAFF">Nhân viên</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
