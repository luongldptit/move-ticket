import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../../api/authApi'
import { getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'

function Orb({ style }) {
  return (
    <motion.div
      style={style}
      animate={{ y: [0, -20, 8, 0], x: [0, -10, 14, 0], scale: [1, 1.04, 0.98, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' })
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== confirm) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    setLoading(true)
    try {
      await authApi.register(form)
      toast.success('Đăng ký thành công! Hãy đăng nhập.')
      navigate('/login')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const focusStyle = (key) =>
    focused === key
      ? { borderColor: 'rgba(168,85,247,0.6)', boxShadow: '0 0 0 3px rgba(168,85,247,0.12)' }
      : {}

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-[#0d0f1a] to-dark-950" />

      {/* Animated orbs */}
      <Orb style={{
        position: 'absolute', top: '5%', right: '12%',
        width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
        filter: 'blur(52px)', pointerEvents: 'none',
      }} />
      <Orb style={{
        position: 'absolute', bottom: '8%', left: '6%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        filter: 'blur(48px)', pointerEvents: 'none',
      }} />
      <Orb style={{
        position: 'absolute', top: '45%', left: '45%',
        width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Film strip top */}
        <motion.div
          className="flex justify-center mb-6 gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.6 }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-5 h-3.5 rounded-sm border border-dark-600 bg-dark-800/60" />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(10, 15, 30, 0.8)',
            border: '1px solid rgba(168, 85, 247, 0.18)',
            backdropFilter: 'blur(28px)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03), 0 0 60px rgba(168,85,247,0.07)',
          }}
        >
          {/* Top shimmer line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

          <div className="p-8 sm:p-10">
            {/* Logo */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.45 }}
            >
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-xl scale-110" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-primary-700 flex items-center justify-center shadow-xl shadow-purple-500/25 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Đăng ký</h1>
              <p className="text-dark-400 mt-1 text-sm">Tạo tài khoản để đặt vé dễ dàng hơn</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'fullName', label: 'Họ và tên', type: 'text', placeholder: 'Nguyễn Văn A', required: true },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
                { key: 'phone', label: 'Số điện thoại', type: 'tel', placeholder: '0901234567', required: false },
              ].map(({ key, label, type, placeholder, required }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + i * 0.07, duration: 0.4 }}
                >
                  <label className="label">{label}</label>
                  <input
                    type={type}
                    required={required}
                    placeholder={placeholder}
                    className="input-field transition-all duration-200"
                    style={focusStyle(key)}
                    value={form[key]}
                    onChange={change(key)}
                    onFocus={() => setFocused(key)}
                    onBlur={() => setFocused(null)}
                  />
                </motion.div>
              ))}

              {[
                { key: 'password', label: 'Mật khẩu', placeholder: 'Tối thiểu 8 ký tự', minLength: 8, value: form.password, onChange: change('password') },
                { key: 'confirm', label: 'Xác nhận mật khẩu', placeholder: 'Nhập lại mật khẩu', value: confirm, onChange: e => setConfirm(e.target.value) },
              ].map(({ key, label, placeholder, minLength, value, onChange }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.39 + i * 0.07, duration: 0.4 }}
                >
                  <label className="label">{label}</label>
                  <input
                    type="password"
                    required
                    placeholder={placeholder}
                    minLength={minLength}
                    className="input-field transition-all duration-200"
                    style={focusStyle(key)}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(key)}
                    onBlur={() => setFocused(null)}
                  />
                </motion.div>
              ))}

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.975 }}
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
              </motion.button>
            </form>

            <motion.p
              className="text-center mt-6 text-dark-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.62 }}
            >
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Đăng nhập
              </Link>
            </motion.p>
          </div>

          {/* Bottom shimmer */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  )
}
