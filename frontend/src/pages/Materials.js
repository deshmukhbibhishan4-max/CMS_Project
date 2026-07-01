import React, { useEffect, useState ,useCallback} from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Materials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', course: '', fileType: 'pdf' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

 const load = useCallback(() => {
  api.get('/materials')
    .then((res) => setMaterials(res.data))
    .catch(() => {});

  api.get('/courses')
    .then((res) => setCourses(res.data))
    .catch(() => {});
}, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) { setError('Please choose a file to upload'); return; }
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append('file', file);
    try {
      await api.post('/materials', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowModal(false);
      setForm({ title: '', description: '', course: '', fileType: 'pdf' });
      setFile(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    await api.delete(`/materials/${id}`);
    load();
  };

  const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

  return (
    <div>
      <div className="topbar">
        <h1>Study Material Management</h1>
        {(user.role === 'admin' || user.role === 'teacher') && (
          <button className="btn" onClick={() => { setShowModal(true); setError(''); }}>+ Upload Material</button>
        )}
      </div>

      <div className="stat-grid">
        {materials.map((m) => (
          <div className="card" key={m._id}>
            <div className="flex-between">
              <h4 style={{ margin: 0 }}>{m.title}</h4>
              <span className="badge active">{m.fileType}</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: 13, margin: '8px 0' }}>{m.description}</p>
            <p style={{ fontSize: 13 }}><strong>Course:</strong> {m.course?.name || '-'}</p>
            <a href={`${apiBase}${m.fileUrl}`} target="_blank" rel="noreferrer" className="btn secondary" style={{ display: 'inline-block', marginTop: 8 }}>Download</a>
            {(user.role === 'admin' || user.role === 'teacher') && (
              <button className="btn danger" style={{ marginLeft: 8, padding: '8px 14px' }} onClick={() => handleDelete(m._id)}>Delete</button>
            )}
          </div>
        ))}
        {materials.length === 0 && <p style={{ color: '#6b7280' }}>No materials uploaded yet</p>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Study Material</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Course</label>
                <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required>
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.fileType} onChange={(e) => setForm({ ...form, fileType: e.target.value })}>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="note">Note</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>File</label>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="flex-between" style={{ marginTop: 16 }}>
                <button type="button" className="btn outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
