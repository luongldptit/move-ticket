import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { reviewApi } from '../../api/reviewApi'

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async ({ movieId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const res = await reviewApi.getReviews(movieId, { page, size })
      return { movieId, data: res.data.data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tải đánh giá')
    }
  }
)

export const fetchMyReview = createAsyncThunk(
  'reviews/fetchMyReview',
  async (movieId, { rejectWithValue }) => {
    try {
      const res = await reviewApi.getMyReview(movieId)
      return { movieId, data: res.data.data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tải đánh giá của bạn')
    }
  }
)

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async ({ movieId, rating, comment }, { rejectWithValue }) => {
    try {
      const res = await reviewApi.createReview(movieId, { rating, comment })
      return { movieId, data: res.data.data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi gửi đánh giá')
    }
  }
)

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, movieId, rating, comment }, { rejectWithValue }) => {
    try {
      const res = await reviewApi.updateReview(reviewId, { rating, comment })
      return { movieId, data: res.data.data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi cập nhật đánh giá')
    }
  }
)

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async ({ reviewId, movieId }, { rejectWithValue }) => {
    try {
      await reviewApi.deleteReview(reviewId)
      return { reviewId, movieId }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi xóa đánh giá')
    }
  }
)

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    byMovie: {},      // { [movieId]: { content, totalPages, currentPage, totalElements } }
    myReview: {},     // { [movieId]: review | null }
    loading: false,
    error: null,
  },
  reducers: {
    clearReviewError: (state) => { state.error = null },
    clearMyReviews: (state) => { state.myReview = {} },
  },
  extraReducers: (builder) => {
    builder
      // fetchReviews
      .addCase(fetchReviews.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false
        state.byMovie[action.payload.movieId] = action.payload.data
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // fetchMyReview
      .addCase(fetchMyReview.fulfilled, (state, action) => {
        state.myReview[action.payload.movieId] = action.payload.data
      })

      // createReview
      .addCase(createReview.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false
        state.myReview[action.payload.movieId] = action.payload.data
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // updateReview
      .addCase(updateReview.pending, (state) => { state.loading = true; state.error = null })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false
        state.myReview[action.payload.movieId] = action.payload.data
        const list = state.byMovie[action.payload.movieId]
        if (list?.content) {
          list.content = list.content.map(r =>
            r.id === action.payload.data.id ? action.payload.data : r
          )
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // deleteReview
      .addCase(deleteReview.fulfilled, (state, action) => {
        const { reviewId, movieId } = action.payload
        state.myReview[movieId] = null
        const list = state.byMovie[movieId]
        if (list?.content) {
          list.content = list.content.filter(r => r.id !== reviewId)
          list.totalElements = Math.max(0, (list.totalElements || 1) - 1)
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearReviewError, clearMyReviews } = reviewSlice.actions
export default reviewSlice.reducer
