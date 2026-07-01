import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = new FormData();
      data.append('name', name);
      if (password) data.append('password', password);
      await api.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Profile updated successfully');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <div className="topbar"><h1>My Profile</h1></div>
      <div className="card" style={{ maxWidth: 420 }}>
        <p><strong>Role:</strong> <span className="badge active">{user.role}</span></p>
        <p><strong>Email:</strong> {user.email}</p>
        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>New Password (leave blank to keep current)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
          </div>
          {message && <p style={{ color: '#16a34a', fontSize: 13 }}>{message}</p>}
          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit">Update Profile</button>
        </form>
      </div>
    </div>
  );
}
