import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Courses from './pages/Courses';
import Batches from './pages/Batches';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Exams from './pages/Exams';
import Materials from './pages/Materials';
import Placements from './pages/Placements';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import OnlineClasses from './pages/OnlineClasses';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/online-classes" element={<ProtectedRoute><OnlineClasses /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/batches" element={<ProtectedRoute roles={['admin', 'teacher']}><Batches /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute roles={['admin', 'teacher']}><Attendance /></ProtectedRoute>} />
          <Route path="/fees" element={<ProtectedRoute roles={['admin']}><Fees /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
          <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
          <Route path="/placements" element={<ProtectedRoute roles={['admin', 'student']}><Placements /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin-only management routes */}
          <Route path="/students" element={<ProtectedRoute roles={['admin']}><Students /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute roles={['admin']}><Teachers /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
