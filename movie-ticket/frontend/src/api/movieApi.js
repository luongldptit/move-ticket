import axiosInstance from './axiosInstance'

export const movieApi = {
  getMovies: (params) => axiosInstance.get('/api/v1/movies', { params }),
  getNowShowing: (params) => axiosInstance.get('/api/v1/movies/now-showing', { params }),
  getComingSoon: (params) => axiosInstance.get('/api/v1/movies/coming-soon', { params }),
  getMovieById: (id) => axiosInstance.get(`/api/v1/movies/${id}`),
  getMovieShowtimes: (id, params) => axiosInstance.get(`/api/v1/movies/${id}/showtimes`, { params }),
  getGenres: () => axiosInstance.get('/api/v1/genres'),
  // Admin
  createMovie: (data) => axiosInstance.post('/api/v1/movies', data),
  updateMovie: (id, data) => axiosInstance.put(`/api/v1/movies/${id}`, data),
  deleteMovie: (id) => axiosInstance.delete(`/api/v1/movies/${id}`),
}
