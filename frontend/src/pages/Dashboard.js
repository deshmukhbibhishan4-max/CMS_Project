import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PLATFORM_ICONS = { zoom: '📹', google_meet: '🎥', microsoft_teams: '💼', other: '🌐' };

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  if (error) return <p className="error-text">{error}</p>;
  if (!summary) return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading dashboard...</div>;

  const isAdmin = user?.role === 'admin';

  const feeChartData = [
    { name: 'Collected', amount: summary.feeCollected },
    { name: 'Pending', amount: summary.feePending },
  ];

  // const classStatusData = [
  //   { name: 'Online Classes', value: summary.totalOnlineClasses || 0, color: '#4f46e5' },
  //   { name: 'Live Now', value: summary.liveClassesCount || 0, color: '#16a34a' },
  // ];

  const formatDT = (dt) => dt ? new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }) : '-';

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
            Welcome back, {user?.name} ({user?.role})
          </p>
        </div>
        {summary.liveClassesCount > 0 && (
          <div style={{
            background: '#dcfce7', color: '#16a34a', padding: '8px 16px',
            borderRadius: 20, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6
          }}>
            🔴 {summary.liveClassesCount} Class{summary.liveClassesCount > 1 ? 'es' : ''} Live Now
          </div>
        )}
      </div>

      {/* Stat Cards - Admin shows all; teacher/student shows relevant */}
      <div className="stat-grid">
        {isAdmin && (
          <>
            <div className="stat-card">
              <div className="label">Total Students</div>
              <div className="value">{summary.totalStudents}</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#06b6d4' }}>
              <div className="label">Total Teachers</div>
              <div className="value">{summary.totalTeachers}</div>
            </div>
          </>
        )}
        <div className="stat-card" style={{ borderLeftColor: '#16a34a' }}>
          <div className="label">Total Courses</div>
          <div className="value">{summary.totalCourses}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#d97706' }}>
          <div className="label">Total Batches</div>
          <div className="value">{summary.totalBatches}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
          <div className="label">Online Classes</div>
          <div className="value">{summary.totalOnlineClasses || 0}</div>
        </div>
        {summary.liveClassesCount > 0 && (
          <div className="stat-card" style={{ borderLeftColor: '#16a34a', background: '#f0fdf4' }}>
            <div className="label">🔴 Live Now</div>
            <div className="value" style={{ color: '#16a34a' }}>{summary.liveClassesCount}</div>
          </div>
        )}
        {isAdmin && (
          <>
            <div className="stat-card" style={{ borderLeftColor: '#16a34a' }}>
              <div className="label">Fees Collected</div>
              <div className="value">₹{summary.feeCollected?.toLocaleString()}</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#dc2626' }}>
              <div className="label">Fees Pending</div>
              <div className="value">₹{summary.feePending?.toLocaleString()}</div>
            </div>
          </>
        )}
        <div className="stat-card" style={{ borderLeftColor: '#06b6d4' }}>
          <div className="label">Today's Attendance %</div>
          <div className="value">{summary.todayAttendancePct}%</div>
        </div>
      </div>

      {/* Charts + Upcoming */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 20 }}>
        {isAdmin && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Fee Collection Summary</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={feeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Upcoming Online Classes</h3>
          {(!summary.upcomingOnlineClasses || summary.upcomingOnlineClasses.length === 0) && (
            <p style={{ color: '#6b7280', fontSize: 13 }}>No upcoming online classes</p>
          )}
          {summary.upcomingOnlineClasses?.map((cls) => (
            <div key={cls._id} style={{
              padding: '10px 0', borderBottom: '1px solid #f3f4f6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {PLATFORM_ICONS[cls.platform]} {cls.title}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{cls.course?.name} · {cls.teacher?.name}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: '#6b7280' }}>
                {formatDT(cls.scheduledAt)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exams + Notifications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Upcoming Exams</h3>
          {summary.upcomingExams.length === 0 && <p style={{ color: '#6b7280', fontSize: 13 }}>No upcoming exams</p>}
          {summary.upcomingExams.map((exam) => (
            <div key={exam._id} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 14 }}>{exam.name} <span style={{ color: '#6b7280', fontSize: 12 }}>({exam.course?.name})</span></span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{new Date(exam.examDate).toLocaleDateString()}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Recent Notifications</h3>
          {summary.notifications.length === 0 && <p style={{ color: '#6b7280', fontSize: 13 }}>No notifications</p>}
          {summary.notifications.map((n) => (
            <div key={n._id} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <strong style={{ fontSize: 14 }}>{n.title}</strong>
              <p style={{ margin: '2px 0', fontSize: 12, color: '#6b7280' }}>{n.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
