const express = require('express')
const multer = require('multer')
const cloudinary = require('../config/cloudinary')

const router = express.Router()

// تخزين الملف مؤقتاً في الـ Memory لسرعة الرفع
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // حد أقصى 25 ميجابايت للملف
})

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // رفع الملف لـ Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'course_sessions_pdfs', // اسم الفولدر على Cloudinary
        resource_type: 'auto', // يتعرف تلقائياً على صيغة الـ PDF
      },
      (error, result) => {
        if (error) {
          return res
            .status(500)
            .json({ message: 'Cloudinary upload failed: ' + error.message })
        }

        // إرجاع الرابط المباشر والاسم الأصلي للملف
        res.status(200).json({
          url: result.secure_url,
          name: req.file.originalname,
        })
      },
    )

    uploadStream.end(req.file.buffer)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
