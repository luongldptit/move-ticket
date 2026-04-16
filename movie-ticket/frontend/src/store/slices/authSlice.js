import { createSlice } from '@reduxjs/toolkit'
import { isTokenAlive } from '../../utils/helpers'

const tokenFromStorage = localStorage.getItem('token')
const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null

// If stored token is expired, clear it immediately — user is guest
const validToken = isTokenAlive(tokenFromStorage) ? tokenFromStorage : null
if (!validToken && tokenFromStorage) {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: validToken ? userFromStorage : null,
    token: validToken,
    isAuthenticated: !!validToken,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload
      state.user = user
      state.token = accessToken
      state.isAuthenticated = true
      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})

export const { setCredentials, updateUser, logout } = authSlice.actions
export default authSlice.reducer
