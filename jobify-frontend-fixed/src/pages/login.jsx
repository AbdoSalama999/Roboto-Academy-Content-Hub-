import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

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
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
          Account Login
        </h2>

        {errorMessage && <div style={styles.errorBox}>{errorMessage}</div>}

        <div style={styles.inputGroup}>
          <label style={{ fontWeight: '500', fontSize: '14px' }}>
            Email Address
          </label>
          <input
            type='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='name@academy.com'
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={{ fontWeight: '500', fontSize: '14px' }}>
            Password
          </label>
          <input
            type='password'
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='••••••••'
            style={styles.input}
          />
        </div>

        <button type='submit' disabled={loading} style={styles.button}>
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
  },
  card: {
    width: '360px',
    padding: '32px 24px',
    borderRadius: '10px',
    boxShadow:
      '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    textAlign: 'left',
  },
  inputGroup: { marginBottom: '16px' },
  input: {
    width: '100%',
    padding: '10px 12px',
    marginTop: '6px',
    boxSizing: 'border-box',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px',
    marginTop: '8px',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '10px 12px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
    border: '1px solid #f87171',
  },
}
