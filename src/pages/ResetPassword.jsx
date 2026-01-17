import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { apiBase } = useContext(ThemeContext);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    try {
      const res = await axios.post(`${apiBase}/api/auth/reset-password/${token}`, { password });
      setMessage(res.data.message || 'Password reset successful.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-center mb-4">Reset Password</h2>
        {message && <p className="text-green-600 text-center">{message}</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <button className="w-full bg-teal-600 text-white py-2 rounded" type="submit">Reset Password</button>
        </form>

        <div className="text-center mt-3">
          <a href="/login" className="text-teal-500">Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
