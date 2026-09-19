import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const role = localStorage.getItem('role')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <header className='main-navbar'>
      <div className='nav-content'>
        {/* اللوجو واسم الأكاديمية */}
        <NavLink to='/' className='brand-logo'>
          <div className='logo-badge'>R</div>
          <span className='brand-title'>
            Roboto <span className='brand-accent'>Academy</span>
          </span>
        </NavLink>

        {/* روابط التنقل الرئيسية */}
        <nav className='nav-menu'>
          <NavLink
            to='/'
            end
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            📚 Tracks
          </NavLink>

          {/* 📝 رابط كتابة التقرير اليومي للمهندسين */}
          <NavLink
            to='/daily-report'
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            📝 Daily Report
          </NavLink>

          {/* 👑 روابط خاصة بالأدمن فقط */}
          {role === 'admin' && (
            <>
              <NavLink
                to='/admin'
                end
                className={({ isActive }) =>
                  isActive
                    ? 'nav-item admin-badge active'
                    : 'nav-item admin-badge'
                }
              >
                ⚙️ Admin Panel
              </NavLink>

              <NavLink
                to='/admin/reports'
                className={({ isActive }) =>
                  isActive
                    ? 'nav-item admin-badge active'
                    : 'nav-item admin-badge'
                }
              >
                📊 View Reports
              </NavLink>
            </>
          )}
        </nav>

        {/* إجراءات الحساب وتسجيل الخروج */}
        <div className='nav-actions'>
          {role ? (
            <>
              <span
                className={`user-role-pill ${role === 'admin' ? 'role-admin' : 'role-user'}`}
              >
                {role.toUpperCase()}
              </span>
              <button onClick={handleLogout} className='btn-logout'>
                🚪 Logout
              </button>
            </>
          ) : (
            <NavLink to='/login' className='btn-login'>
              🔑 Login
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
