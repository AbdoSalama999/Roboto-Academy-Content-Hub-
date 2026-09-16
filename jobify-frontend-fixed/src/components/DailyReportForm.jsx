import React, { useState } from 'react'
import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5555/api'

const DailyReportForm = () => {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState({
    instructorName: 'Abdo Salama',
    date: new Date().toISOString().split('T')[0],
    day: 'Tuesday',
    sessions: [
      {
        technology: 'Arduino',
        sessionName: '',
        students: [
          { name: '', technical: 5, programming: 5, attention: 5, behavior: 5 },
        ],
      },
    ],
    tasks: {
      attendingMeetings: false,
      testingNewStudents: false,
      preparingForSession: false,
      takingVideos: false,
    },
  })

  // ➕ إضافة سيشن جديدة
  const addSession = () => {
    setReport({
      ...report,
      sessions: [
        ...report.sessions,
        {
          technology: '',
          sessionName: '',
          students: [
            {
              name: '',
              technical: 5,
              programming: 5,
              attention: 5,
              behavior: 5,
            },
          ],
        },
      ],
    })
  }

  // ➕ إضافة طالب جديد داخل سيشن معينة
  const addStudent = (sessionIndex) => {
    const updatedSessions = [...report.sessions]
    updatedSessions[sessionIndex].students.push({
      name: '',
      technical: 5,
      programming: 5,
      attention: 5,
      behavior: 5,
    })
    setReport({ ...report, sessions: updatedSessions })
  }

  // 📝 التعامل مع تغيير القيم للطلاب
  const handleStudentChange = (sessionIdx, studentIdx, field, value) => {
    const updatedSessions = [...report.sessions]
    updatedSessions[sessionIdx].students[studentIdx][field] = value
    setReport({ ...report, sessions: updatedSessions })
  }

  // 🚀 إرسال التقرير للباك إند
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 💡 حساب studentCount لكل سيشن تلقائياً بناءً على عدد الطلاب المخزنين
    const formattedSessions = report.sessions.map((session) => ({
      ...session,
      studentCount: session.students.length,
    }))

    const finalReportData = {
      ...report,
      sessions: formattedSessions,
    }

    try {
      const token = localStorage.getItem('token')

      const response = await axios.post(
        `${API_BASE_URL}/daily-reports`,
        finalReportData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        alert('🎉 تم حفظ التقرير اليومي بنجاح! 🚀')
      }
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || '🚨 حدث خطأ أثناء إرسال التقرير')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: '850px',
        margin: '2rem auto',
        padding: '2rem',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2>📝 Daily Instructor Report</h2>

      <form onSubmit={handleSubmit}>
        {/* القسم الأول: البيانات الأساسية */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Instructor Name:
            </label>
            <input
              type='text'
              value={report.instructorName}
              onChange={(e) =>
                setReport({ ...report, instructorName: e.target.value })
              }
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Date:
            </label>
            <input
              type='date'
              value={report.date}
              onChange={(e) => setReport({ ...report, date: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
          </div>
        </div>

        {/* القسم الثاني: الجلسات وتقييم الطلاب */}
        {report.sessions.map((session, sIdx) => (
          <div
            key={sIdx}
            style={{
              border: '1px solid #e2e8f0',
              padding: '1.2rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              backgroundColor: '#f8fafc',
            }}
          >
            <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>
              📌 Session {sIdx + 1}
            </h4>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input
                placeholder='Technology (e.g. Arduino)'
                value={session.technology}
                onChange={(e) => {
                  const updated = [...report.sessions]
                  updated[sIdx].technology = e.target.value
                  setReport({ ...report, sessions: updated })
                }}
                required
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
              <input
                placeholder='Session Name (e.g. PIR Sensor)'
                value={session.sessionName}
                onChange={(e) => {
                  const updated = [...report.sessions]
                  updated[sIdx].sessionName = e.target.value
                  setReport({ ...report, sessions: updated })
                }}
                required
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
            </div>

            <h5 style={{ margin: '10px 0', color: '#475569' }}>
              👨‍🎓 Student Evaluations (1 to 5)
            </h5>

            {session.students.map((student, stIdx) => (
              <div
                key={stIdx}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <input
                  placeholder='Student Name'
                  value={student.name}
                  onChange={(e) =>
                    handleStudentChange(sIdx, stIdx, 'name', e.target.value)
                  }
                  required
                  style={{
                    flex: 2,
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                />
                <input
                  type='number'
                  min='1'
                  max='5'
                  value={student.technical}
                  onChange={(e) =>
                    handleStudentChange(
                      sIdx,
                      stIdx,
                      'technical',
                      Number(e.target.value),
                    )
                  }
                  title='Technical'
                  style={{ width: '60px', padding: '6px' }}
                />
                <input
                  type='number'
                  min='1'
                  max='5'
                  value={student.programming}
                  onChange={(e) =>
                    handleStudentChange(
                      sIdx,
                      stIdx,
                      'programming',
                      Number(e.target.value),
                    )
                  }
                  title='Programming'
                  style={{ width: '60px', padding: '6px' }}
                />
                <input
                  type='number'
                  min='1'
                  max='5'
                  value={student.attention}
                  onChange={(e) =>
                    handleStudentChange(
                      sIdx,
                      stIdx,
                      'attention',
                      Number(e.target.value),
                    )
                  }
                  title='Attention'
                  style={{ width: '60px', padding: '6px' }}
                />
                <input
                  type='number'
                  min='1'
                  max='5'
                  value={student.behavior}
                  onChange={(e) =>
                    handleStudentChange(
                      sIdx,
                      stIdx,
                      'behavior',
                      Number(e.target.value),
                    )
                  }
                  title='Behavior'
                  style={{ width: '60px', padding: '6px' }}
                />
              </div>
            ))}

            <button
              type='button'
              onClick={() => addStudent(sIdx)}
              style={{
                marginTop: '8px',
                padding: '5px 12px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              + Add Student
            </button>
          </div>
        ))}

        <button
          type='button'
          onClick={addSession}
          style={{
            marginBottom: '1.5rem',
            padding: '8px 16px',
            background: '#0d9488',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ➕ Add Another Session
        </button>

        {/* القسم الثالث: المهام اليومية */}
        <h4 style={{ marginBottom: '10px' }}>✅ Daily Tasks Checklist</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>
            <input
              type='checkbox'
              checked={report.tasks.attendingMeetings}
              onChange={(e) =>
                setReport({
                  ...report,
                  tasks: {
                    ...report.tasks,
                    attendingMeetings: e.target.checked,
                  },
                })
              }
            />{' '}
            Attending Meetings
          </label>

          <label>
            <input
              type='checkbox'
              checked={report.tasks.testingNewStudents}
              onChange={(e) =>
                setReport({
                  ...report,
                  tasks: {
                    ...report.tasks,
                    testingNewStudents: e.target.checked,
                  },
                })
              }
            />{' '}
            Testing New Students
          </label>

          <label>
            <input
              type='checkbox'
              checked={report.tasks.preparingForSession}
              onChange={(e) =>
                setReport({
                  ...report,
                  tasks: {
                    ...report.tasks,
                    preparingForSession: e.target.checked,
                  },
                })
              }
            />{' '}
            Preparing Session Materials
          </label>
        </div>

        <br />

        <button
          type='submit'
          disabled={loading}
          style={{
            padding: '0.8rem 2rem',
            background: loading ? '#94a3b8' : '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Saving Report...' : '📤 Send Daily Report'}
        </button>
      </form>
    </div>
  )
}

export default DailyReportForm
