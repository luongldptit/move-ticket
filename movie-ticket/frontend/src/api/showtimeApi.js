import axiosInstance from './axiosInstance'

export const showtimeApi = {
  getShowtimes: (params) => axiosInstance.get('/api/v1/showtimes', { params }),
  getShowtimeById: (id) => axiosInstance.get(`/api/v1/showtimes/${id}`),
  getShowtimeSeats: (showtimeId) => axiosInstance.get(`/api/v1/showtimes/${showtimeId}/seats`),
  // Admin
  createShowtime: (data) => axiosInstance.post('/api/v1/showtimes', data),
  updateShowtime: (id, data) => axiosInstance.put(`/api/v1/showtimes/${id}`, data),
  deleteShowtime: (id) => axiosInstance.delete(`/api/v1/showtimes/${id}`),
}
