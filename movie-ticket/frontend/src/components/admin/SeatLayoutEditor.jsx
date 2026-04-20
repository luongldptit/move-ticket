import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { cinemaApi } from '../../api/cinemaApi'
import { formatPrice } from '../../utils/helpers'
import { spring, easeOut } from '../../utils/motion'

export default function SeatLayoutEditor({ room, onClose, onSave }) {
  const [rows, setRows] = useState([])
  const [config, setConfig] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const containerRef = useRef(null)
useEffect(() => {
  cinemaApi.getRoomSeats(room.id).then(res => {
    const data = res.data.data
    setRows(data.rows || [])

    // Khởi tạo config với default nếu phòng cũ chưa có
    let initialConfig = {
      screen: { rotateX: -15, scale: 1, mb: 16, offsetX: 0, offsetY: 0 },
      hall: { rotateX: 38, staggerZ: 45, staggerY: -12 }
    }

    if (data.config) {
      try { 
        const parsed = JSON.parse(data.config)
        initialConfig = { ...initialConfig, ...parsed }
      } catch(e) { console.error("Parse config error", e) }
    }
    setConfig(initialConfig)
  }).finally(() => setLoading(false))
}, [room.id])

const handleDragEnd = (seatId, e, info) => {
  // Di chuyển 1:1 theo pixel để chính xác nhất
  const dx = info.offset.x
  const dy = info.offset.y

  setRows(prev => prev.map(row => ({
    ...row,
    seats: row.seats.map(s => s.id === seatId ? {
      ...s,
      offsetX: (s.offsetX || 0) + dx,
      offsetY: (s.offsetY || 0) + dy
    } : s)
  })))
}

const handleScreenDrag = (e, info) => {
  const dx = info.offset.x
  const dy = info.offset.y
  setConfig(prev => ({
    ...prev,
    screen: {
      ...(prev.screen || {}),
      offsetX: (prev.screen?.offsetX || 0) + dx,
      offsetY: (prev.screen?.offsetY || 0) + dy
    }
  }))
}

  const handleSave = async () => {
    setSaving(true)
    try {
      // 1. Save room config (bao gồm cả các trường bắt buộc để thỏa mãn validation của BE)
      await cinemaApi.updateRoom(room.id, { 
        config: JSON.stringify(config),
        name: room.name,
        cinemaId: room.cinema?.id || room.cinemaId,
        type: room.type,
        isActive: room.isActive
      })
      
      // 2. Save all seat offsets
      const seatUpdates = rows.flatMap(r => r.seats.map(s => ({
        id: s.id,
        offsetX: s.offsetX,
        offsetY: s.offsetY,
        offsetZ: s.offsetZ
      })))
      await cinemaApi.updateSeatsBatch(seatUpdates)
      
      toast.success('Lưu sơ đồ rạp thành công!')
      onSave()
      onClose()
    } catch (err) {
      toast.error('Lỗi khi lưu sơ đồ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-20 text-center text-white font-black">ĐANG TẢI DỮ LIỆU...</div>

  return (
    <div className="fixed inset-0 z-[100] bg-dark-950 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 border-b border-white/10 bg-dark-900 flex justify-between items-center">
        <div>
          <h2 className="text-white font-black uppercase tracking-widest">Trình biên tập sơ đồ: {room.name}</h2>
          <p className="text-[10px] text-dark-400 font-bold uppercase mt-1">Kéo thả ghế hoặc màn hình để thay đổi vị trí 3D</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-dark-300 font-black text-xs hover:bg-white/5 transition-all">HỦY BỎ</button>
          <button onClick={handleSave} disabled={saving} className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-2 rounded-xl font-black text-xs transition-all shadow-lg active:scale-95 disabled:opacity-50">
            {saving ? 'ĐANG LƯU...' : 'LƯU SƠ ĐỒ'}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div ref={containerRef} className="flex-1 relative bg-[#020617] overflow-auto flex items-center justify-center p-20 cursor-grab active:cursor-grabbing">
        <div style={{ perspective: '2000px' }} className="w-full max-w-5xl">
          
          {/* Screen Handle */}
          <motion.div 
            drag dragMomentum={false} onDragEnd={handleScreenDrag}
            className="mb-32 relative cursor-move group"
            style={{
              x: config.screen?.offsetX || 0,
              y: config.screen?.offsetY || 0
            }}
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary-600 text-[8px] font-black text-white px-2 py-1 rounded-md whitespace-nowrap">
              KÉO ĐỂ DI CHUYỂN MÀN HÌNH
            </div>
            <div 
              className="w-full h-12 bg-white/10 border-t-2 border-white/30 rounded-[50%_50%_0_0/100%_100%_0_0] shadow-[0_-20px_100px_rgba(244,63,94,0.3)] flex items-center justify-center"
              style={{ transform: `rotateX(${config.screen?.rotateX || -15}deg) scale(${config.screen?.scale || 1})` }}
            >
              <span className="text-white/20 text-[10px] font-black tracking-[1em]">IMAX SCREEN</span>
            </div>
          </motion.div>

          {/* Seats Hall */}
          <motion.div 
            style={{ 
              rotateX: config.hall?.rotateX || 38,
              transformStyle: 'preserve-3d'
            }}
            className="flex flex-col gap-8 items-center origin-bottom"
          >
            {rows.map((row, rowIndex) => (
              <div 
                key={row.rowLabel} 
                className="flex items-center gap-10"
                style={{ transform: `translateZ(${rowIndex * (config.hall?.staggerZ || 45)}px) translateY(${rowIndex * (config.hall?.staggerY || -12)}px)` }}
              >
                <div className="flex gap-4">
                  {row.seats.map(seat => (
                    <motion.div
                      key={seat.id}
                      drag dragMomentum={false}
                      onDragEnd={(e, info) => handleDragEnd(seat.id, e, info)}
                      style={{ 
                        x: seat.offsetX || 0, 
                        y: seat.offsetY || 0,
                        width: seat.type === 'COUPLE' ? 60 : 36, height: 36,
                      }}
                      className={`relative flex items-center justify-center text-[9px] font-black rounded-t-xl rounded-b-md border-2 cursor-move shadow-lg
                        ${seat.type === 'VIP' ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 
                          seat.type === 'COUPLE' ? 'bg-pink-600/20 border-pink-500 text-pink-300' : 
                          'bg-white/5 border-white/20 text-white/40'}`}
                    >
                      {seat.seatCode}
                      <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 text-[6px] text-white/20 whitespace-nowrap">
                        {Math.round(seat.offsetX || 0)},{Math.round(seat.offsetY || 0)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer / Instructions */}
      <div className="p-4 bg-dark-900 border-t border-white/10 text-center">
         <div className="flex justify-center gap-10 text-[10px] font-black text-dark-500 uppercase tracking-widest">
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-white/20 rounded"></span> Tiêu chuẩn</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500/40 border border-purple-500 rounded"></span> VIP</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-pink-500/40 border border-pink-500 rounded"></span> Couple</div>
         </div>
      </div>
    </div>
  )
}
