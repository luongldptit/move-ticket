import { createSlice } from '@reduxjs/toolkit'

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    selectedSeats: [],    // Array of seat objects
    currentShowtime: null,
    currentBooking: null, // Created booking details
  },
  reducers: {
    toggleSeat: (state, action) => {
      const seat = action.payload
      const exists = state.selectedSeats.find(s => s.id === seat.id)
      if (exists) {
        state.selectedSeats = state.selectedSeats.filter(s => s.id !== seat.id)
      } else {
        if (state.selectedSeats.length < 8) {
          state.selectedSeats.push(seat)
        }
      }
    },
    clearSeats: (state) => {
      state.selectedSeats = []
    },
    setCurrentShowtime: (state, action) => {
      state.currentShowtime = action.payload
      state.selectedSeats = []
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload
    },
    clearBooking: (state) => {
      state.selectedSeats = []
      state.currentShowtime = null
      state.currentBooking = null
    },
  },
})

export const { toggleSeat, clearSeats, setCurrentShowtime, setCurrentBooking, clearBooking } = bookingSlice.actions
export default bookingSlice.reducer
