import axios from 'axios'
import { getToken, clearToken } from './auth.js'

const api = axios.create({
  baseURL: '/api',           // proxied → http://localhost:8080/api via vite
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// ── Request interceptor : injecte le JWT ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor : gère l'expiration du token ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api