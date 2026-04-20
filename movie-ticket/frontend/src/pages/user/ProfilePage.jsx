import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { userApi } from '../../api/userApi'
import { authApi } from '../../api/authApi'
import { updateUser } from '../../store/slices/authSlice'
import { getErrorMessage } from '../../utils/helpers'
import { fadeUp, easeOut } from '../../utils/motion'
import { toast } from 'react-toastify'

const ROLE_LABELS = { CUSTOMER: 'Khách hàng', STAFF: 'Nhân viên', ADMIN: 'Quản trị viên' }
const ROLE_COLORS = {
  CUSTOMER: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
  STAFF: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ADMIN: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
}

const EyeIcon = ({ open }) => open ? (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

export default function ProfilePage() {
  const { user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const [form, setForm] = useState({ fullName: '', phone: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPw, setShowPw] = useState({ currentPassword: false, newPassword: false, confirmPassword: false })

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

  const togglePw = (field) => setShowPw(prev => ({ ...prev, [field]: !prev[field] }))

  const tabs = [
    { v: 'profile', l: 'Thông tin' },
    { v: 'password', l: 'Đổi mật khẩu' },
  ]

  const pwFields = [
    { field: 'currentPassword', label: 'Mật khẩu hiện tại' },
    { field: 'newPassword', label: 'Mật khẩu mới' },
    { field: 'confirmPassword', label: 'Xác nhận mật khẩu mới' },
  ]

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Orb backgrounds */}
      <motion.div
        className="pointer-events-none fixed top-[-10%] left-[-8%] w-[480px] h-[480px] rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', zIndex: 0 }}
        animate={{ x: [0, 18, 0], y: [0, -14, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none fixed bottom-[-12%] right-[-6%] w-[520px] h-[520px] rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', zIndex: 0 }}
        animate={{ x: [0, -16, 0], y: [0, 12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-xl mx-auto px-4">
        {/* Header */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={easeOut}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary-500/15 border border-primary-500/25 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Tài khoản</h1>
          </div>
          <p className="text-dark-400 text-sm ml-11">Quản lý thông tin cá nhân của bạn</p>
        </motion.div>

        {/* Avatar card */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.06 }}
          className="rounded-2xl border border-dark-700/60 mb-6 overflow-hidden"
          style={{ background: 'rgba(10,15,30,0.65)', backdropFilter: 'blur(16px)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}
        >
          <div className="p-5 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {user?.fullName?.[0]?.toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-dark-900" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-lg leading-tight truncate">{user?.fullName}</div>
              <div className="text-dark-400 text-sm truncate">{user?.email}</div>
              <span className={`mt-1.5 inline-block border text-xs px-2.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[user?.role] || ROLE_COLORS.CUSTOMER}`}>
                {ROLE_LABELS[user?.role] || user?.role}
              </span>
            </div>
            <Link
              to="/bookings"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Lịch sử đặt vé
            </Link>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ ...easeOut, delay: 0.1 }}
          className="relative flex gap-1 bg-dark-900 rounded-xl p-1 border border-dark-700/60 mb-5"
        >
          {tabs.map(t => (
            <button
              key={t.v}
              onClick={() => setActiveTab(t.v)}
              className="relative flex-1 py-2 rounded-lg text-sm font-medium transition-colors z-10"
              style={{ color: activeTab === t.v ? '#fff' : '#94a3b8' }}
            >
              {activeTab === t.v && (
                <motion.div
                  layoutId="profile-tab"
                  className="absolute inset-0 bg-primary-600 rounded-lg"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {t.l}
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            <motion.div
              key="profile"
              variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -6 }}
              transition={easeOut}
              className="rounded-2xl border border-dark-700/60 overflow-hidden"
              style={{ background: 'rgba(10,15,30,0.65)', backdropFilter: 'blur(16px)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}
            >
              <div className="p-6">
                <h2 className="text-base font-semibold text-white mb-5">Thông tin cá nhân</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="label">Họ và tên</label>
                    <input
                      type="text" required className="input-field"
                      value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <div className="relative">
                      <input
                        type="email" className="input-field opacity-50 cursor-not-allowed pr-9"
                        value={user?.email || ''} disabled
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-dark-500 text-xs mt-1.5">Email không thể thay đổi</p>
                  </div>
                  <div>
                    <label className="label">Số điện thoại</label>
                    <input
                      type="tel" className="input-field"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                    {saving ? (
                      <>
                        <motion.div
                          className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        Đang lưu...
                      </>
                    ) : 'Lưu thay đổi'}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="password"
              variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -6 }}
              transition={easeOut}
              className="rounded-2xl border border-dark-700/60 overflow-hidden"
              style={{ background: 'rgba(10,15,30,0.65)', backdropFilter: 'blur(16px)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}
            >
              <div className="p-6">
                <h2 className="text-base font-semibold text-white mb-5">Đổi mật khẩu</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {pwFields.map(({ field, label }) => (
                    <div key={field}>
                      <label className="label">{label}</label>
                      <div className="relative">
                        <input
                          type={showPw[field] ? 'text' : 'password'}
                          required minLength={8}
                          className="input-field pr-10"
                          value={pwForm[field]}
                          onChange={e => setPwForm({ ...pwForm, [field]: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => togglePw(field)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                          tabIndex={-1}
                        >
                          <EyeIcon open={showPw[field]} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-xl border border-dark-700/60 bg-dark-800/40 p-3 flex gap-2.5">
                    <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-dark-400 text-xs leading-relaxed">Mật khẩu mới phải có ít nhất 8 ký tự. Sau khi đổi bạn sẽ cần đăng nhập lại.</p>
                  </div>

                  <button type="submit" disabled={pwSaving} className="btn-primary w-full flex items-center justify-center gap-2">
                    {pwSaving ? (
                      <>
                        <motion.div
                          className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        Đang đổi...
                      </>
                    ) : 'Đổi mật khẩu'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
