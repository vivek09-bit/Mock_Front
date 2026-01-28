import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import KPICard from '../components/KPICard';
import TestHistoryTable from '../components/TestHistoryTable';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, Cell, Legend
} from 'recharts';
import { FaClipboardList, FaTrophy, FaCheckCircle, FaStar, FaChevronRight } from 'react-icons/fa';

const ExamDashboard = () => {
  const [testRecords, setTestRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiBase } = useContext(ThemeContext);
  const navigate = useNavigate();
  const inFlight = useRef(new Set());

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem("authToken");

    if (!user?._id || !token) {
      navigate("/login");
      return;
    }
    
    fetchUserTests(user._id);
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
      console.error("Dashboard fetch failed:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
      inFlight.current.delete(userId);
    }
  };

  // Metrics calculation
  const totalTests = testRecords.length;
  const avgScore = testRecords.length > 0 
    ? Math.round(testRecords.reduce((acc, curr) => acc + (curr.bestScore || 0), 0) / totalTests) 
    : 0;
  const passedTests = testRecords.filter(t => t.testDetails && t.bestScore >= t.testDetails.passingScore).length;
  const accuracy = totalTests > 0 ? "68%" : "0%"; // Mocking for now, as it needs per-question data
  const bestScore = testRecords.length > 0 ? Math.max(...testRecords.map(t => t.bestScore || 0)) : 0;

  // Chart Data
  const scoreTrendData = testRecords
    .slice(-7)
    .sort((a,b) => new Date(a.lastAttempted) - new Date(b.lastAttempted))
    .map(r => ({
      name: new Date(r.lastAttempted).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      score: r.bestScore
    }));

  const subjectData = [
    { name: 'Quantitative', score: 65, fill: '#3b82f6' },
    { name: 'Logical Reasoning', score: 78, fill: '#10b981' },
    { name: 'Verbal Ability', score: 55, fill: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Tests" 
          value={totalTests} 
          icon={<FaClipboardList />} 
          color="blue" 
          chartData={[{value: 30}, {value: 45}, {value: 35}, {value: 50}, {value: 40}, {value: 60}]}
        />
        <KPICard 
          title="Avg Score" 
          value={avgScore} 
          unit="%" 
          icon={<FaTrophy />} 
          color="green" 
          chartData={[{value: 40}, {value: 55}, {value: 50}, {value: 70}, {value: 65}, {value: 72}]}
        />
        <KPICard 
          title="Accuracy" 
          value={accuracy} 
          icon={<FaCheckCircle />} 
          color="purple" 
          chartData={[{value: 60}, {value: 65}, {value: 62}, {value: 68}, {value: 64}, {value: 68}]}
        />
        <KPICard 
          title="Best Score" 
          value={bestScore} 
          unit="%" 
          icon={<FaStar />} 
          color="orange" 
          chartData={[{value: 50}, {value: 70}, {value: 85}, {value: 80}, {value: 90}, {value: 90}]}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Trend */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Score Trend</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-xs font-semibold text-slate-400 uppercase">Test score</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreTrendData.length > 0 ? scoreTrendData : [{name: 'Jan 5', score: 45}, {name: 'Jan 10', score: 72}, {name: 'Jan 15', score: 65}, {name: 'Jan 20', score: 90}]}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy by Subject */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Accuracy by Subject</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                   dx={-10}
                />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={40}>
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {subjectData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.fill}}></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test History Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Test History</h3>
          <button 
            onClick={() => navigate('/my-tests')}
            className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
          >
            See all <FaChevronRight size={10} />
          </button>
        </div>
        <TestHistoryTable testRecords={testRecords.slice(0, 5)} showFilters={false} />
      </div>
    </div>
  );
};

export default ExamDashboard;
