import axiosInstance from './axiosInstance'

export const authApi = {
  login: (data) => axiosInstance.post('/api/v1/auth/login', data),
  register: (data) => axiosInstance.post('/api/v1/auth/register', data),
  logout: () => axiosInstance.post('/api/v1/auth/logout'),
  changePassword: (data) => axiosInstance.post('/api/v1/auth/change-password', data),
}
