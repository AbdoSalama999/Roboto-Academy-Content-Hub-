import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/CourseDetailsPage.css'

function CourseDetailsPage() {
  const { courseId: id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  // 🟢 جلب الـ API Base URL من ملف الـ .env (مع تحديد localhost كبديل للتطوير المحلي)
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5555/api'

  useEffect(() => {
    if (!id || id === 'undefined') {
      console.warn('Invalid or missing Course ID param:', id)
      setLoading(false)
      return
    }

    setLoading(true)
    axios
      .get(`${API_BASE_URL}/courses/${id}`)
      .then((res) => {
        setCourse(res.data.data || res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load course details:', err)
        setLoading(false)
      })
  }, [id, API_BASE_URL])

  const handleToggleCheckpoint = async (
    sessionId,
    checkpointId,
    cpIndex,
    currentStatus,
  ) => {
    const updatedStatus = !currentStatus
    const previousCourse = course

    setCourse((prevCourse) => {
      if (!prevCourse) return prevCourse
      const updatedSessions = prevCourse.sessions.map((session) => {
        if (session._id === sessionId) {
          const updatedCheckpoints = session.checkpoints.map((cp, idx) => {
            const isTarget = cp._id ? cp._id === checkpointId : idx === cpIndex
            if (isTarget) {
              if (typeof cp === 'object' && cp !== null) {
                return { ...cp, completed: updatedStatus }
              }
              return { text: cp, completed: updatedStatus }
            }
            return cp
          })
          return { ...session, checkpoints: updatedCheckpoints }
        }
        return session
      })
      return { ...prevCourse, sessions: updatedSessions }
    })

    try {
      const targetCpId = checkpointId ?? cpIndex
      const token = localStorage.getItem('token')

      const config = {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }

      await axios.patch(
        `${API_BASE_URL}/courses/${id}/sessions/${sessionId}/checkpoints/${targetCpId}`,
        { completed: updatedStatus },
        config,
      )
    } catch (error) {
      console.error('Failed to update checkpoint status on server:', error)
      setCourse(previousCourse)
    }
  }

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
        <button className='back-btn' onClick={() => navigate('/')}>
          ← Back to Tracks
        </button>
      </div>
    )
  }

  return (
    <div className='course-details-container'>
      {/* Top Header Nav */}
      <div className='header-nav'>
        <button className='back-btn' onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <h1 className='course-title'>{course.title}</h1>

      <div style={{ marginTop: '30px' }}>
        <h2 className='section-title'>📚 Sessions & Syllabus</h2>

        {course.sessions && course.sessions.length > 0 ? (
          <div className='sessions-list'>
            {course.sessions.map((session, sIdx) => (
              <div
                key={session._id || `session-${sIdx}`}
                className='session-card'
              >
                <h3 className='session-card-title'>{session.title}</h3>

                {session.notes && (
                  <p className='session-notes'>{session.notes}</p>
                )}

                {/* Checkpoints Section */}
                {session.checkpoints && session.checkpoints.length > 0 && (
                  <div className='checkpoints-section'>
                    <h4 className='checkpoints-title'>
                      📌 Session Checkpoints:
                    </h4>
                    <div className='checkpoints-grid'>
                      {session.checkpoints.map((cp, cpIdx) => {
                        const isCompleted =
                          typeof cp === 'object' ? Boolean(cp.completed) : false
                        const cpText = typeof cp === 'object' ? cp.text : cp
                        const checkpointKey = cp._id || `cp-${sIdx}-${cpIdx}`

                        return (
                          <label
                            key={checkpointKey}
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
                                  cp._id,
                                  cpIdx,
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
                              className='btn open-file-btn'
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
        ) : (
          <p className='no-sessions-text'>
            No sessions added to this course yet.
          </p>
        )}
      </div>
    </div>
  )
}

export default CourseDetailsPage
