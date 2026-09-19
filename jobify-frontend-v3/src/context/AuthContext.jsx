import React, { createContext, useContext, useState } from 'react'

// 1. Create Context
const AuthContext = createContext()

// 2. Create Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null
  })

  const loginSuccess = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)

    // 💾 حفظ البيانات الأساسية والـ Role بشكل صريح
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userToken)
    if (userData && userData.role) {
      localStorage.setItem('role', userData.role)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('role') // 🧹 مسح الـ role عند الخروج
  }

  return (
    <AuthContext.Provider value={{ user, token, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
