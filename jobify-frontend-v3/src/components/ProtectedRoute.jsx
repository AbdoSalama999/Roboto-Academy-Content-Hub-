import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = ({ allowedRoles }) => {
  // 1. جلب بيانات التوكن والـ Role من LocalStorage (أو Context لو شغال بيه)
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role') // مثل: 'admin' أو 'student' / 'user'

  // 2. لو مش عامل تسجيل دخول -> ارجع لصفحة اللوجن فوراً
  if (!token) {
    return <Navigate to='/login' replace />
  }

  // 3. لو محددين Roles معينة للصفحة، واليوزر معندوش صلاحية -> ارجع للصفحة الرئيسية أو ارفض الدخول
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to='/tracks' replace />
  }

  // 4. لو كل حاجة تمام -> اعرض الصفحة المطلوب الوصول لها
  return <Outlet />
}

export default ProtectedRoute
