

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/auth.js'
import { getToken } from '../services/auth.js'
import styles from './Auth.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form)
      console.log('✅ Login response:', data)
      console.log('✅ Token saved:', getToken())
      navigate('/', { replace: true })
    } catch (err) {
      console.error('❌ Login error:', err)
      setError(err.response?.data?.error || err.response?.data?.message || 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={`${styles.card} fade-in`}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>💬</span>
          <h1 className={styles.logoText}>Talky</h1>
        </div>

        <p className={styles.subtitle}>Bon retour 👋</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Nom d'utilisateur</label>
            <input
              className="input"
              type="text"
              name="username"
              placeholder="votre_pseudo"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Mot de passe</label>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: 4 }}
          >
            {loading ? <span className="spinner" /> : 'Se connecter'}
          </button>
        </form>

        <p className={styles.switch}>
          Pas encore de compte ?{' '}
          <Link to="/register" className={styles.link}>S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}