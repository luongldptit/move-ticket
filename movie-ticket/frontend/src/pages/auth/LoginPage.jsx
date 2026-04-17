import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { authApi } from '../../api/authApi'
import { setCredentials } from '../../store/slices/authSlice'
import { getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'

function Orb({ style }) {
  return (
    <motion.div
      style={style}
      animate={{ y: [0, -24, 10, 0], x: [0, 12, -8, 0], scale: [1, 1.05, 0.97, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login(form)
      const { accessToken, user } = res.data.data
      dispatch(setCredentials({ accessToken, user }))
      toast.success('Đăng nhập thành công!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
    { key: 'password', label: 'Mật khẩu', type: 'password', placeholder: '••••••••' },
  ]

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-[#0d0f1a] to-dark-950" />

      {/* Animated orbs */}
      <Orb style={{
        position: 'absolute', top: '8%', left: '10%',
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)',
        filter: 'blur(48px)', pointerEvents: 'none',
      }} />
      <Orb style={{
        position: 'absolute', bottom: '10%', right: '8%',
        width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.11) 0%, transparent 70%)',
        filter: 'blur(56px)', pointerEvents: 'none',
      }} />
      <Orb style={{
        position: 'absolute', top: '55%', left: '60%',
        width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
      />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(10, 15, 30, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.18)',
            backdropFilter: 'blur(28px)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03), 0 0 60px rgba(99,102,241,0.08)',
          }}
        >
          {/* Top shimmer line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/70 to-transparent" />

          <div className="p-8 sm:p-10">
            {/* Logo */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.45 }}
            >
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 rounded-2xl bg-primary-500/25 blur-xl scale-110" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/30 mx-auto">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                    <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Đăng nhập</h1>
              <p className="text-dark-400 mt-1 text-sm">Chào mừng bạn quay trở lại!</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map(({ key, label, type, placeholder }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                >
                  <label className="label">{label}</label>
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    className="input-field transition-all duration-200"
                    style={focused === key
                      ? { borderColor: 'rgba(99,102,241,0.6)', boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' }
                      : {}
                    }
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
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
                transition={{ delay: 0.38 }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.975 }}
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </motion.button>
            </form>

            <motion.p
              className="text-center mt-6 text-dark-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.48 }}
            >
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Đăng ký ngay
              </Link>
            </motion.p>
          </div>

          {/* Bottom shimmer */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
        </motion.div>

        {/* Film strip decoration */}
        <motion.div
          className="flex justify-center mt-6 gap-1.5 opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.6 }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-5 h-3.5 rounded-sm border border-dark-600 bg-dark-800/60" />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
