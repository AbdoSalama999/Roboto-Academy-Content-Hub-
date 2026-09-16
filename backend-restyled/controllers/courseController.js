const mongoose = require('mongoose')
const Course = require('../models/Course')
const Track = require('../models/Track')

// دالة مساعدة للتحقق من صحة Mongoose ObjectId
const isValidObjectId = (id) => {
  return id && id !== 'undefined' && mongoose.Types.ObjectId.isValid(id)
}

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private / Admin
exports.createCourse = async (req, res) => {
  try {
    const { trackId, title, sessions } = req.body

    if (!trackId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both trackId and title.',
      })
    }

    if (!isValidObjectId(trackId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Track ID format.',
      })
    }

    const track = await Track.findById(trackId)
    if (!track) {
      return res.status(404).json({
        success: false,
        message: 'The associated track was not found.',
      })
    }

    const newCourse = new Course({
      title,
      trackId,
      sessions: sessions || [],
    })

    await newCourse.save()
    res.status(201).json({ success: true, data: newCourse })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get all courses (Lightweight list without deep sessions data)
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().select('title trackId createdAt')

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get single course details with all sessions & files
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing Course ID parameter.',
      })
    }

    const course = await Course.findById(id).populate({
      path: 'trackId',
      select: 'name description',
    })

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      })
    }

    res.status(200).json({
      success: true,
      data: course,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Add a new session to a course
// @route   POST /api/courses/:id/sessions
// @access  Private / Admin
exports.addSessionToCourse = async (req, res) => {
  try {
    const { id } = req.params
    const { title, notes, files, checkpoints } = req.body

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Course ID parameter.',
      })
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Session title is required.',
      })
    }

    const course = await Course.findById(id)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      })
    }

    course.sessions.push({
      title,
      notes: notes || '',
      files: files || [],
      checkpoints: checkpoints || [],
    })

    await course.save()

    res.status(200).json({
      success: true,
      data: course,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private / Admin
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Course ID parameter.',
      })
    }

    const course = await Course.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      })
    }

    res.status(200).json({
      success: true,
      data: course,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private / Admin
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Course ID parameter.',
      })
    }

    const course = await Course.findByIdAndDelete(id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully.',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get all sessions for a course
// @route   GET /api/courses/:id/sessions
// @access  Public
exports.getCourseSessions = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Course ID parameter.',
      })
    }

    const course = await Course.findById(id).select('title sessions')

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      })
    }

    res.status(200).json({
      success: true,
      courseTitle: course.title,
      count: course.sessions.length,
      data: course.sessions,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update checkpoints status
// @route   PATCH /api/courses/:id/sessions/:sessionId/checkpoints/:checkpointId
// @access  Private / Instructor
exports.updateCheckpoints = async (req, res) => {
  try {
    const id = req.params.id || req.params.courseId
    const { sessionId, checkpointId } = req.params
    const { completed, checkpoints } = req.body

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Course ID parameter.',
      })
    }

    const course = await Course.findById(id)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      })
    }

    const session = course.sessions.id(sessionId)
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found.',
      })
    }

    // 1️⃣ تحديث كامل المصفوفة إذا تم إرسالها
    if (checkpoints && Array.isArray(checkpoints)) {
      session.checkpoints = checkpoints
    }
    // 2️⃣ تحديث Checkpoint مفرد (ObjectId أو Index)
    else if (checkpointId !== undefined) {
      let checkpoint = session.checkpoints.id(checkpointId)

      if (!checkpoint && !isNaN(checkpointId)) {
        checkpoint = session.checkpoints[parseInt(checkpointId, 10)]
      }

      if (!checkpoint) {
        return res.status(404).json({
          success: false,
          message: 'Checkpoint not found.',
        })
      }

      checkpoint.completed =
        typeof completed === 'boolean' ? completed : !checkpoint.completed
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide completed status or checkpoints array.',
      })
    }

    // إعلام Mongoose بالتعديل لضمان حفظ الـ Subdocuments
    course.markModified('sessions')
    await course.save()

    return res.status(200).json({ success: true, data: course })
  } catch (error) {
    console.error('Error updating checkpoint:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
