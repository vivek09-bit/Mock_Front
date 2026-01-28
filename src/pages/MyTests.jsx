import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import TestHistoryTable from '../components/TestHistoryTable';

const TeamIgnite = () => {
  const [testRecords, setTestRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiBase } = useContext(ThemeContext);
  const inFlight = useRef(new Set());

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?._id) {
      fetchUserTests(user._id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserTests = async (userId) => {
    if (inFlight.current.has(userId)) return;
    inFlight.current.add(userId);
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${apiBase}/api/user/tests/${userId}`, { headers });
      const records = response.data.records || response.data || [];
      setTestRecords(Array.isArray(records) ? records : []);
    } catch (err) {
      console.error("TeamIgnite fetch failed:", err);
    } finally {
      setLoading(false);
      inFlight.current.delete(userId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Tests</h1>
        <p className="text-slate-500 mt-1">Review your performance across all attempted mock tests.</p>
      </div>

      <TestHistoryTable testRecords={testRecords} showFilters={true} />
    </div>
  );
};

export default TeamIgnite;
