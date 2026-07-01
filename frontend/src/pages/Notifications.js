import React, { useEffect, useState,useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', audience: 'all' });
  const [error, setError] = useState('');

  const load = useCallback(() => {
  api.get('/notifications')
    .then((res) => setNotifications(res.data))
    .catch(() => {});
}, []);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/notifications', form);
      setShowModal(false);
      setForm({ title: '', message: '', type: 'info', audience: 'all' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post notification');
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/notifications/${id}`);
    load();
  };

  return (
    <div>
      <div className="topbar">
        <h1>Notifications & Announcements</h1>
        {(user.role === 'admin' || user.role === 'teacher') && (
          <button className="btn" onClick={() => { setShowModal(true); setError(''); }}>+ New Announcement</button>
        )}
      </div>

      <div className="card">
        {notifications.map((n) => (
          <div key={n._id} className="flex-between" style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <div>
              <span className={`badge ${n.type === 'urgent' ? 'inactive' : n.type === 'success' ? 'active' : 'pending'}`} style={{ marginRight: 8 }}>{n.type}</span>
              <strong>{n.title}</strong>
              <p style={{ margin: '4px 0', fontSize: 14, color: '#6b7280' }}>{n.message}</p>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(n.createdAt).toLocaleString()}</span>
            </div>
            {user.role === 'admin' && <button className="btn danger" style={{ padding: '5px 10px' }} onClick={() => handleDelete(n._id)}>Delete</button>}
          </div>
        ))}
        {notifications.length === 0 && <p style={{ color: '#6b7280' }}>No notifications yet</p>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>New Announcement</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Audience</label>
                <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                  <option value="all">Everyone</option>
                  <option value="students">Students</option>
                  <option value="teachers">Teachers</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="flex-between" style={{ marginTop: 16 }}>
                <button type="button" className="btn outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
