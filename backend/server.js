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

// 1. Connect to Database
connectDB()

// 2. Middlewares
app.use(express.json())
app.use(cors())

// 3. API Routes
app.use('/api/tracks', tracksRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/upload', uploadRouter)
app.use('/api/auth', authRoutes)
app.use('/api/daily-reports', reportsRoutes)

// 4. Static Files (Serve Frontend Build)
app.use(express.static(path.resolve(__dirname, './public')))

// 5. SPA Catch-All Route (Redirect non-API routes to index.html)
app.get('/*splat', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public', 'index.html'))
})

// 6. Start Server
const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
module.exports = app
