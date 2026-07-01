import React, { useEffect, useState,useCallback } from 'react';
import api from '../api/axios';

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [form, setForm] = useState({ student: '', course: '', totalAmount: '', dueDate: '' });
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash' });
  const [error, setError] = useState('');

  const load = useCallback(() => {
  api.get('/fees')
    .then((res) => setFees(res.data))
    .catch(() => {});

  api.get('/students')
    .then((res) => setStudents(res.data))
    .catch(() => {});

  api.get('/courses')
    .then((res) => setCourses(res.data))
    .catch(() => {});
}, []);
  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/fees', form);
      setShowAddModal(false);
      setForm({ student: '', course: '', totalAmount: '', dueDate: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create fee record');
    }
  };

  const openPay = (fee) => {
    setSelectedFee(fee);
    setPayForm({ amount: '', method: 'cash' });
    setError('');
    setShowPayModal(true);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/fees/${selectedFee._id}/pay`, payForm);
      setShowPayModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div>
      <div className="topbar">
        <h1>Fee Management</h1>
        <button className="btn" onClick={() => { setShowAddModal(true); setError(''); }}>+ New Fee Record</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Student</th><th>Course</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f._id}>
                <td>{f.student?.user?.name || '-'}</td>
                <td>{f.course?.name || '-'}</td>
                <td>₹{f.totalAmount}</td>
                <td>₹{f.paidAmount}</td>
                <td>₹{f.totalAmount - f.paidAmount}</td>
                <td><span className={`badge ${f.status}`}>{f.status}</span></td>
                <td>
                  {f.status !== 'paid' && <button className="btn secondary" style={{ padding: '5px 10px' }} onClick={() => openPay(f)}>Record Payment</button>}
                </td>
              </tr>
            ))}
            {fees.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>No fee records found</td></tr>}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>New Fee Record</h3>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Student</label>
                <select value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required>
                  <option value="">-- Select Student --</option>
                  {students.map((s) => <option key={s._id} value={s._id}>{s.user?.name} ({s.studentId})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Course</label>
                <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required>
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.name} (₹{c.fees})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Total Amount</label>
                <input type="number" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="flex-between" style={{ marginTop: 16 }}>
                <button type="button" className="btn outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Record Payment</h3>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Balance due: ₹{selectedFee.totalAmount - selectedFee.paidAmount}</p>
            <form onSubmit={handlePay}>
              <div className="form-group">
                <label>Amount</label>
                <input type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="flex-between" style={{ marginTop: 16 }}>
                <button type="button" className="btn outline" onClick={() => setShowPayModal(false)}>Cancel</button>
                <button type="submit" className="btn">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
