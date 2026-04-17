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
  const [showImageModal, setShowImageModal] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const extractCode = (str) => {
    const match = str.match(/(MT\d+)/)
    return match ? match[1] : str
  }

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
            setShowImageModal(false)
            
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

  // Global Paste handler
  useEffect(() => {
    const handlePaste = (e) => {
      // If modal is open, we handle it there visually, but the effect is the same
      const item = e.clipboardData.items[0]
      if (item?.type.includes('image')) {
        const blob = item.getAsFile()
        decodeQRFromBlob(blob)
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

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

  const handleCheckIn = async () => {
    if (!result) return
    setCheckingIn(true)
    try {
      await bookingApi.checkInBooking(result.bookingCode)
      toast.success('Đã đánh dấu vé là Đã Sử Dụng')
      setResult(prev => ({ ...prev, status: 'COMPLETED' }))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCheckingIn(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-lg mx-auto px-4 text-center">
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Xác nhận vé</h1>
        <p className="text-dark-400 mb-10 font-medium">Nhập mã hoặc chọn phương thức quét QR</p>

        {/* Action Buttons Bar */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setShowImageModal(true)}
            className="flex-1 bg-dark-800/80 hover:bg-dark-700 p-4 rounded-3xl border border-dark-600 transition-all group flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🖼️</div>
            <span className="text-xs font-bold text-dark-300 uppercase tracking-widest">Tải ảnh/Dán</span>
          </button>
          
          <button 
            onClick={() => setShowScanner(true)}
            className="flex-1 bg-primary-600/20 hover:bg-primary-600/30 p-4 rounded-3xl border border-primary-500/30 transition-all group flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform text-primary-400">📷</div>
            <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">Mở Camera</span>
          </button>
        </div>

        {/* Manual Input Container */}
        <div className="relative group mb-12">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-primary-400 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-focus-within:opacity-50"></div>
          <form onSubmit={handleVerify} className="relative bg-dark-900 rounded-2xl flex p-1 border border-dark-700">
            <input
              type="text"
              placeholder="Nhập mã vé (VD: MT123456...)"
              className="bg-transparent flex-1 px-5 py-4 text-white font-mono text-lg focus:outline-none placeholder:text-dark-600"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
            />
            <button 
              type="submit" 
              disabled={loading || !code}
              className="bg-white text-black px-8 py-4 rounded-xl font-black hover:bg-dark-200 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'TRA CỨU'}
            </button>
          </form>
        </div>

        {/* Result UI */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              layoutId="result-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`card overflow-hidden border-2 bg-dark-900/40 backdrop-blur-xl ${
                result.status === 'CONFIRMED' ? 'border-green-500/40' : 
                result.status === 'COMPLETED' ? 'border-blue-500/40' : 'border-red-500/40'
              }`}
            >
              <div className="p-6">
                {/* Visual Status Indicator */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      result.status === 'CONFIRMED' ? 'bg-green-500' : 
                      result.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    <span className="text-dark-300 font-bold uppercase tracking-widest text-xs">
                      {BOOKING_STATUS[result.status]?.label}
                    </span>
                  </div>
                  <button onClick={() => setResult(null)} className="text-dark-500 hover:text-white transition-colors">✕</button>
                </div>

                {/* Ticket Details */}
                <div className="text-left space-y-4">
                  <div>
                    <h2 className="text-2xl font-black text-white leading-tight mb-1">{result.showtime?.movieTitle}</h2>
                    <p className="text-primary-400 font-mono text-sm"># {result.bookingCode}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-dark-500 uppercase font-black tracking-tighter mb-1">Thời gian</p>
                      <p className="text-white font-bold text-sm tracking-tight">{formatDateTime(result.showtime?.startTime).split(' ')[0]}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-dark-500 uppercase font-black tracking-tighter mb-1">Dịch vụ</p>
                      <p className="text-white font-bold text-sm tracking-tight">Standard</p>
                    </div>
                  </div>

                  <div className="bg-dark-800/50 p-4 rounded-2xl border border-dark-700/50 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-dark-400 uppercase font-bold mb-1">Vị trí ghế</p>
                      <div className="flex gap-2">
                        {result.seats.map(s => (
                          <span key={s.seatCode} className="text-white font-black text-lg">{s.seatCode}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-dark-400 uppercase font-bold mb-1">Cần thanh toán</p>
                      <p className="text-white font-black text-lg">{formatPrice(result.finalAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {result.status === 'CONFIRMED' && (
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="w-full mt-6 py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-2xl shadow-xl shadow-green-500/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    {checkingIn ? 'ĐANG XỬ LÝ...' : (
                      <>
                        XÁC NHẬN SỬ DỤNG VÉ
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Camera Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-black/90 backdrop-blur-md" variants={modalBackdrop} initial="hidden" animate="show" exit="exit" onClick={() => setShowScanner(false)} />
            <motion.div className="relative w-full max-w-sm bg-dark-950 border border-dark-800 rounded-[2.5rem] overflow-hidden shadow-2xl z-10" variants={modalPanel} initial="hidden" animate="show" exit="exit">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-black text-white uppercase tracking-tighter">Máy quét mã QR</h3>
                <button onClick={() => setShowScanner(false)} className="w-10 h-10 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors">✕</button>
              </div>
              <div className="bg-black aspect-square">
                <Scanner onScan={handleScan} components={{ audio: false, finder: true }} styles={{ container: { width: '100%', height: '100%' } }} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Magic Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onPaste={(e) => {
            const item = e.clipboardData.items[0];
            if (item?.type.includes('image')) decodeQRFromBlob(item.getAsFile());
          }}>
            <motion.div className="absolute inset-0 bg-dark-950/95 backdrop-blur-xl" variants={modalBackdrop} initial="hidden" animate="show" exit="exit" onClick={() => setShowImageModal(false)} />
            <motion.div 
              className="relative w-full max-w-md bg-dark-900 border border-dark-700/50 rounded-[3rem] p-1 shadow-2xl z-10"
              variants={modalPanel} initial="hidden" animate="show" exit="exit"
            >
              <div className="bg-dark-950 p-8 rounded-[2.8rem] space-y-8 text-center">
                <button onClick={() => setShowImageModal(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 text-dark-400 hover:text-white transition-colors">✕</button>
                
                <div className="pt-4">
                  <h3 className="text-2xl font-black text-white mb-2">Xác thực ảnh</h3>
                  <p className="text-dark-500 text-sm">Kéo thả, dán hoặc tải ảnh mã QR lên</p>
                </div>

                <div 
                  className={`relative group h-64 border-4 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center gap-4 cursor-pointer mb-4 ${
                    isDragging ? 'border-primary-500 bg-primary-500/5' : 'border-dark-700 hover:border-dark-500 hover:bg-white/5'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file?.type.includes('image')) decodeQRFromBlob(file); }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) decodeQRFromBlob(file); }} />
                  
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl transition-all ${isDragging ? 'scale-110 bg-primary-500 rotate-12 shadow-2xl animate-bounce' : 'bg-dark-800'}`}>
                    {isDragging ? '📥' : '🖼️'}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-white font-black text-lg uppercase tracking-tight">Nhấn hoặc kéo ảnh</p>
                    <p className="text-dark-500 text-xs font-bold mt-1 tracking-widest uppercase">Hoặc nhấn Ctrl + V để dán</p>
                  </div>

                  {/* Corners effect */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-dark-600 rounded-tl-xl" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-dark-600 rounded-tr-xl" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-dark-600 rounded-bl-xl" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-dark-600 rounded-br-xl" />
                </div>

                <p className="text-dark-600 text-[10px] font-black uppercase tracking-widest pb-4">Định dạng hỗ trợ: JPG, PNG, WEBP</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

