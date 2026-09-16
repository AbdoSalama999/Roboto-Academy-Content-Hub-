import React, { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/AdminPanel.css'

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
    <div className='page-shell admin-panel'>
      <header className='page-header'>
        <span className='eyebrow'>⚙️ Admin Only</span>
        <h1>Management Panel</h1>
        <p>Manage tracks, courses, sessions and instructor reports.</p>
      </header>

      {/* 📌 أزرار التنقل بين التبويبات (Tabs) */}
      <div className='admin-tabs'>
        <button
          onClick={() => setActiveTab('courses')}
          className={`admin-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
        >
          📚 Courses & Sessions
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
        >
          📊 Instructors Daily Reports
        </button>
      </div>

      {message && (
        <div
          className={`banner ${
            message.type === 'success' ? 'banner-success' : 'banner-error'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ==================== TAB 1: COURSES & SESSIONS ==================== */}
      {activeTab === 'courses' && (
        <div className='grid grid-2 admin-forms-grid'>
          {/* إضافة كورس */}
          <section className='card admin-section'>
            <h2>➕ Add New Course</h2>
            <form onSubmit={handleCreateCourse}>
              <div className='field'>
                <label>Select Track</label>
                <select
                  value={selectedTrackId}
                  onChange={(e) => setSelectedTrackId(e.target.value)}
                  required
                  className='input'
                >
                  <option value=''>-- Choose Track --</option>
                  {tracks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className='field'>
                <label>Course Title</label>
                <input
                  type='text'
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder='e.g. Full-Stack Web Development'
                  required
                  className='input'
                />
              </div>

              <button type='submit' className='btn btn-emerald'>
                Create Course
              </button>
            </form>
          </section>

          {/* إضافة سيشن */}
          <section className='card admin-section'>
            <h2>📝 Add New Session & Material</h2>
            <form onSubmit={handleAddSession}>
              <div className='field'>
                <label>Course Title</label>
                <select
                  value={selectedCourseTitle}
                  onChange={(e) => setSelectedCourseTitle(e.target.value)}
                  required
                  className='input'
                >
                  <option value=''>-- Select Course --</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course.title}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className='field'>
                <label>Session Title</label>
                <input
                  type='text'
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder='e.g. Session 1: React Fundamentals'
                  required
                  className='input'
                />
              </div>

              <div className='field'>
                <label>Session Notes</label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder='Write session summary...'
                  rows='3'
                  className='input'
                />
              </div>

              <div className='field'>
                <label>📌 Session Checkpoints</label>
                <div className='checkpoint-inputs'>
                  {checkpoints.map((cp, idx) => (
                    <div key={idx} className='checkpoint-input-row'>
                      <input
                        type='text'
                        value={cp.text}
                        onChange={(e) =>
                          handleCheckpointChange(idx, e.target.value)
                        }
                        placeholder={`Topic #${idx + 1}`}
                        className='input'
                      />
                      {checkpoints.length > 1 && (
                        <button
                          type='button'
                          onClick={() => handleRemoveCheckpoint(idx)}
                          className='btn btn-danger-ghost checkpoint-remove-btn'
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type='button'
                    onClick={handleAddCheckpoint}
                    className='btn btn-ghost add-checkpoint-btn'
                  >
                    + Add Checkpoint Topic
                  </button>
                </div>
              </div>

              <div className='field'>
                <label>📄 Upload Session PDF File</label>
                <input
                  id='pdfInput'
                  type='file'
                  accept='application/pdf'
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  className='file-input'
                />
              </div>

              <button
                type='submit'
                disabled={isUploading}
                className='btn btn-primary'
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
          <section className='card admin-section'>
            <h2>📋 Daily Instructor Reports Summary</h2>

            {/* فلتر التاريخ */}
            <div className='field date-filter-field'>
              <label>Select Date</label>
              <input
                type='date'
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className='input date-filter-input'
              />
            </div>

            {loadingReports ? (
              <p className='muted-text'>Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className='muted-text'>No reports submitted on this date.</p>
            ) : (
              <div className='reports-summary-list'>
                {reports.map((rep) => (
                  <div key={rep._id} className='card report-summary-card'>
                    <div className='report-summary-head'>
                      <h3>👨‍🏫 Instructor: {rep.instructorName}</h3>
                      {rep.instructorId && (
                        <button
                          onClick={() => fetchInstructorStats(rep.instructorId)}
                          className='btn btn-coral view-stats-btn'
                        >
                          📈 View Instructor Overall Stats
                        </button>
                      )}
                    </div>

                    <p className='report-sessions-count'>
                      <strong>Sessions Count:</strong>{' '}
                      {rep.sessions?.length || 0}
                    </p>

                    <div>
                      <strong className='report-details-label'>
                        Session Details:
                      </strong>
                      <ul className='report-sessions-ul'>
                        {rep.sessions?.map((s, idx) => (
                          <li key={idx}>
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
            <section className='card instructor-stats-card'>
              <div className='instructor-stats-head'>
                <h3>📈 Overall Instructor Stats</h3>
                <button
                  onClick={() => setSelectedInstructorStats(null)}
                  className='stats-close-btn'
                >
                  ✕
                </button>
              </div>

              <div className='instructor-stats-totals'>
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

              <h4>Average Student Ratings Across All Sessions:</h4>
              <ul className='instructor-averages-ul'>
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
