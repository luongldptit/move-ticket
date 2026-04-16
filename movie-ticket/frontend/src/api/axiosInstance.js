import axios from 'axios'
import { store } from '../store/store'
import { logout } from '../store/slices/authSlice'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT only if token alive
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — on 401: silently logout (guest mode), no redirect
// Components that need auth should check isAuthenticated before calling API
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.errorCode

      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_INVALID') {
        // Token invalid/expired → clear credentials silently, become guest
        store.dispatch(logout())
      }
      // For UNAUTHORIZED (no token) we do nothing — component should have
      // already guarded the call with isAuthenticated check
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
