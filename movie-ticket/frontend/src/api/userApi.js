import axiosInstance from './axiosInstance'

export const userApi = {
  getMe: () => axiosInstance.get('/api/v1/users/me'),
  updateMe: (data) => axiosInstance.put('/api/v1/users/me', data),
}
