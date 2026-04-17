import { useState, useRef, useEffect } from 'react'
import { bookingApi } from '../../api/bookingApi'
import { BOOKING_STATUS, formatPrice, formatDateTime, getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'
import { Scanner } from '@yudiel/react-qr-scanner'
import { motion, AnimatePresence } from 'framer-motion'
import { modalBackdrop, modalPanel } from '../../utils/motion'
import jsQR from 'jsqr'

export default function VerifyTicketPage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const extractCode = (str) => {
    // Smart parsing: Extract booking code (MT...) if embedded in a larger string
    const match = str.match(/(MT\d+)/)
    return match ? match[1] : str
  }

  // Common function to decode QR from an image file/blob
  const decodeQRFromBlob = (blob) => {
    setLoading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d', { willReadFrequently: true })
        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0)
        
        try {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const codeResult = jsQR(imageData.data, imageData.width, imageData.height)

          if (codeResult) {
            const extracted = extractCode(codeResult.data)
            setCode(extracted)
            toast.success('Đã nhận diện mã QR thành công')
            // Auto verify
            bookingApi.verifyBooking(extracted)
              .then(res => setResult(res.data.data))
              .catch(err => toast.error(getErrorMessage(err)))
              .finally(() => setLoading(false))
          } else {
            setLoading(false)
            toast.error('Không tìm thấy mã QR trong ảnh này')
          }
        } catch (err) {
          setLoading(false)
          toast.error('Lỗi khi xử lý ảnh')
        }
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(blob)
  }

  // Handle Global Paste (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      const item = e.clipboardData.items[0]
      if (item?.type.includes('image')) {
        const blob = item.getAsFile()
        decodeQRFromBlob(blob)
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.includes('image')) {
      decodeQRFromBlob(file)
    } else if (file) {
      toast.warning('Vui lòng chỉ thả tệp hình ảnh')
    }
  }

  const handleVerify = async (e) => {
    if (e) e.preventDefault()
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

  const handleScan = async (scannedData) => {
    if (scannedData && scannedData.length > 0) {
      const rawValue = scannedData[0].rawValue || scannedData[0]
      const scannedCode = extractCode(rawValue)
      
      setCode(scannedCode)
      setShowScanner(false)
      // Automatically verify after scanning
      setLoading(true)
      setResult(null)
      try {
        const res = await bookingApi.verifyBooking(scannedCode)
        setResult(res.data.data)
        toast.success('Quét QR thành công')
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) decodeQRFromBlob(file)
  }

  const handleScanError = (error) => {
    console.error('Camera error:', error)
    if (!window.isSecureContext) {
      toast.error('Camera chỉ hoạt động trên HTTPS hoặc localhost (Secure Context)')
    } else {
      toast.error(`Lỗi Camera: ${error?.message || 'Vui lòng cấp quyền truy cập'}`)
    }
  }

  const handleCheckIn = async () => {
    if (!result) return
    setCheckingIn(true)
    try {
      await bookingApi.checkInBooking(result.bookingCode)
      toast.success('Đã đánh dấu vé là Đã Sử Dụng')
      // Update local state to reflect new status
      setResult(prev => ({ ...prev, status: 'COMPLETED' }))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCheckingIn(false)
    }
  }

  return (
    <div 
      className="min-h-screen pt-24 pb-16 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-primary-600/20 backdrop-blur-md border-4 border-dashed border-primary-500 m-4 rounded-3xl flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="bg-dark-900/80 p-8 rounded-full mb-4 shadow-2xl">
              <span className="text-6xl">📥</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Thả ảnh vào đây</h2>
            <p className="text-primary-200 mt-2">Hệ thống sẽ tự động quét mã QR</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-2">Xác nhận vé tại quầy</h1>
        <p className="text-dark-400 mb-6 font-medium">Nhập mã, Quét QR, Kéo-Thả hoặc Dán ảnh QR</p>

        <form onSubmit={handleVerify} className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Mã vé (MT...)..."
            className="input-field flex-1 font-mono text-lg"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
          />
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleImageUpload}
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className="btn-secondary px-4 text-xl hover:scale-110 active:scale-95 transition-transform" 
            title="Tải ảnh QR từ thư viện"
          >
            🖼️
          </button>
          <button 
            type="button" 
            onClick={() => setShowScanner(true)} 
            className="btn-secondary px-4 text-xl hover:scale-110 active:scale-95 transition-transform" 
            title="Quét QR"
          >
            📷
          </button>
          <button type="submit" disabled={loading} className="btn-primary px-5 font-bold">
            {loading ? '...' : 'TRA CỨU'}
          </button>
        </form>

        {result && (() => {
          const isConfirmed = result.status === 'CONFIRMED'
          const isCompleted = result.status === 'COMPLETED'
          const seatCodes = (result.seats || []).map(s => s.seatCode)
          const isShowtimeEnded = result.showtime?.endTime ? new Date(result.showtime.endTime) < new Date() : false

          let borderColor = 'border-red-500/50'
          let iconColor = 'text-red-400'
          let title = 'VÉ KHÔNG HỢP LỆ'
          let icon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>

          if (isCompleted) {
            borderColor = 'border-blue-500/50'
            iconColor = 'text-blue-400'
            title = 'VÉ ĐÃ SỬ DỤNG'
            icon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          } else if (isConfirmed) {
            if (isShowtimeEnded) {
              borderColor = 'border-orange-500/50'
              iconColor = 'text-orange-400'
              title = 'SUẤT CHIẾU ĐÃ KẾT THÚC (QUÁ HẠN)'
              icon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            } else {
              borderColor = 'border-green-500/50'
              iconColor = 'text-green-400'
              title = 'VÉ HỢP LỆ (SẴN SÀNG)'
              icon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }
          }

          return (
            <div className={`card overflow-hidden animate-slide-up border-2 bg-dark-900/50 backdrop-blur-sm ${borderColor}`}>
              <div className={`flex items-center gap-2 p-5 pb-3 ${iconColor}`}>
                {icon}
                <span className="font-bold text-lg">{title}</span>
              </div>

              <div className="px-5 pb-5 space-y-2 text-sm border-b border-dark-700/50">
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
                  <span className="text-white font-bold">{seatCodes.join(', ')}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-dark-700/50">
                  <span className="text-dark-400 font-medium">Trạng thái</span>
                  <span className={`badge-status ${(BOOKING_STATUS[result.status] || {}).color}`}>
                    {(BOOKING_STATUS[result.status] || {}).label || result.status}
                  </span>
                </div>
              </div>

              {isConfirmed && !isShowtimeEnded && (
                <div className="p-4 bg-dark-800/50">
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all font-bold"
                  >
                    {checkingIn && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {checkingIn ? 'Đang cập nhật...' : 'CHECK-IN (Sử dụng vé)'}
                  </button>
                </div>
              )}
            </div>
          )
        })()}
      </div>

      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              variants={modalBackdrop}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={() => setShowScanner(false)}
            />
            <motion.div
              className="relative w-full max-w-sm bg-dark-900 border border-dark-700 rounded-3xl overflow-hidden shadow-2xl z-10"
              variants={modalPanel}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-700">
                <h3 className="text-lg font-bold text-white">Quét mã QR Code</h3>
                <button
                  onClick={() => setShowScanner(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-dark-800 text-dark-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="bg-black relative aspect-square w-full">
                <Scanner 
                  onScan={handleScan}
                  onError={handleScanError}
                  components={{
                    audio: false,
                    onOff: false,
                    finder: true
                  }}
                  styles={{
                    container: { width: '100%', height: '100%' },
                  }}
                />
              </div>
              <div className="p-4 text-center text-sm text-dark-400">
                Căn chỉnh mã QR vào trong khung hình để quét
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

