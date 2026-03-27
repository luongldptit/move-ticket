import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { userApi } from '../../api/userApi'
import { authApi } from '../../api/authApi'
import { updateUser } from '../../store/slices/authSlice'
import { getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'

export default function ProfilePage() {
  const { user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const [form, setForm] = useState({ fullName: '', phone: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    userApi.getMe().then(r => {
      const u = r.data.data
      setForm({ fullName: u.fullName || '', phone: u.phone || '' })
    }).catch(console.error)
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await userApi.updateMe(form)
      dispatch(updateUser(res.data.data))
      toast.success('Cập nhật thông tin thành công')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp'); return
    }
    setPwSaving(true)
    try {
      await authApi.changePassword(pwForm)
      toast.success('Đổi mật khẩu thành công')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setPwSaving(false)
    }
  }

  const ROLE_LABELS = { CUSTOMER: 'Khách hàng', STAFF: 'Nhân viên', ADMIN: 'Quản trị viên' }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-xl mx-auto px-4">
        {/* Avatar card */}
        <div className="card p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {user?.fullName?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white font-bold text-lg">{user?.fullName}</div>
            <div className="text-dark-400 text-sm">{user?.email}</div>
            <span className="mt-1 inline-block bg-primary-500/20 text-primary-400 border border-primary-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-900 rounded-xl p-1 border border-dark-700 mb-6">
          {[{ v: 'profile', l: 'Thông tin' }, { v: 'password', l: 'Đổi mật khẩu' }].map(t => (
            <button key={t.v} onClick={() => setActiveTab(t.v)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.v ? 'bg-primary-600 text-white' : 'text-dark-300 hover:text-white'}`}
            >{t.l}</button>
          ))}
        </div>

        {activeTab === 'profile' ? (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Thông tin cá nhân</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="label">Họ và tên</label>
                <input type="text" required className="input-field" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field opacity-50 cursor-not-allowed" value={user?.email || ''} disabled />
              </div>
              <div>
                <label className="label">Số điện thoại</label>
                <input type="tel" className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        ) : (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Đổi mật khẩu</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { field: 'currentPassword', label: 'Mật khẩu hiện tại' },
                { field: 'newPassword', label: 'Mật khẩu mới' },
                { field: 'confirmPassword', label: 'Xác nhận mật khẩu mới' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="label">{label}</label>
                  <input type="password" required minLength={8} className="input-field"
                    value={pwForm[field]}
                    onChange={e => setPwForm({ ...pwForm, [field]: e.target.value })} />
                </div>
              ))}
              <button type="submit" disabled={pwSaving} className="btn-primary w-full">
                {pwSaving ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
