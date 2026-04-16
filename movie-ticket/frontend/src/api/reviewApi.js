import axiosInstance from './axiosInstance'

export const reviewApi = {
  getReviews: (movieId, params) =>
    axiosInstance.get(`/api/v1/reviews/movies/${movieId}`, { params }),

  getMyReview: (movieId) =>
    axiosInstance.get(`/api/v1/reviews/movies/${movieId}/me`),

  createReview: (movieId, data) =>
    axiosInstance.post(`/api/v1/reviews/movies/${movieId}`, data),

  updateReview: (reviewId, data) =>
    axiosInstance.put(`/api/v1/reviews/${reviewId}`, data),

  deleteReview: (reviewId) =>
    axiosInstance.delete(`/api/v1/reviews/${reviewId}`),
}
