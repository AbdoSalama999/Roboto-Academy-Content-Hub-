import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

function Home() {
  return (
    <div className='app-container'>
      {/* استدعاء مكون ה-Navbar المستقل */}
      <Navbar />

      {/* المحتوى الداخلي لجميع الصفحات */}
      <main className='main-body'>
        <Outlet />
      </main>
    </div>
  )
}

export default Home
