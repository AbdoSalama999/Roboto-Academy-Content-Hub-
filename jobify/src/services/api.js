import axios from 'axios'

const API_URL = 'http://localhost:5555/api'

// دالة جلب بيانات التراكات (مع إرسال التوكن في الـ Header)
export const getTracks = async () => {
  const token = localStorage.getItem('token')

  const response = await axios.get(`${API_URL}/tracks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

// دالة جلب بيانات المستخدم المسجل حالياً
export const getCurrentUser = async () => {
  const token = localStorage.getItem('token')

  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}
