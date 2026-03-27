import { useState, useEffect } from 'react'
import { cinemaApi } from '../../api/cinemaApi'
import Modal from '../../components/common/Modal'
import { getErrorMessage } from '../../utils/helpers'
import { toast } from 'react-toastify'

export default function ManageCinemasPage() {
  const [cinemas, setCinemas] = useState([])
  const [rooms, setRooms] = useState([])
  const [selectedCinema, setSelectedCinema] = useState(null)
  const [tab, setTab] = useState('cinemas')
  const [loading, setLoading] = useState(true)

  // Cinema form
  const [cinemaModal, setCinemaModal] = useState(false)
  const [editCinema, setEditCinema] = useState(null)
  const [cinemaForm, setCinemaForm] = useState({ name: '', address: '', phone: '' })

  // Room form
  const [roomModal, setRoomModal] = useState(false)
  const [roomForm, setRoomForm] = useState({ cinemaId: '', name: '', type: '2D', totalSeats: '' })

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
    cinemaApi.getAllRooms().then(r => setRooms(r.data.data || [])).catch(() => setRooms([]))
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
      await cinemaApi.createRoom({ ...roomForm, cinemaId: parseInt(roomForm.cinemaId), totalSeats: parseInt(roomForm.totalSeats) || 0 })
      toast.success('Thêm phòng thành công')
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
    STANDARD: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    VIP:      'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    COUPLE:   'bg-pink-500/20 text-pink-400 border-pink-500/40',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý Rạp & Phòng</h1>
        {tab === 'cinemas' && (
          <button onClick={() => { setEditCinema(null); setCinemaForm({ name: '', address: '', phone: '' }); setCinemaModal(true) }} className="btn-primary">+ Thêm rạp</button>
        )}
        {tab === 'rooms' && (
          <button onClick={() => { setRoomForm({ cinemaId: selectedCinema?.id || '', name: '', type: '2D', totalSeats: '' }); setRoomModal(true) }} className="btn-primary">+ Thêm phòng</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-900 rounded-xl p-1 border border-dark-700 mb-6 w-fit">
        {[{ v: 'cinemas', l: 'Rạp phim' }, { v: 'rooms', l: `Phòng chiếu${selectedCinema ? ` — ${selectedCinema.name}` : ''}` }].map(t => (
          <button key={t.v} onClick={() => { setTab(t.v); if (t.v === 'rooms') { setSelectedCinema(null); loadAllRooms() } }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.v ? 'bg-primary-600 text-white' : 'text-dark-300 hover:text-white'}`}
          >{t.l}</button>
        ))}
      </div>

      {tab === 'cinemas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? <div className="text-dark-400">Đang tải...</div> : cinemas.map(c => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-dark-400 text-xs mt-1">{c.address}</div>
                  {c.phone && <div className="text-dark-400 text-xs">{c.phone}</div>}
                </div>
                <span className={`badge-status ${c.isActive ? 'bg-green-500/20 text-green-400' : 'bg-dark-500/20 text-dark-400'}`}>
                  {c.isActive ? 'Hoạt động' : 'Tạm đóng'}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => loadRooms(c.id)} className="btn-ghost text-xs flex-1">Xem phòng</button>
                <button onClick={() => { setEditCinema(c); setCinemaForm({ name: c.name, address: c.address, phone: c.phone || '' }); setCinemaModal(true) }}
                  className="text-xs bg-dark-700 hover:bg-dark-600 text-white px-3 py-1.5 rounded-lg">Sửa</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'rooms' && (
        <div className="space-y-3">
          {rooms.length === 0 && <div className="text-dark-400 text-center py-10">Không có phòng nào</div>}
          {rooms.map(r => (
            <div key={r.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">{r.name}
                  {r.cinema && <span className="text-dark-400 text-xs font-normal ml-2">— {r.cinema.name}</span>}
                </div>
                <div className="text-dark-400 text-sm">{r.type} · {r.totalSeats} ghế</div>
              </div>
              <div className="flex gap-2">
                {r.totalSeats > 0 && (
                  <button onClick={() => handleViewSeats(r)}
                    className="text-xs bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 px-3 py-1.5 rounded-lg">Xem ghế</button>
                )}
                <button onClick={() => { setSeatRoom(r); setSeatConfig([{ rowLabel: 'A', seatCount: 10, type: 'STANDARD' }]); setSeatModal(true) }}
                  className="text-xs bg-purple-900/30 hover:bg-purple-900/50 text-purple-400 px-3 py-1.5 rounded-lg">+ Tạo ghế</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cinema Modal */}
      <Modal isOpen={cinemaModal} onClose={() => setCinemaModal(false)} title={editCinema ? 'Sửa rạp' : 'Thêm rạp mới'}>
        <form onSubmit={handleSaveCinema} className="space-y-3">
          <div><label className="label">Tên rạp *</label><input required className="input-field" value={cinemaForm.name} onChange={e => setCinemaForm({ ...cinemaForm, name: e.target.value })} /></div>
          <div><label className="label">Địa chỉ *</label><textarea required rows={2} className="input-field resize-none" value={cinemaForm.address} onChange={e => setCinemaForm({ ...cinemaForm, address: e.target.value })} /></div>
          <div><label className="label">Số điện thoại</label><input className="input-field" value={cinemaForm.phone} onChange={e => setCinemaForm({ ...cinemaForm, phone: e.target.value })} /></div>
          <button type="submit" className="btn-primary w-full">{editCinema ? 'Cập nhật' : 'Thêm rạp'}</button>
        </form>
      </Modal>

      {/* Room Modal */}
      <Modal isOpen={roomModal} onClose={() => setRoomModal(false)} title="Thêm phòng chiếu">
        <form onSubmit={handleSaveRoom} className="space-y-3">
          <div><label className="label">Rạp phim *</label>
            <select required className="input-field" value={roomForm.cinemaId} onChange={e => setRoomForm({ ...roomForm, cinemaId: e.target.value })}>
              <option value="">-- Chọn rạp --</option>
              {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Tên phòng *</label><input required className="input-field" value={roomForm.name} onChange={e => setRoomForm({ ...roomForm, name: e.target.value })} /></div>
          <div><label className="label">Loại phòng</label>
            <select className="input-field" value={roomForm.type} onChange={e => setRoomForm({ ...roomForm, type: e.target.value })}>
              {['2D', '3D', 'IMAX'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Thêm phòng</button>
        </form>
      </Modal>

      {/* Seat create Modal */}
      <Modal isOpen={seatModal} onClose={() => setSeatModal(false)} title={`Tạo ghế — ${seatRoom?.name}`} size="lg">
        <div className="space-y-3">
          {seatRoom?.totalSeats > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm rounded-lg px-3 py-2">
              Phòng này đã có {seatRoom.totalSeats} ghế. Ghế trùng mã sẽ được bỏ qua.
            </div>
          )}
          {seatConfig.map((row, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="input-field w-16 text-center font-mono uppercase" placeholder="A" maxLength={1}
                value={row.rowLabel} onChange={e => updateRow(i, 'rowLabel', e.target.value.toUpperCase())} />
              <input type="number" min={1} max={30} className="input-field w-24" placeholder="Số ghế"
                value={row.seatCount} onChange={e => updateRow(i, 'seatCount', e.target.value)} />
              <select className="input-field flex-1" value={row.type} onChange={e => updateRow(i, 'type', e.target.value)}>
                {['STANDARD', 'VIP', 'COUPLE'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-300 p-1">✕</button>
            </div>
          ))}
          <button onClick={addRow} className="btn-ghost w-full text-sm">+ Thêm hàng</button>
          <button onClick={handleCreateSeats} className="btn-primary w-full">Tạo ghế</button>
        </div>
      </Modal>

      {/* Seat view/edit Modal */}
      <Modal isOpen={seatViewModal} onClose={() => setSeatViewModal(false)} title={`Ghế — ${seatViewRoom?.name}`} size="lg">
        <div className="space-y-4">
          {seatRows.length === 0 && <div className="text-dark-400 text-center py-6">Đang tải...</div>}
          {seatRows.map(row => (
            <div key={row.rowLabel}>
              <div className="text-dark-400 text-xs font-semibold mb-2">Hàng {row.rowLabel}</div>
              <div className="flex flex-wrap gap-2">
                {row.seats.map(seat => (
                  <div key={seat.id}
                    className={`relative border rounded-lg px-2 py-1.5 text-xs font-mono cursor-default transition-opacity
                      ${SEAT_TYPE_COLORS[seat.type] ?? SEAT_TYPE_COLORS.STANDARD}
                      ${!seat.isActive ? 'opacity-40' : ''}`}>
                    <div className="font-semibold">{seat.seatCode}</div>
                    <div className="flex gap-1 mt-1">
                      <select
                        className="bg-transparent border-none text-xs p-0 cursor-pointer focus:outline-none"
                        value={seat.type}
                        disabled={savingSeatId === seat.id}
                        onChange={e => handleUpdateSeat(seat.id, 'type', e.target.value)}
                      >
                        {['STANDARD', 'VIP', 'COUPLE'].map(t => <option key={t} value={t} className="bg-dark-800">{t}</option>)}
                      </select>
                      <button
                        className={`text-xs px-1 rounded ${seat.isActive ? 'text-green-400 hover:text-red-400' : 'text-red-400 hover:text-green-400'}`}
                        disabled={savingSeatId === seat.id}
                        onClick={() => handleUpdateSeat(seat.id, 'isActive', !seat.isActive)}
                        title={seat.isActive ? 'Vô hiệu hoá' : 'Kích hoạt'}
                      >
                        {seat.isActive ? '✓' : '✗'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
