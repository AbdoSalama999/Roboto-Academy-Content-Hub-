import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AdminReportsView = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')

  // 🟢 جلب الـ API Base URL من ملف الـ .env (مع تحديد localhost كبديل للتطوير المحلي)
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5555/api'

  // 🔄 جلب التقارير من السيرفر
  const fetchReports = useCallback(
    async (date = '') => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const url = date
          ? `${API_BASE_URL}/daily-reports?date=${date}`
          : `${API_BASE_URL}/daily-reports`

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          setReports(response.data.data)
        }
      } catch (error) {
        console.error('Error loading reports:', error)
        alert('🚨 حدث خطأ أثناء تحميل التقارير')
      } finally {
        setLoading(false)
      }
    },
    [API_BASE_URL],
  )

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // 📅 التعامل مع فلتر التاريخ
  const handleDateChange = (e) => {
    const dateValue = e.target.value
    setSelectedDate(dateValue)
    fetchReports(dateValue)
  }

  // 🧹 إزالة الفلتر
  const handleClearFilter = () => {
    setSelectedDate('')
    fetchReports('')
  }

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '2rem auto',
        padding: '1.5rem',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ margin: 0, color: '#0f172a' }}>📊 Admin Daily Reports</h2>
        <span style={{ fontSize: '14px', color: '#64748b' }}>
          Total Reports: <strong>{reports.length}</strong>
        </span>
      </div>

      {/* 🔍 بار الفلترة */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '2rem',
          backgroundColor: '#f8fafc',
          padding: '1rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
        }}
      >
        <label style={{ fontWeight: 'bold', color: '#334155' }}>
          📅 Filter by Date:
        </label>
        <input
          type='date'
          value={selectedDate}
          onChange={handleDateChange}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            outline: 'none',
          }}
        />

        {selectedDate && (
          <button
            onClick={handleClearFilter}
            style={{
              padding: '8px 14px',
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Clear Filter ✖
          </button>
        )}
      </div>

      {/* 📄 عرض التقارير */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          ⏳ Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#fff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}
        >
          <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>
            No reports found {selectedDate && `for date: ${selectedDate}`}.
          </p>
        </div>
      ) : (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {reports.map((report) => (
            <div
              key={report._id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {/* هيدر التقرير */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '0.8rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: '0 0 4px 0',
                      color: '#1e293b',
                      fontSize: '18px',
                    }}
                  >
                    👨‍🏫 {report.instructorName}
                  </h3>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    Day: {report.day || 'N/A'}
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    height: 'fit-content',
                  }}
                >
                  📅 {report.date}
                </div>
              </div>

              {/* قسم الجلسات والطلاب */}
              <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#334155' }}>
                📌 Sessions Details ({report.sessions?.length || 0})
              </h4>

              {report.sessions?.map((session, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '0.8rem',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 'bold',
                      color: '#0f172a',
                      marginBottom: '8px',
                    }}
                  >
                    Session {sIdx + 1}: {session.technology} -{' '}
                    {session.sessionName}
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginLeft: '8px',
                      }}
                    >
                      ({session.studentCount} Students)
                    </span>
                  </div>

                  {/* جدول الطلاب وتقييماتهم */}
                  {session.students && session.students.length > 0 && (
                    <div style={{ overflowX: 'auto', marginTop: '8px' }}>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '13px',
                          textAlign: 'left',
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor: '#e2e8f0',
                              color: '#334155',
                            }}
                          >
                            <th style={{ padding: '6px 8px' }}>Student Name</th>
                            <th style={{ padding: '6px 8px' }}>Tech</th>
                            <th style={{ padding: '6px 8px' }}>Prog</th>
                            <th style={{ padding: '6px 8px' }}>Attn</th>
                            <th style={{ padding: '6px 8px' }}>Behav</th>
                          </tr>
                        </thead>
                        <tbody>
                          {session.students.map((st, stIdx) => (
                            <tr
                              key={stIdx}
                              style={{ borderBottom: '1px solid #e2e8f0' }}
                            >
                              <td style={{ padding: '6px 8px' }}>{st.name}</td>
                              <td style={{ padding: '6px 8px' }}>
                                {st.technical}/5
                              </td>
                              <td style={{ padding: '6px 8px' }}>
                                {st.programming}/5
                              </td>
                              <td style={{ padding: '6px 8px' }}>
                                {st.attention}/5
                              </td>
                              <td style={{ padding: '6px 8px' }}>
                                {st.behavior}/5
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}

              {/* قسم المهام اليومية */}
              {report.tasks && (
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '0.8rem',
                    borderTop: '1px dashed #e2e8f0',
                  }}
                >
                  <strong style={{ color: '#475569', fontSize: '14px' }}>
                    ✅ Completed Tasks:
                  </strong>
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      flexWrap: 'wrap',
                      marginTop: '6px',
                      fontSize: '13px',
                    }}
                  >
                    {report.tasks.attendingMeetings && (
                      <span style={{ color: '#16a34a' }}>✔ Meetings</span>
                    )}
                    {report.tasks.testingNewStudents && (
                      <span style={{ color: '#16a34a' }}>
                        ✔ Testing Students
                      </span>
                    )}
                    {report.tasks.preparingForSession && (
                      <span style={{ color: '#16a34a' }}>
                        ✔ Preparing Session
                      </span>
                    )}
                    {report.tasks.takingVideos && (
                      <span style={{ color: '#16a34a' }}>✔ Taking Videos</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminReportsView
