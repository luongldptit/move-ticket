import axiosInstance from './axiosInstance'

export const cinemaApi = {
  getCinemas: () => axiosInstance.get('/api/v1/cinemas'),
  getCinemaById: (id) => axiosInstance.get(`/api/v1/cinemas/${id}`),
  getCinemaRooms: (id) => axiosInstance.get(`/api/v1/cinemas/${id}/rooms`),
  getAllRooms: (cinemaId) => axiosInstance.get('/api/v1/rooms', { params: cinemaId ? { cinemaId } : {} }),
  getRoomById: (id) => axiosInstance.get(`/api/v1/rooms/${id}`),
  getRoomSeats: (roomId) => axiosInstance.get(`/api/v1/rooms/${roomId}/seats`),
  // Admin
  createCinema: (data) => axiosInstance.post('/api/v1/cinemas', data),
  updateCinema: (id, data) => axiosInstance.put(`/api/v1/cinemas/${id}`, data),
  createRoom: (data) => axiosInstance.post('/api/v1/rooms', data),
  updateRoom: (id, data) => axiosInstance.put(`/api/v1/rooms/${id}`, data),
  createSeats: (data) => axiosInstance.post('/api/v1/rooms/seats/batch', data),  // ← BE path
  updateSeat: (id, data) => axiosInstance.put(`/api/v1/rooms/seats/${id}`, data),
}
