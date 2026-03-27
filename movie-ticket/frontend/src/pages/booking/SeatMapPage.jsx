import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { showtimeApi } from '../../api/showtimeApi'
import { toggleSeat, clearSeats } from '../../store/slices/bookingSlice'
import { PageLoader } from '../../components/common/Spinner'
import { formatPrice, formatTime, formatDate } from '../../utils/helpers'
import { toast } from 'react-toastify'

function Seat({ seat, selected, onToggle }) {
  const isBooked = seat.seatStatus === 'BOOKED'
  const isHeld = seat.seatStatus === 'HELD'

  const getClass = () => {
    if (isBooked) return 'seat-booked'
    if (isHeld) return 'seat-held'
    if (selected) {
      if (seat.type === 'VIP') return 'seat-vip-selected'
      if (seat.type === 'COUPLE') return 'seat-couple-selected'
      return 'seat-selected'
    }
    if (seat.type === 'VIP') return 'seat-vip'
    if (seat.type === 'COUPLE') return 'seat-couple'
    return 'seat-available'
  }

  const getSize = () => seat.type === 'COUPLE' ? 'w-14 h-10' : 'w-10 h-10'

  return (
    <button
      disabled={isBooked || isHeld}
      onClick={() => onToggle(seat)}
      className={`${getClass()} ${getSize()} rounded-lg text-xs font-semibold flex items-center justify-center`}
      title={`${seat.seatCode} - ${seat.type} - ${formatPrice(seat.price)}`}
    >
      {seat.seatCode}
    </button>
  )
}

export default function SeatMapPage() {
  const { id: showtimeId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedSeats, currentShowtime } = useSelector(s => s.booking)
  const [rows, setRows] = useState([])
  const [showtime, setShowtime] = useState(currentShowtime)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      showtimeApi.getShowtimeSeats(showtimeId),
      !currentShowtime ? showtimeApi.getShowtimeById(showtimeId) : Promise.resolve(null),
    ]).then(([seatsRes, stRes]) => {
      setRows(seatsRes.data.data.rows || [])
      if (stRes) setShowtime(stRes.data.data)
    }).catch(() => navigate('/movies')).finally(() => setLoading(false))
  }, [showtimeId])

  const handleToggle = (seat) => {
    const alreadySelected = selectedSeats.find(s => s.id === seat.id)
    if (!alreadySelected && selectedSeats.length >= 8) {
      toast.warn('Bạn chỉ có thể chọn tối đa 8 ghế!')
      return
    }
    dispatch(toggleSeat({ ...seat, showtimeId }))
  }

  const totalPrice = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0)

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.warn('Vui lòng chọn ít nhất 1 ghế')
      return
    }
    navigate('/booking/confirm')
  }

  if (loading) return <PageLoader />

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top info bar */}
        {showtime && (
          <div className="card p-4 mb-6 flex flex-wrap gap-4 items-center">
            <div>
              <div className="text-dark-400 text-xs">Phim</div>
              <div className="text-white font-semibold">{showtime.movie?.title || showtime.movieTitle}</div>
            </div>
            <div className="w-px h-8 bg-dark-700 hidden sm:block" />
            <div>
              <div className="text-dark-400 text-xs">Suất chiếu</div>
              <div className="text-white font-semibold">{formatTime(showtime.startTime)} · {formatDate(showtime.startTime)}</div>
            </div>
            <div className="w-px h-8 bg-dark-700 hidden sm:block" />
            <div>
              <div className="text-dark-400 text-xs">Phòng</div>
              <div className="text-white font-semibold">{showtime.room?.name} ({showtime.room?.type})</div>
            </div>
            <div className="w-px h-8 bg-dark-700 hidden sm:block" />
            <div>
              <div className="text-dark-400 text-xs">Rạp</div>
              <div className="text-white font-semibold">{showtime.cinema?.name || showtime.cinemaName}</div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Seat map */}
          <div className="flex-1">
            {/* Screen */}
            <div className="mb-8 text-center">
              <div className="w-full max-w-lg mx-auto h-2 bg-gradient-to-r from-transparent via-primary-500 to-transparent rounded-full opacity-70 mb-2" />
              <span className="text-dark-400 text-xs tracking-widest uppercase">Màn hình</span>
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {rows.map(row => (
                <div key={row.rowLabel} className="flex items-center gap-2">
                  <div className="w-6 text-dark-500 text-xs font-mono text-right flex-shrink-0">{row.rowLabel}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {(row.seats || []).map(seat => (
                      <Seat
                        key={seat.id}
                        seat={seat}
                        selected={!!selectedSeats.find(s => s.id === seat.id)}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-8 justify-center">
              {[
                { cls: 'w-8 h-8 rounded bg-green-600/80 border border-green-500', label: 'Trống' },
                { cls: 'w-8 h-8 rounded bg-dark-700 border border-dark-600', label: 'Đã đặt' },
                { cls: 'w-8 h-8 rounded bg-yellow-600/80 border border-yellow-500', label: 'Đang giữ' },
                { cls: 'w-8 h-8 rounded bg-purple-600/80 border border-purple-500', label: 'VIP' },
                { cls: 'w-8 h-8 rounded bg-pink-600/80 border border-pink-500', label: 'Couple' },
                { cls: 'w-8 h-8 rounded bg-primary-600 border border-primary-400 ring-2 ring-primary-400', label: 'Đã chọn' },
              ].map(({ cls, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={cls} />
                  <span className="text-dark-300 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary panel */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="card p-5 sticky top-24">
              <h3 className="font-semibold text-white mb-4">Ghế đã chọn ({selectedSeats.length}/8)</h3>

              {selectedSeats.length === 0 ? (
                <p className="text-dark-400 text-sm">Chưa chọn ghế nào</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {selectedSeats.map(s => (
                    <div key={s.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-white font-medium">{s.seatCode}</span>
                        <span className="text-dark-400 ml-2 text-xs">{s.type}</span>
                      </div>
                      <span className="text-dark-300">{formatPrice(s.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-dark-700 pt-4 mt-2">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-dark-300">Tổng cộng</span>
                  <span className="text-primary-400 font-bold text-lg">{formatPrice(totalPrice)}</span>
                </div>

                <button onClick={handleContinue} className="btn-primary w-full">
                  Tiếp tục →
                </button>
                <button onClick={() => { dispatch(clearSeats()); navigate(-1) }} className="btn-ghost w-full mt-2 text-sm">
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
