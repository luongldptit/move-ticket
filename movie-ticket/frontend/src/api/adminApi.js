import axiosInstance from './axiosInstance'

export const adminApi = {
  // Users
  getUsers: (params) => axiosInstance.get('/api/v1/admin/users', { params }),
  createUser: (data) => axiosInstance.post('/api/v1/admin/users', data),
  updateUserRole: (id, role) => axiosInstance.patch(`/api/v1/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, isActive) => axiosInstance.patch(`/api/v1/admin/users/${id}/status`, { isActive }),
  // Promotions
  getPromotions: (params) => axiosInstance.get('/api/v1/admin/promotions', { params }),
  createPromotion: (data) => axiosInstance.post('/api/v1/admin/promotions', data),
  updatePromotion: (id, data) => axiosInstance.put(`/api/v1/admin/promotions/${id}`, data),
  deletePromotion: (id) => axiosInstance.delete(`/api/v1/admin/promotions/${id}`),
  // Reports
  getRevenueReport: (params) => axiosInstance.get('/api/v1/admin/reports/revenue', { params }),
  getTopMovies: (params) => axiosInstance.get('/api/v1/admin/reports/top-movies', { params }),
  getOccupancyReport: (params) => axiosInstance.get('/api/v1/admin/reports/occupancy', { params }),
}
