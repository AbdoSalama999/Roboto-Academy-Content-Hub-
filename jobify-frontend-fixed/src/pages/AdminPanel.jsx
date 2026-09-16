import React, { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/CourseDetailsPage.css'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5555/api'

function AdminPanel() {
  // 📌 حالة التحكم في التبويب النشط (courses | reports)
  const [activeTab, setActiveTab] = useState('courses')

  // --- States خاصة بإدارة الكورسات والسيشنات ---
  const [tracks, setTracks] = useState([])
  const [selectedTrackId, setSelectedTrackId] = useState('')
  const [courses, setCourses] = useState([])
  const [courseTitle, setCourseTitle] = useState('')

  const [selectedCourseTitle, setSelectedCourseTitle] = useState('')
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')

  const [pdfFile, setPdfFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const [checkpoints, setCheckpoints] = useState([
    { text: '', completed: false },
  ])
  const [message, setMessage] = useState(null)

  // --- States خاصة بالتقارير والإحصائيات للأدمن ---
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [reports, setReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [selectedInstructorStats, setSelectedInstructorStats] = useState(null)

  // دالة جلب الـ Token بسهولة
  const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  }

  // جلب التراكات والكورسات عند التحميل الأول
  useEffect(() => {
    const config = getAuthHeader()

    axios
      .get(`${API_BASE_URL}/tracks`, config)
      .then((res) => setTracks(res.data.data || []))
      .catch((err) => console.error('Error fetching tracks:', err))

    axios
      .get(`${API_BASE_URL}/courses`, config)
      .then((res) => setCourses(res.data.data || []))
      .catch((err) => console.error('Error fetching courses:', err))
  }, [])

  // جلب تقارير اليوم عند اختيار تبويب التقارير أو تغيير التاريخ
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchDayReports()
    }
  }, [activeTab, selectedDate])

  const fetchDayReports = async () => {
    setLoadingReports(true)
    try {
      const res = await axios.get(
        `${API_BASE_URL}/daily-reports/summary?date=${selectedDate}`,
        getAuthHeader(),
      )
      if (res.data?.success) {
        setReports(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching reports:', err)
    } finally {
      setLoadingReports(false)
    }
  }

  // جلب إحصائيات مهندس معين عند الضغط عليه
  const fetchInstructorStats = async (instructorId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/daily-reports/stats/${instructorId}`,
        getAuthHeader(),
      )
      if (res.data?.success) {
        setSelectedInstructorStats(res.data.stats)
      }
    } catch (err) {
      console.error('Error fetching instructor stats:', err)
    }
  }

  // التعامل مع Checkpoints
  const handleAddCheckpoint = () => {
    setCheckpoints([...checkpoints, { text: '', completed: false }])
  }

  const handleRemoveCheckpoint = (index) => {
    const list = [...checkpoints]
    list.splice(index, 1)
    setCheckpoints(list)
  }

  const handleCheckpointChange = (index, value) => {
    const list = [...checkpoints]
    list[index].text = value
    setCheckpoints(list)
  }

  // 1. إنشاء كورس جديد
  const handleCreateCourse = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(
        `${API_BASE_URL}/courses`,
        {
          title: courseTitle,
          trackId: selectedTrackId,
        },
        getAuthHeader(),
      )
      setMessage({ type: 'success', text: 'Course created successfully! 🎉' })
      setCourseTitle('')
      if (res.data?.data) {
        setCourses((prev) => [...prev, res.data.data])
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create course',
      })
    }
  }

  // 2. إضافة سيشن ورخص PDF
  const handleAddSession = async (e) => {
    e.preventDefault()
    try {
      const foundCourse = courses.find(
        (course) =>
          course.title.trim().toLowerCase() ===
          selectedCourseTitle.trim().toLowerCase(),
      )

      if (!foundCourse) {
        return setMessage({
          type: 'error',
          text: 'Course not found! Please select a valid course.',
        })
      }

      let uploadedFiles = []

      if (pdfFile) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', pdfFile)

        const token = localStorage.getItem('token')
        const uploadRes = await axios.post(
          `${API_BASE_URL}/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        )

        uploadedFiles.push({
          name: uploadRes.data.name,
          url: uploadRes.data.url,
        })
        setIsUploading(false)
      }

      const formattedCheckpoints = checkpoints
        .filter((cp) => cp.text.trim() !== '')
        .map((cp) => ({ text: cp.text.trim(), completed: false }))

      await axios.post(
        `${API_BASE_URL}/courses/${foundCourse._id}/sessions`,
        {
          title: sessionTitle,
          notes: sessionNotes,
          files: uploadedFiles,
          checkpoints: formattedCheckpoints,
        },
        getAuthHeader(),
      )

      setMessage({
        type: 'success',
        text: 'Session and PDF uploaded successfully! 📚',
      })
      setSessionTitle('')
      setSessionNotes('')
      setPdfFile(null)
      if (document.getElementById('pdfInput')) {
        document.getElementById('pdfInput').value = ''
      }
      setCheckpoints([{ text: '', completed: false }])
    } catch (err) {
      setIsUploading(false)
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to add session',
      })
    }
  }

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '40px auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>⚙️ Instructor & Admin Management Panel</h1>

      {/* 📌 أزرار التنقل بين التبويبات (Tabs) */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <button
          onClick={() => setActiveTab('courses')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'courses' ? '#2980b9' : '#ecf0f1',
            color: activeTab === 'courses' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          📚 Courses & Sessions
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'reports' ? '#2980b9' : '#ecf0f1',
            color: activeTab === 'reports' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          📊 Instructors Daily Reports
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
          }}
        >
          {message.text}
        </div>
      )}

      {/* ==================== TAB 1: COURSES & SESSIONS ==================== */}
      {activeTab === 'courses' && (
        <div>
          {/* إضافة كورس */}
          <section
            style={{
              border: '1px solid #ddd',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '30px',
            }}
          >
            <h2>➕ Add New Course</h2>
            <form onSubmit={handleCreateCourse}>
              <div style={{ marginBottom: '15px' }}>
                <label>Select Track:</label>
                <select
                  value={selectedTrackId}
                  onChange={(e) => setSelectedTrackId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value=''>-- Choose Track --</option>
                  {tracks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Course Title:</label>
                <input
                  type='text'
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder='e.g. Full-Stack Web Development'
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>

              <button
                type='submit'
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#27ae60',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Create Course
              </button>
            </form>
          </section>

          {/* إضافة سيشن */}
          <section
            style={{
              border: '1px solid #ddd',
              padding: '20px',
              borderRadius: '8px',
            }}
          >
            <h2>📝 Add New Session & Material</h2>
            <form onSubmit={handleAddSession}>
              <div style={{ marginBottom: '15px' }}>
                <label>Course Title:</label>
                <select
                  value={selectedCourseTitle}
                  onChange={(e) => setSelectedCourseTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value=''>-- Select Course --</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course.title}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Session Title:</label>
                <input
                  type='text'
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder='e.g. Session 1: React Fundamentals'
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Session Notes:</label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder='Write session summary...'
                  rows='3'
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold' }}>
                  📌 Session Checkpoints:
                </label>
                <div style={{ marginTop: '8px' }}>
                  {checkpoints.map((cp, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '10px',
                        marginBottom: '8px',
                      }}
                    >
                      <input
                        type='text'
                        value={cp.text}
                        onChange={(e) =>
                          handleCheckpointChange(idx, e.target.value)
                        }
                        placeholder={`Topic #${idx + 1}`}
                        style={{ flex: 1, padding: '8px' }}
                      />
                      {checkpoints.length > 1 && (
                        <button
                          type='button'
                          onClick={() => handleRemoveCheckpoint(idx)}
                          style={{
                            backgroundColor: '#e74c3c',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0 12px',
                            cursor: 'pointer',
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type='button'
                    onClick={handleAddCheckpoint}
                    style={{
                      backgroundColor: '#2ec4b6',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold',
                    }}
                  >
                    + Add Checkpoint Topic
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold' }}>
                  📄 Upload Session PDF File:
                </label>
                <input
                  id='pdfInput'
                  type='file'
                  accept='application/pdf'
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  style={{ display: 'block', marginTop: '8px' }}
                />
              </div>

              <button
                type='submit'
                disabled={isUploading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isUploading ? '#95a5a6' : '#2980b9',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                }}
              >
                {isUploading ? 'Uploading PDF to Cloud...' : 'Add Session'}
              </button>
            </form>
          </section>
        </div>
      )}

      {/* ==================== TAB 2: INSTRUCTORS REPORTS ==================== */}
      {activeTab === 'reports' && (
        <div>
          <section
            style={{
              border: '1px solid #ddd',
              padding: '20px',
              borderRadius: '8px',
              background: '#fafafa',
            }}
          >
            <h2>📋 Daily Instructor Reports Summary</h2>

            {/* فلتر التاريخ */}
            <div style={{ margin: '15px 0' }}>
              <label style={{ fontWeight: 'bold' }}>Select Date: </label>
              <input
                type='date'
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  marginLeft: '10px',
                }}
              />
            </div>

            {loadingReports ? (
              <p>Loading reports...</p>
            ) : reports.length === 0 ? (
              <p style={{ color: '#7f8c8d' }}>
                No reports submitted on this date.
              </p>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                }}
              >
                {reports.map((rep) => (
                  <div
                    key={rep._id}
                    style={{
                      background: '#fff',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <h3 style={{ margin: 0, color: '#2c3e50' }}>
                        👨‍🏫 Instructor: {rep.instructorName}
                      </h3>
                      {rep.instructorId && (
                        <button
                          onClick={() => fetchInstructorStats(rep.instructorId)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#8e44ad',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          📈 View Instructor Overall Stats
                        </button>
                      )}
                    </div>

                    <p style={{ margin: '8px 0', fontSize: '14px' }}>
                      <strong>Sessions Count:</strong>{' '}
                      {rep.sessions?.length || 0}
                    </p>

                    <div style={{ marginTop: '10px' }}>
                      <strong>Session Details:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {rep.sessions?.map((s, idx) => (
                          <li key={idx} style={{ fontSize: '14px' }}>
                            <strong>{s.technology}</strong> - {s.sessionName} (
                            {s.students?.length || 0} students evaluated)
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* نافذة الإحصائيات الشاملة للمهندس عند طلبها */}
          {selectedInstructorStats && (
            <section
              style={{
                marginTop: '20px',
                border: '1px solid #8e44ad',
                padding: '20px',
                borderRadius: '8px',
                background: '#fcf8ff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h3 style={{ color: '#8e44ad', margin: 0 }}>
                  📈 Overall Instructor Stats
                </h3>
                <button
                  onClick={() => setSelectedInstructorStats(null)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  margin: '15px 0',
                  fontSize: '15px',
                }}
              >
                <div>
                  📁 Total Reports:{' '}
                  <strong>{selectedInstructorStats.totalReports}</strong>
                </div>
                <div>
                  🎯 Total Sessions:{' '}
                  <strong>{selectedInstructorStats.totalSessions}</strong>
                </div>
                <div>
                  👥 Total Students Evaluated:{' '}
                  <strong>{selectedInstructorStats.totalStudents}</strong>
                </div>
              </div>

              <h4 style={{ marginBottom: '8px' }}>
                Average Student Ratings Across All Sessions:
              </h4>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li>
                  🛠️ Technical:{' '}
                  <strong>
                    {selectedInstructorStats.averages?.technical || 0} / 5
                  </strong>
                </li>
                <li>
                  💻 Programming:{' '}
                  <strong>
                    {selectedInstructorStats.averages?.programming || 0} / 5
                  </strong>
                </li>
                <li>
                  🧠 Attention:{' '}
                  <strong>
                    {selectedInstructorStats.averages?.attention || 0} / 5
                  </strong>
                </li>
                <li>
                  ⭐ Behavior:{' '}
                  <strong>
                    {selectedInstructorStats.averages?.behavior || 0} / 5
                  </strong>
                </li>
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminPanel
