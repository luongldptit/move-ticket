import axiosInstance from './axiosInstance'

export const promotionApi = {
  validatePromotion: (data) => axiosInstance.post('/api/v1/promotions/validate', data),
}
