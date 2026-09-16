import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom'

// استيراد الصفحات المطلوبة
import Login from './pages/login'
import Home from './pages/home'
import TracksPage from './pages/TracksPage'
import CourseDetailsPage from './pages/CourseDetailsPage'
import AdminPanel from './pages/AdminPanel'
import DailyReportForm from './components/DailyReportForm'
// 📊 استيراد صفحة عرض التقارير للأدمن
import AdminReportsView from './components/AdminReportsView'

// 🛡️ 1. حماية أي مستخدم مسجل دخول
const ProtectedRoute = () => {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to='/login' replace />
  }

  return <Outlet />
}

// 🛡️ 2. حماية صفحة الأدمن فقط
const AdminRoute = () => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (!token) {
    return <Navigate to='/login' replace />
  }

  if (role !== 'admin') {
    return <Navigate to='/' replace />
  }

  return <Outlet />
}

function App() {
  const router = createBrowserRouter([
    // 🔓 صفحة تسجيل الدخول
    {
      path: '/login',
      element: <Login />,
    },

    // 🔒 كافة مسارات التطبيق
    {
      path: '/',
      element: <ProtectedRoute />,
      errorElement: (
        <div className='error-container'>
          <h2>🚨 Something went wrong!</h2>
          <a href='/login' className='error-btn'>
            Return to Login
          </a>
        </div>
      ),
      children: [
        {
          element: <Home />,
          children: [
            // 1️⃣ صفحة التراكس الرئيسية
            {
              index: true,
              element: <TracksPage />,
            },

            // 2️⃣ صفحة تفاصيل الكورس
            {
              path: 'courses/:courseId',
              element: <CourseDetailsPage />,
            },

            // 📝 3️⃣ صفحة كتابة التقرير اليومي للمهندسين
            {
              path: 'daily-report',
              element: <DailyReportForm />,
            },

            // 👑 4️⃣ مسارات الأدمن المحمية
            {
              path: 'admin',
              element: <AdminRoute />,
              children: [
                {
                  index: true,
                  element: <AdminPanel />,
                },
                // 📊 صفحة عرض وتقارير الأدمن (/admin/reports)
                {
                  path: 'reports',
                  element: <AdminReportsView />,
                },
              ],
            },
          ],
        },
      ],
    },

    // 🛑 توجيه أي مسار خاطئ للـ Login
    {
      path: '*',
      element: <Navigate to='/login' replace />,
    },
  ])

  return <RouterProvider router={router} />
}

export default App
