const express = require('express')
const path = require('path')
const cors = require('cors')
const connectDB = require('./config/config')
const tracksRoutes = require('./routes/tracksRoutes')
const courseRoutes = require('./routes/courseRoutes')
const uploadRouter = require('./routes/upload')
const authRoutes = require('./routes/authRoutes')
const reportsRoutes = require('./routes/dailyReport')
require('dotenv').config()

const app = express()

// 1. Database Connection Middleware (ضمان الاتصال في بيئة Serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({ message: 'Database connection failed' })
  }
})

// 2. Middlewares
app.use(express.json())
app.use(cors())

// 3. API Routes
app.use('/api/tracks', tracksRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/upload', uploadRouter)
app.use('/api/auth', authRoutes)
app.use('/api/daily-reports', reportsRoutes)

// 4. Static Files (تحديد المسار المباشر لمجلد public)
const publicPath = path.join(__dirname, 'public')
app.use(express.static(publicPath))

// 5. SPA Catch-All Route (توجيه كافة الصفحات الأخرى لـ index.html)
app.get('*', (req, res) => {
  // إذا كان الطلب يبدأ بـ /api ولم يجد المسار، يرجع 404 بدلاً من index.html
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API Route Not Found' })
  }
  res.sendFile(path.join(publicPath, 'index.html'))
})

// 6. Local Server Only (للتشغيل المحلي)
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5000
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

module.exports = app
