import { useState, useEffect } from 'react'
import { cinemaApi } from '../../api/cinemaApi'
import Modal from '../../components/common/Modal'
import SeatLayoutEditor from '../../components/admin/SeatLayoutEditor'
import { getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, fadeIn, staggerContainer, staggerItem, spring, easeOut } from '../../utils/motion'

export default function ManageCinemasPage() {
  const [cinemas, setCinemas] = useState([])
  const [rooms, setRooms] = useState([])
  const [selectedCinema, setSelectedCinema] = useState(null)
  const [tab, setTab] = useState('cinemas')
  const [loading, setLoading] = useState(true)

  // Visual layout editor
  const [visualEditorRoom, setVisualEditorRoom] = useState(null)

  // Cinema form
  const [cinemaModal, setCinemaModal] = useState(false)
  const [editCinema, setEditCinema] = useState(null)
  const [cinemaForm, setCinemaForm] = useState({ name: '', address: '', phone: '' })

  // Room form
  const [roomModal, setRoomModal] = useState(false)
  const [editRoom, setEditRoom] = useState(null)
  const [roomForm, setRoomForm] = useState({ cinemaId: '', name: '', type: '2D', totalSeats: '', config: '' })

  // Seat batch form
  const [seatModal, setSeatModal] = useState(false)
  const [seatRoom, setSeatRoom] = useState(null)
  const [seatConfig, setSeatConfig] = useState([{ rowLabel: 'A', seatCount: 10, type: 'STANDARD' }])

  // Seat view/edit
  const [seatViewModal, setSeatViewModal] = useState(false)
  const [seatViewRoom, setSeatViewRoom] = useState(null)
  const [seatRows, setSeatRows] = useState([])
  const [savingSeatId, setSavingSeatId] = useState(null)

  const loadCinemas = () => {
    setLoading(true)
    cinemaApi.getCinemas().then(r => setCinemas(r.data.data || [])).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(loadCinemas, [])

  const loadRooms = (cinId) => {
    setSelectedCinema(cinemas.find(c => c.id === cinId))
    cinemaApi.getCinemaRooms(cinId).then(r => setRooms(r.data.data || [])).catch(() => setRooms([]))
    setTab('rooms')
  }

  const loadAllRooms = () => {
    setLoading(true)
    cinemaApi.getAllRooms().then(r => setRooms(r.data.data || [])).catch(() => setRooms([])).finally(() => setLoading(false))
  }

  const reloadRooms = () => {
    if (selectedCinema) {
      cinemaApi.getCinemaRooms(selectedCinema.id).then(r => setRooms(r.data.data || []))
    } else {
      loadAllRooms()
    }
  }

  const handleSaveCinema = async (e) => {
    e.preventDefault()
    try {
      if (editCinema) await cinemaApi.updateCinema(editCinema.id, cinemaForm)
      else await cinemaApi.createCinema(cinemaForm)
      toast.success('Lưu rạp thành công')
      setCinemaModal(false); loadCinemas()
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleSaveRoom = async (e) => {
    e.preventDefault()
    try {
      const data = { ...roomForm, cinemaId: parseInt(roomForm.cinemaId), totalSeats: parseInt(roomForm.totalSeats) || 0 }
      if (editRoom) await cinemaApi.updateRoom(editRoom.id, data)
      else await cinemaApi.createRoom(data)
      toast.success('Lưu phòng thành công')
      setRoomModal(false)
      reloadRooms()
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleCreateSeats = async () => {
    try {
      const result = await cinemaApi.createSeats({ roomId: seatRoom.id, rows: seatConfig.map(r => ({ ...r, seatCount: parseInt(r.seatCount) })) })
      const count = result.data?.data ?? 0
      toast.success(`Tạo ${count} ghế thành công!`)
      setSeatModal(false)
      reloadRooms()
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleViewSeats = async (room) => {
    setSeatViewRoom(room)
    setSeatRows([])
    setSeatViewModal(true)
    try {
      const res = await cinemaApi.getRoomSeats(room.id)
      setSeatRows(res.data.data?.rows || [])
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleUpdateSeat = async (seatId, field, value) => {
    setSavingSeatId(seatId)
    try {
      await cinemaApi.updateSeat(seatId, { [field]: value })
      setSeatRows(prev => prev.map(row => ({
        ...row,
        seats: row.seats.map(s => s.id === seatId ? { ...s, [field]: value } : s)
      })))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSavingSeatId(null)
    }
  }

  const addRow = () => setSeatConfig([...seatConfig, { rowLabel: String.fromCharCode(65 + seatConfig.length), seatCount: 10, type: 'STANDARD' }])
  const removeRow = (i) => setSeatConfig(seatConfig.filter((_, idx) => idx !== i))
  const updateRow = (i, field, val) => setSeatConfig(seatConfig.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  const SEAT_TYPE_COLORS = {
    STANDARD: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    VIP:      'bg-purple-500/10 text-purple-400 border-purple-500/20',
    COUPLE:   'bg-pink-500/10 text-pink-400 border-pink-500/20',
  }

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">Quản lý Rạp & Phòng</h1>
          <p className="text-dark-400 text-xs font-bold mt-1 uppercase tracking-wider">Thiết lập hạ tầng rạp và sơ đồ chỗ ngồi</p>
        </div>
        <div className="flex gap-2">
          {tab === 'cinemas' && (
            <button 
              onClick={() => { setEditCinema(null); setCinemaForm({ name: '', address: '', phone: '' }); setCinemaModal(true) }} 
              className="bg-primary-600 hover:bg-primary-500 text-white font-black text-[13px] px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              THÊM CỤM RẠP
            </button>
          )}
          {tab === 'rooms' && (
            <button 
              onClick={() => { setRoomForm({ cinemaId: selectedCinema?.id || '', name: '', type: '2D', totalSeats: '' }); setRoomModal(true) }} 
              className="bg-primary-600 hover:bg-primary-500 text-white font-black text-[13px] px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              THÊM PHÒNG CHIẾU
            </button>
          )}
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex gap-1.5 p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit backdrop-blur-md">
        {[
          { v: 'cinemas', l: 'DANH SÁCH RẠP', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
          { v: 'rooms', l: `PHÒNG CHIẾU${selectedCinema ? ` · ${selectedCinema.name}` : ''}`, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' }
        ].map(t => (
          <button 
            key={t.v} 
            onClick={() => { setTab(t.v); if (t.v === 'rooms' && !selectedCinema) loadAllRooms() }}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[11px] font-black transition-all duration-300 ${
              tab === t.v 
                ? 'bg-white/10 text-white shadow-inner border border-white/10' 
                : 'text-dark-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={t.icon} /></svg>
            {t.l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'cinemas' ? (
          <motion.div 
            key="cinemas"
            variants={staggerContainer(0.05, 0)} initial="hidden" animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? <div className="text-dark-500 font-bold uppercase tracking-widest text-xs py-10">Đang đồng bộ...</div> : cinemas.map(c => (
              <motion.div key={c.id} variants={staggerItem} className="bg-white/5 border border-white/5 rounded-[2rem] p-6 hover:bg-white/[0.08] transition-all group shadow-xl">
                <div className="flex items-start justify-between mb-5">
                  <div className="p-3 bg-primary-600/10 text-primary-400 rounded-2xl ring-1 ring-primary-500/20">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${c.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-sm shadow-green-900/10' : 'bg-dark-800 text-dark-400 border-white/5 opacity-50'}`}>
                    {c.isActive ? 'BẬT / ACTIVE' : 'TẠM TẮT'}
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight truncate">{c.name}</h3>
                <p className="text-dark-400 text-xs font-medium mt-1 line-clamp-2 min-h-[32px]">{c.address}</p>
                {c.phone && <div className="text-dark-500 text-[10px] font-bold mt-2 tracking-widest uppercase">📞 {c.phone}</div>}
                
                <div className="mt-8 flex gap-3 pt-4 border-t border-white/5">
                  <button onClick={() => loadRooms(c.id)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Phòng chiếu</button>
                  <button onClick={() => { setEditCinema(c); setCinemaForm({ name: c.name, address: c.address, phone: c.phone || '' }); setCinemaModal(true) }}
                    className="px-4 bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white py-2.5 rounded-xl transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L12 21.232H8.5V17.732L17.586 8.314z" /></svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="rooms"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {loading ? <div className="text-dark-500 font-bold uppercase tracking-widest text-xs py-10 text-center">Đang nạp dữ liệu hạ tầng...</div> : 
             rooms.length === 0 ? <div className="text-dark-400 text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl font-black uppercase text-xs tracking-[0.2em]">Khu vực này chưa thiết lập phòng chiếu</div> :
             rooms.map((r, idx) => (
              <motion.div 
                key={r.id} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="bg-white/5 border border-white/5 rounded-3xl p-5 flex items-center justify-between group hover:bg-white/[0.08] transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-dark-900 flex items-center justify-center text-primary-400 font-black border border-white/5">{r.type}</div>
                  <div>
                    <div className="text-white font-black text-sm uppercase tracking-tight group-hover:text-primary-400 transition-colors">{r.name}</div>
                    <div className="text-dark-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{r.cinema?.name || 'Vãng lai'} · {r.totalSeats} Chỗ ngồi</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setVisualEditorRoom(r)}
                    className="px-5 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20 transition-all">
                    Bố cục 3D
                  </button>
                  <button onClick={() => { 
                    setEditRoom(r); 
                    setRoomForm({ 
                      cinemaId: r.cinema?.id || '', 
                      name: r.name, 
                      type: r.type, 
                      totalSeats: r.totalSeats,
                      config: r.config || ''
                    }); 
                    setRoomModal(true) 
                  }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-dark-300 hover:text-white transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L12 21.232H8.5V17.732L17.586 8.314z" /></svg>
                  </button>
                  {r.totalSeats > 0 ? (
                    <button onClick={() => handleViewSeats(r)} className="px-5 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest transition-all">Sơ đồ ghế</button>
                  ) : (
                    <div className="px-5 py-2.5 rounded-xl bg-dark-800 text-dark-500 text-[10px] font-black uppercase tracking-widest opacity-50 italic">Cần tạo ghế</div>
                  )}
                  <button onClick={() => { setSeatRoom(r); setSeatConfig([{ rowLabel: 'A', seatCount: 10, type: 'STANDARD' }]); setSeatModal(true) }}
                    className="px-5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20 transition-all">+ Bố trí ghế</button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinema Modal */}
      <Modal isOpen={cinemaModal} onClose={() => setCinemaModal(false)} title={editCinema ? 'CẬP NHẬT CỤM RẠP' : 'THĂM MỚI CỤM RẠP'} size="md">
        <form onSubmit={handleSaveCinema} className="space-y-6">
          <div><label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Tên hiển thị rạp *</label><input required className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500" value={cinemaForm.name} onChange={e => setCinemaForm({ ...cinemaForm, name: e.target.value })} /></div>
          <div><label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Địa chỉ chi tiết *</label><textarea required rows={3} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 resize-none" value={cinemaForm.address} onChange={e => setCinemaForm({ ...cinemaForm, address: e.target.value })} /></div>
          <div><label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Hotline liên hệ</label><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500" value={cinemaForm.phone} onChange={e => setCinemaForm({ ...cinemaForm, phone: e.target.value })} /></div>
          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black text-xs py-4 rounded-2xl shadow-xl shadow-primary-900/20 transition-all active:scale-95 uppercase tracking-[0.2em]">{editCinema ? 'Lưu Thay Đổi' : 'Xác Nhận Tạo Rạp'}</button>
        </form>
      </Modal>

      {/* Room Modal */}
      <Modal isOpen={roomModal} onClose={() => setRoomModal(false)} title={editRoom ? "CẬP NHẬT PHÒNG CHIẾU" : "THIẾT LẬP PHÒNG CHIẾU"} size="md">
        <form onSubmit={handleSaveRoom} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Trực thuộc Rạp *</label>
            <select required className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 appearance-none cursor-pointer outline-none" value={roomForm.cinemaId} onChange={e => setRoomForm({ ...roomForm, cinemaId: e.target.value })}>
              <option value="" className="bg-dark-900 text-dark-400">-- Chọn rạp trực thuộc --</option>
              {cinemas.map(c => <option key={c.id} value={c.id} className="bg-dark-900">{c.name}</option>)}
            </select>
          </div>
          <div><label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Tên phòng (Ví dụ: Room 01) *</label><input required className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500" value={roomForm.name} onChange={e => setRoomForm({ ...roomForm, name: e.target.value })} /></div>
          <div><label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Công nghệ hiển thị</label>
            <div className="flex gap-2">
              {['2D', '3D', 'IMAX', 'GOLD_CLASS'].map(t => (
                <button 
                  type="button" key={t} 
                  onClick={() => setRoomForm({ ...roomForm, type: t })}
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black border transition-all ${roomForm.type === t ? 'bg-primary-600 border-primary-500 text-white' : 'bg-white/5 border-white/10 text-dark-400 hover:text-white'}`}
                >{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Cấu hình 3D (JSON)</label>
            <textarea 
              placeholder='{"screen": {"rotateX": -15, "scale": 1, "mb": 16}, "hall": {"rotateX": 38, "staggerZ": 45, "staggerY": -12}}'
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 font-mono text-xs" 
              rows={5}
              value={roomForm.config} onChange={e => setRoomForm({ ...roomForm, config: e.target.value })} 
            />
          </div>
          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black text-xs py-4 rounded-2xl shadow-xl shadow-primary-900/20 transition-all active:scale-95 uppercase tracking-[0.2em]">{editRoom ? 'Lưu Thay Đổi' : 'Tạo Phòng Ngay'}</button>
        </form>
      </Modal>

      {/* Seat layout creation Modal */}
      <Modal isOpen={seatModal} onClose={() => setSeatModal(false)} title={`BỐ TRÍ SƠ ĐỒ GHẾ — ${seatRoom?.name}`} size="lg">
        <div className="space-y-6">
          <div className="bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[11px] font-bold rounded-2xl px-5 py-4 flex items-center gap-3">
             <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <div>Phòng hiện có <span className="text-white">{seatRoom?.totalSeats} ghế</span>. Việc tạo mới ghế trùng mã sẽ giữ nguyên thông tin cũ.</div>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {seatConfig.map((row, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-3 items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="flex-col flex group">
                  <label className="text-[9px] font-black text-dark-500 uppercase tracking-widest pl-1 mb-1 group-focus-within:text-white transition-colors">Hàng</label>
                  <input className="bg-dark-900 border border-white/10 rounded-xl w-14 h-10 text-center font-black uppercase text-white focus:border-primary-500 focus:outline-none" placeholder="A" maxLength={1}
                    value={row.rowLabel} onChange={e => updateRow(i, 'rowLabel', e.target.value.toUpperCase())} />
                </div>
                <div className="flex-col flex group">
                  <label className="text-[9px] font-black text-dark-500 uppercase tracking-widest pl-1 mb-1 group-focus-within:text-white transition-colors">Số Ghế</label>
                  <input type="number" min={1} max={30} className="bg-dark-900 border border-white/10 rounded-xl w-20 h-10 text-center font-black text-white focus:border-primary-500 focus:outline-none" 
                    value={row.seatCount} onChange={e => updateRow(i, 'seatCount', e.target.value)} />
                </div>
                <div className="flex-col flex flex-1 group">
                  <label className="text-[9px] font-black text-dark-500 uppercase tracking-widest pl-1 mb-1 group-focus-within:text-white transition-colors">Loại vé</label>
                  <select className="bg-dark-900 border border-white/10 rounded-xl h-10 px-3 font-black text-[10px] text-white focus:border-primary-500 focus:outline-none cursor-pointer appearance-none" value={row.type} onChange={e => updateRow(i, 'type', e.target.value)}>
                    {['STANDARD', 'VIP', 'COUPLE'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <button onClick={() => removeRow(i)} className="mt-4 w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all flex items-center justify-center">✕</button>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3 pt-6 border-t border-white/5">
            <button onClick={addRow} className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">Thêm hàng mới</button>
            <button onClick={handleCreateSeats} className="flex-[2] bg-gradient-to-tr from-primary-600 to-rose-600 hover:from-primary-500 hover:to-rose-500 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-900/20 active:scale-95">Xác nhận tạo hàng ghế</button>
          </div>
        </div>
      </Modal>

      {/* Seat detailed View/Edit Modal */}
      <Modal isOpen={seatViewModal} onClose={() => setSeatViewModal(false)} title={`KIỂM TOÁN GHẾ — ${seatViewRoom?.name}`} size="lg">
        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4 scrollbar-hide">
          {seatRows.length === 0 && <div className="text-dark-500 text-center py-20 font-black uppercase text-xs tracking-widest animate-pulse">Đang nạp sơ đồ ghế...</div>}
          {seatRows.map(row => (
            <div key={row.rowLabel}>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px flex-1 bg-white/5"></div>
                <div className="text-dark-400 text-[10px] font-black uppercase tracking-[0.3em]">DÃY GHẾ {row.rowLabel}</div>
                <div className="h-px flex-1 bg-white/5"></div>
              </div>
              <div className="flex flex-wrap gap-2.5 justify-center">
                {row.seats.map(seat => (
                  <div key={seat.id}
                    className={`relative border rounded-2xl px-3 py-2.5 transition-all group overflow-hidden w-36
                      ${SEAT_TYPE_COLORS[seat.type] ?? SEAT_TYPE_COLORS.STANDARD}
                      ${!seat.isActive ? 'opacity-30 grayscale' : ''}`}>
                    <div className="text-white font-black text-xs text-center mb-1.5">{seat.seatCode}</div>
                    <div className="flex flex-col gap-1.5">
                      <select
                        className="bg-dark-900/50 border-none text-[8px] font-black uppercase p-1 rounded-md cursor-pointer focus:outline-none appearance-none text-center hover:text-white transition-colors"
                        value={seat.type}
                        disabled={savingSeatId === seat.id}
                        onChange={e => handleUpdateSeat(seat.id, 'type', e.target.value)}
                      >
                        {['STANDARD', 'VIP', 'COUPLE'].map(t => <option key={t} value={t} className="bg-dark-900">{t}</option>)}
                      </select>
                      
                      {/* Offset configuration */}
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { l: 'X', f: 'offsetX' },
                          { l: 'Y', f: 'offsetY' },
                          { l: 'Z', f: 'offsetZ' }
                        ].map(off => (
                          <div key={off.f} className="flex flex-col items-center">
                            <span className="text-[7px] font-bold text-dark-500">{off.l}</span>
                            <input 
                              type="number" step="0.5"
                              className="w-full bg-dark-900/50 text-[8px] font-black text-center rounded px-0.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                              value={seat[off.f] || 0}
                              onBlur={e => handleUpdateSeat(seat.id, off.f, parseFloat(e.target.value))}
                              onKeyDown={e => e.key === 'Enter' && handleUpdateSeat(seat.id, off.f, parseFloat(e.target.value))}
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        className={`text-[9px] font-black uppercase w-full py-1 mt-0.5 rounded-lg transition-all ${seat.isActive ? 'bg-green-500/20 text-green-400 hover:bg-rose-500 hover:text-white' : 'bg-rose-500/20 text-rose-400 hover:bg-green-500 hover:text-white'}`}
                        disabled={savingSeatId === seat.id}
                        onClick={() => handleUpdateSeat(seat.id, 'isActive', !seat.isActive)}
                      >
                        {seat.isActive ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Visual Layout Editor Overlay */}
      {visualEditorRoom && (
        <SeatLayoutEditor 
          room={visualEditorRoom} 
          onClose={() => setVisualEditorRoom(null)} 
          onSave={reloadRooms}
        />
      )}
    </div>
  )
}
