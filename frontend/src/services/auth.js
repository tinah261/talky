import api from './api.js'

const TOKEN_KEY = 'talky_token'
const USER_KEY  = 'talky_user'

// ── Token ──────────────────────────────────────────────────────────────────────
export const getToken   = () => localStorage.getItem(TOKEN_KEY)
export const setToken   = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ── Current user ───────────────────────────────────────────────────────────────
export const getCurrentUser = () => {
  const raw = localStorage.getItem(USER_KEY)
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}
const saveUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u))

// ── Auth calls ─────────────────────────────────────────────────────────────────

/**
 * Inscription
 * POST /api/auth/register
 * backend retourne : { token, user: { id, username, email, avatar, ... } }
 */
export async function register({ username, email, password }) {
  const { data } = await api.post('/auth/register', { username, email, password })
  if (data.token) {
    setToken(data.token)
    saveUser({
      id:       data.user.id,
      username: data.user.username,
      email:    data.user.email,
      avatar:   data.user.avatar,
    })
  }
  return data
}

/**
 * Connexion
 * POST /api/auth/login
 * backend retourne : { token, user: { id, username, email, avatar, isOnline, lastSeen } }
 */
export async function login({ username, password }) {
  const { data } = await api.post('/auth/login', { username, password })
  if (data.token) {
    setToken(data.token)
    saveUser({
      id:       data.user.id,
      username: data.user.username,
      email:    data.user.email,
      avatar:   data.user.avatar,
    })
  }
  return data
}

/**
 * Déconnexion
 */
export async function logout() {
  try {
    await api.post('/auth/logout')
  } catch (_) {}
  finally {
    clearToken()
    window.location.href = '/login'
  }
}