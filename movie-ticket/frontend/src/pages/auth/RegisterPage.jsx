import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import { getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' })
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="card p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/30 mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Đăng ký</h1>
            <p className="text-dark-400 mt-1 text-sm">Tạo tài khoản để đặt vé dễ dàng hơn</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Họ và tên</label>
              <input type="text" required placeholder="Nguyễn Văn A" className="input-field" value={form.fullName} onChange={change('fullName')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" required placeholder="your@email.com" className="input-field" value={form.email} onChange={change('email')} />
            </div>
            <div>
              <label className="label">Số điện thoại</label>
              <input type="tel" placeholder="0901234567" className="input-field" value={form.phone} onChange={change('phone')} />
            </div>
            <div>
              <label className="label">Mật khẩu</label>
              <input type="password" required placeholder="Tối thiểu 8 ký tự" className="input-field" minLength={8} value={form.password} onChange={change('password')} />
            </div>
            <div>
              <label className="label">Xác nhận mật khẩu</label>
              <input type="password" required placeholder="Nhập lại mật khẩu" className="input-field" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="text-center mt-6 text-dark-400 text-sm">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
