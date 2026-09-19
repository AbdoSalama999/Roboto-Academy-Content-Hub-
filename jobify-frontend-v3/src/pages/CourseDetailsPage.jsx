import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/CourseDetailsPage.css'

function CourseDetailsPage() {
  const { courseId: id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionSearch, setSessionSearch] = useState('')
  // 🟢 مفاتيح الـ checkpoints المكتملة الخاصة بالمستخدم الحالي فقط (sessionId:checkpointId)
  const [completedKeys, setCompletedKeys] = useState(new Set())

  // 🟢 جلب الـ API Base URL من ملف الـ .env (مع تحديد localhost كبديل للتطوير المحلي)
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5555/api'

  const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  }

  useEffect(() => {
    if (!id || id === 'undefined') {
      console.warn('Invalid or missing Course ID param:', id)
      setLoading(false)
      return
    }

    setLoading(true)

    Promise.all([
      axios.get(`${API_BASE_URL}/courses/${id}`),
      // تقدّم المستخدم الحالي وحده في هذا الكورس
      axios
        .get(`${API_BASE_URL}/progress/${id}`, getAuthHeader())
        .catch(() => ({ data: { completed: [] } })),
    ])
      .then(([courseRes, progressRes]) => {
        setCourse(courseRes.data.data || courseRes.data)
        setCompletedKeys(new Set(progressRes.data.completed || []))
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load course details:', err)
        setLoading(false)
      })
  }, [id, API_BASE_URL])

  // ✅ تبديل حالة checkpoint خاصة بالمستخدم الحالي فقط (مش مشتركة مع باقي المستخدمين)
  const handleToggleCheckpoint = async (sessionId, checkpointId, currentStatus) => {
    if (!checkpointId) return
    const key = `${sessionId}:${checkpointId}`
    const updatedStatus = !currentStatus

    setCompletedKeys((prev) => {
      const next = new Set(prev)
      if (updatedStatus) next.add(key)
      else next.delete(key)
      return next
    })

    try {
      await axios.patch(
        `${API_BASE_URL}/progress/${id}/sessions/${sessionId}/checkpoints/${checkpointId}`,
        { completed: updatedStatus },
        getAuthHeader(),
      )
    } catch (error) {
      console.error('Failed to update personal progress on server:', error)
      // رجوع للحالة القديمة لو فشل الحفظ
      setCompletedKeys((prev) => {
        const next = new Set(prev)
        if (currentStatus) next.add(key)
        else next.delete(key)
        return next
      })
    }
  }

  // 📥 تسجيل نشاط تحميل الملف (يظهر بعدين للأدمن في ملخص التحميلات)
  const handleFileDownloadLog = (sessionTitle, fileName) => {
    axios
      .post(
        `${API_BASE_URL}/activity`,
        {
          action: 'download',
          courseId: id,
          courseTitle: course?.title,
          sessionTitle,
          fileName,
        },
        getAuthHeader(),
      )
      .catch((err) => console.error('Failed to log download activity:', err))
  }

  const filteredSessions = useMemo(() => {
    const sessions = course?.sessions || []
    if (!sessionSearch.trim()) return sessions
    const q = sessionSearch.trim().toLowerCase()
    return sessions.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q),
    )
  }, [course, sessionSearch])

  if (loading) {
    return (
      <div className='status-box'>
        <h3>Loading course details... ⏳</h3>
      </div>
    )
  }

  if (!course) {
    return (
      <div className='status-box status-box-error'>
        <h3>Course not found! ❌</h3>
        <button className='btn btn-ghost' onClick={() => navigate('/')}>
          ← Back to Tracks
        </button>
      </div>
    )
  }

  return (
    <div className='page-shell course-details-container'>
      {/* Top Header Nav */}
      <div className='header-nav'>
        <button className='btn btn-ghost' onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <h1 className='course-title'>{course.title}</h1>

      <div className='sessions-block'>
        <div className='sessions-head'>
          <h2 className='section-title'>📚 Sessions & Syllabus</h2>

          {course.sessions && course.sessions.length > 0 && (
            <div className='search-box session-search'>
              <span className='search-icon'>🔍</span>
              <input
                type='text'
                className='input'
                placeholder='Search sessions by title or notes...'
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {!course.sessions || course.sessions.length === 0 ? (
          <p className='no-sessions-text'>
            No sessions added to this course yet.
          </p>
        ) : filteredSessions.length === 0 ? (
          <p className='no-sessions-text'>
            No sessions match “{sessionSearch}”.
          </p>
        ) : (
          <div className='sessions-list'>
            {filteredSessions.map((session, sIdx) => (
              <div
                key={session._id || `session-${sIdx}`}
                className='session-card card'
              >
                <h3 className='session-card-title'>{session.title}</h3>

                {session.notes && (
                  <p className='session-notes'>{session.notes}</p>
                )}

                {/* Checkpoints Section — خاصة بالمستخدم الحالي فقط */}
                {session.checkpoints && session.checkpoints.length > 0 && (
                  <div className='checkpoints-section'>
                    <h4 className='checkpoints-title'>
                      📌 Your Personal Checkpoints:
                    </h4>
                    <div className='checkpoints-grid'>
                      {session.checkpoints.map((cp, cpIdx) => {
                        const checkpointId = cp._id
                        const key = `${session._id}:${checkpointId}`
                        const isCompleted = completedKeys.has(key)
                        const cpText = typeof cp === 'object' ? cp.text : cp

                        return (
                          <label
                            key={checkpointId || `cp-${sIdx}-${cpIdx}`}
                            className={`checkpoint-label ${
                              isCompleted ? 'completed' : ''
                            }`}
                          >
                            <input
                              type='checkbox'
                              className='checkbox-input'
                              checked={isCompleted}
                              onChange={() =>
                                handleToggleCheckpoint(
                                  session._id,
                                  checkpointId,
                                  isCompleted,
                                )
                              }
                            />
                            <span
                              className={`checkpoint-text ${
                                isCompleted ? 'completed' : ''
                              }`}
                            >
                              {cpText}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Attached Files Section */}
                {session.files && session.files.length > 0 && (
                  <div className='files-section'>
                    <h4 className='files-title'>📄 Session Materials:</h4>
                    <ul className='files-list'>
                      {session.files.map((file, fIdx) => (
                        <li
                          key={file._id || `file-${fIdx}`}
                          className='file-item'
                        >
                          <span className='file-name'>
                            {file.name || 'Download PDF'}
                          </span>
                          <div className='file-actions'>
                            <a
                              href={file.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='btn btn-primary open-file-btn'
                              onClick={() =>
                                handleFileDownloadLog(
                                  session.title,
                                  file.name,
                                )
                              }
                            >
                              View Material
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseDetailsPage
