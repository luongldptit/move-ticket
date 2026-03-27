import axiosInstance from './axiosInstance'

export const bookingApi = {
  createBooking: (data) => axiosInstance.post('/api/v1/bookings', data),
  getMyBookings: (params) => axiosInstance.get('/api/v1/bookings/my', { params }),
  getBookingById: (id) => axiosInstance.get(`/api/v1/bookings/${id}`),
  cancelBooking: (id) => axiosInstance.put(`/api/v1/bookings/${id}/cancel`),
  // Staff
  verifyBooking: (code) => axiosInstance.get(`/api/v1/bookings/verify/${code}`),
  getBookingsByShowtime: (showtimeId) => axiosInstance.get('/api/v1/bookings', { params: { showtimeId } }),
}
