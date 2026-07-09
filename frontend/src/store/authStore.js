import { create } from 'zustand'
import api from '../api'

// ล้าง session ทุกครั้งที่เปิดแอป
localStorage.removeItem('token')
localStorage.removeItem('user')

export const useAuthStore = create((set) => ({
  user: null,
  token: null,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    set({ user: data.user, token: data.token })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  }
}))
