import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: '📊 Dashboard', roles: ['admin'] },
  // Admin-only management pages (students & teachers hidden from dashboard nav for admin)
  { to: '/courses', label: '📚 Courses', roles: ['admin', 'teacher', 'student'] },
  { to: '/batches', label: '👥 Batches', roles: ['admin', 'teacher'] },
  { to: '/online-classes', label: '🖥️ Online Classes', roles: ['admin', 'teacher', 'student'] },
  { to: '/attendance', label: '✅ Attendance', roles: ['admin', 'teacher'] },
  { to: '/fees', label: '💰 Fees', roles: ['admin'] },
  { to: '/exams', label: '📝 Exams & Results', roles: ['admin', 'teacher', 'student'] },
  { to: '/materials', label: '📂 Study Materials', roles: ['admin', 'teacher', 'student'] },
  { to: '/placements', label: '🏢 Placements', roles: ['admin', 'student'] },
  { to: '/notifications', label: '🔔 Notifications', roles: ['admin', 'teacher', 'student'] },
  { to: '/profile', label: '👤 My Profile', roles: ['admin', 'teacher', 'student'] },
];

// Admin-only management section links (separate section, not visible to students/teachers)
const adminManagementLinks = [
  { to: '/students', label: '🎓 Manage Students' },
  { to: '/teachers', label: '👩‍🏫 Manage Teachers' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>🏫 CMS Portal</h2>
          <div style={{ fontSize: 11, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: 1 }}>
            {user?.role}
          </div>
        </div>
        <nav style={{ padding: '12px 0' }}>
          {links
            .filter((l) => l.roles.includes(user?.role))
            .map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {l.label}
              </NavLink>
            ))}

          {/* Admin Management Section */}
          {isAdmin && (
            <>
              <div style={{
                padding: '12px 24px 6px',
                fontSize: 10,
                color: '#6366f1',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                fontWeight: 700,
                marginTop: 8
              }}>
                Administration
              </div>
              {adminManagementLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  {l.label}
                </NavLink>
              ))}
            </>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 12, paddingTop: 8 }}>
            <a href="/" 
              onClick={handleLogout}
              style={{ cursor: 'pointer', color: '#fca5a5', padding: '12px 24px', display: 'block', fontSize: 14 }}
            >
              🚪 Logout
            </a>


          </div>
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
