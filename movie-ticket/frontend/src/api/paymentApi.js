import axiosInstance from './axiosInstance'

export const paymentApi = {
  initiatePayment: (data) => axiosInstance.post('/api/v1/payments/initiate', data),
  paymentCallback: (data) => axiosInstance.post('/api/v1/payments/callback', data),
  getPayment: (bookingId) => axiosInstance.get(`/api/v1/payments/${bookingId}`),
}
