import React, { useState, useRef } from 'react'
import { useTheme } from '../hooks/useTheme.js'
import api from '../services/api.js'
import styles from './ProfileModal.module.css'

export default function ProfileModal({ user, onClose, onUpdated }) {
  const [tab, setTab]           = useState('profile') // 'profile' | 'password'
  const [form, setForm]         = useState({
    username: user?.username || '',
    email:    user?.email    || '',
    avatar:   user?.avatar   || '',
  })
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  })
  const [preview,  setPreview]  = useState(user?.avatar || null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const fileRef = useRef(null)
  const { theme, toggleTheme } = useTheme()

  // ── Changer champ ──────────────────────────────────────────────────────────
  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handlePassChange = (e) =>
    setPassForm(f => ({ ...f, [e.target.name]: e.target.value }))

  // ── Upload avatar ──────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Aperçu local immédiat
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    // Upload vers le backend
    const formData = new FormData()
    formData.append('file', file)
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      // Via le proxy Vite → /uploads/... est servi par le backend
      setPreview(data.avatarUrl)
      setForm(f => ({ ...f, avatar: data.avatarUrl }))
      // Mettre à jour le parent immédiatement
      onUpdated?.({ avatar: data.avatarUrl })
      setSuccess('Avatar mis à jour !')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'upload")
      setPreview(user?.avatar || null)
    } finally {
      setLoading(false)
    }
  }

  // ── Sauvegarder profil ─────────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const { data } = await api.put('/users/profile', {
        username: form.username,
        email:    form.email,
        avatar:   form.avatar,
      })
      // Mettre à jour le localStorage
      const stored = JSON.parse(localStorage.getItem('talky_user') || '{}')
      localStorage.setItem('talky_user', JSON.stringify({ ...stored, ...data }))
      setSuccess('Profil mis à jour !')
      // Notifier Home.jsx pour mettre à jour currentUser
      onUpdated?.(data)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  // ── Changer mot de passe ───────────────────────────────────────────────────
  const handleSavePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (passForm.newPassword !== passForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (passForm.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit faire au moins 6 caractères')
      return
    }
    setLoading(true)
    try {
      await api.put('/users/password', {
        currentPassword: passForm.currentPassword,
        newPassword:     passForm.newPassword,
      })
      setSuccess('Mot de passe modifié !')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Mot de passe actuel incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} fade-in`}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <h2 className={styles.title}>Mon profil</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'profile' ? styles.tabActive : ''}`}
            onClick={() => { setTab('profile'); setError(''); setSuccess('') }}
          >Informations</button>
          <button
            className={`${styles.tab} ${tab === 'password' ? styles.tabActive : ''}`}
            onClick={() => { setTab('password'); setError(''); setSuccess('') }}
          >Mot de passe</button>
        </div>

        {/* ── Tab Profil ── */}
        {tab === 'profile' && (
          <form onSubmit={handleSaveProfile} className={styles.form}>

            {/* Thème */}
            <div className={styles.field}>
              <label className={styles.label}>Apparence</label>
              <div className={styles.themeToggle}>
                <button
                  type="button"
                  className={`${styles.themeBtn} ${theme === 'light' ? styles.themeActive : ''}`}
                  onClick={() => theme !== 'light' && toggleTheme()}
                >
                  ☀️ Clair
                </button>
                <button
                  type="button"
                  className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeActive : ''}`}
                  onClick={() => theme !== 'dark' && toggleTheme()}
                >
                  🌙 Sombre
                </button>
              </div>
            </div>

            {/* Avatar */}
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrap} onClick={() => fileRef.current?.click()}>
                {preview ? (
                  <img src={preview} alt="avatar" className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarFallback}>
                    {form.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className={styles.avatarOverlay}>📷</div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <p className={styles.avatarHint}>Clique pour changer</p>
            </div>

            {/* Username */}
            <div className={styles.field}>
              <label className={styles.label}>Nom d'utilisateur</label>
              <input className="input" name="username" value={form.username}
                onChange={handleChange} required />
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className="input" type="email" name="email" value={form.email}
                onChange={handleChange} required />
            </div>

            {error   && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.successMsg}>{success}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%' }}>
              {loading ? <span className="spinner" /> : 'Sauvegarder'}
            </button>
          </form>
        )}

        {/* ── Tab Mot de passe ── */}
        {tab === 'password' && (
          <form onSubmit={handleSavePassword} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Mot de passe actuel</label>
              <input className="input" type="password" name="currentPassword"
                value={passForm.currentPassword} onChange={handlePassChange}
                placeholder="••••••••" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Nouveau mot de passe</label>
              <input className="input" type="password" name="newPassword"
                value={passForm.newPassword} onChange={handlePassChange}
                placeholder="••••••••" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirmer</label>
              <input className="input" type="password" name="confirmPassword"
                value={passForm.confirmPassword} onChange={handlePassChange}
                placeholder="••••••••" required />
            </div>

            {error   && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.successMsg}>{success}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%' }}>
              {loading ? <span className="spinner" /> : 'Changer le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}