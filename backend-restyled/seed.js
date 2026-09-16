// backend/seedTracks.js
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

// استدعاء موديل التراك
const Track = require('./models/Track') // تأكد من صحة مسار الموديل عندك

const tracks = [
  {
    name: 'Junior & Block-Based Coding',
    description:
      'Learn fundamental programming logic, game physics, and problem-solving through ScratchJr, Scratch 3.0, and interactive block tools.',
  },
  {
    name: 'Robotics & Hardware Engineering',
    description:
      'Design and program physical robots using Arduino microcontrollers, sensors, motor drivers, circuit simulations, and C++.',
  },
  {
    name: 'Python, AI & Data Science',
    description:
      'Master Python programming from core concepts to Advanced AI, Computer Vision, Natural Language Processing (NLP), and Machine Learning models.',
  },
  {
    name: 'Full-Stack Web Development',
    description:
      'Build responsive modern web applications using HTML5, CSS3, JavaScript, React.js, Node.js, Express, and MongoDB.',
  },
  {
    name: '3D Game Development (Unity & Roblox)',
    description:
      'Create immersive 2D and 3D games using Unity with C# scripting and Roblox Studio with Lua.',
  },
  {
    name: 'Mobile App Development',
    description:
      'Build cross-platform mobile apps for Android and iOS using Flutter, Dart, and Firebase.',
  },
]

const seedTracks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL)
    console.log('⚡ MongoDB Connected...')

    // تنظيف جدول التراكات القديمة
    await Track.deleteMany({})

    // إدخال التراكات الـ 6 الجديدة
    const createdTracks = await Track.insertMany(tracks)
    console.log('✅ All 6 Tracks added successfully to MongoDB!\n')

    console.log(
      '📋 قائمة التراكات وأكوادها (Track IDs) لاستخدامها عند إضافة الكورسات:',
    )
    createdTracks.forEach((track) => {
      console.log(`• ${track.name} => ID: ${track._id}`)
    })

    process.exit()
  } catch (error) {
    console.error('❌ Error uploading tracks:', error)
    process.exit(1)
  }
}

seedTracks()
