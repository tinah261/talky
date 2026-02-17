import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login    from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home     from './pages/Home.jsx'
import { getToken } from './services/auth.js'

function PrivateRoute({ children }) {
  const token = getToken()
  console.log('PrivateRoute - token:', token ? 'présent' : 'absent')
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const token = getToken()
  return !token ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/"         element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}