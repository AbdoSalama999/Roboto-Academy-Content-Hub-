import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/Login.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const { loginSuccess } = useAuth()
  const navigate = useNavigate()

  // 🟢 جلب الـ API Base URL من ملف الـ .env (مع تحديد localhost كبديل للتطوير المحلي)
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5555/api'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      // 🟢 استخدام المتغير ديناميكياً بدلاً من الرابط الثابت
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      })

      if (response.data.success) {
        const user = response.data.user
        const token = response.data.token

        // 1️⃣ حفظ التوكن والبيانات في Context و localStorage
        loginSuccess(user, token)

        // 2️⃣ التوجيه ذكياً حسب صلاحية المستخدم (Role)
        if (user.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message)
      } else {
        setErrorMessage('Unable to connect to the server.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='login-container'>
      <form onSubmit={handleSubmit} className='login-card card'>
        <div className='login-brand'>
          <div className='logo-badge'>R</div>
          <h2>Welcome Back</h2>
          <p>Sign in to Roboto Academy</p>
        </div>

        {errorMessage && <div className='banner banner-error'>{errorMessage}</div>}

        <div className='field'>
          <label>Email Address</label>
          <input
            type='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='name@academy.com'
            className='input'
          />
        </div>

        <div className='field'>
          <label>Password</label>
          <input
            type='password'
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='••••••••'
            className='input'
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='btn btn-primary login-btn'
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
