import { useState } from 'react'
import { bookingApi } from '../../api/bookingApi'
import { BOOKING_STATUS, formatPrice, formatDateTime, getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'

export default function VerifyTicketPage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await bookingApi.verifyBooking(code.trim())
      setResult(res.data.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-2">Xác nhận vé tại quầy</h1>
        <p className="text-dark-400 mb-6">Nhập mã vé hoặc quét QR code để xác nhận</p>

        <form onSubmit={handleVerify} className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Nhập mã vé (VD: BK20260326001)..."
            className="input-field flex-1 font-mono"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
          />
          <button type="submit" disabled={loading} className="btn-primary px-5">
            {loading ? '...' : 'Tra cứu'}
          </button>
        </form>

        {result && (() => {
          const isValid = result.status === 'CONFIRMED'
          const seatCodes = (result.seats || []).map(s => s.seatCode)
          return (
            <div className={`card p-5 animate-slide-up border-2 ${isValid ? 'border-green-500/50' : 'border-red-500/50'}`}>
              <div className={`flex items-center gap-2 mb-4 ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                {isValid ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="font-semibold text-lg">{isValid ? 'VÉ HỢP LỆ' : 'VÉ KHÔNG HỢP LỆ'}</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Mã vé</span>
                  <span className="font-mono font-bold text-white">{result.bookingCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Khách hàng</span>
                  <span className="text-white">{result.user?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Phim</span>
                  <span className="text-white">{result.showtime?.movieTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Suất chiếu</span>
                  <span className="text-white">{formatDateTime(result.showtime?.startTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Rạp · Phòng</span>
                  <span className="text-white">{result.showtime?.cinemaName} · {result.showtime?.roomName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Ghế</span>
                  <span className="text-white">{seatCodes.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Trạng thái vé</span>
                  <span className={`badge-status ${(BOOKING_STATUS[result.status] || {}).color}`}>
                    {(BOOKING_STATUS[result.status] || {}).label || result.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Số tiền</span>
                  <span className="text-white">{formatPrice(result.finalAmount)}</span>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
