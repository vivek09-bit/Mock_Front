import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import KPICard from '../components/KPICard';
import TestHistoryTable from '../components/TestHistoryTable';
import GoalSelector from '../components/GoalSelector'; // Import GoalSelector
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, Cell, Legend
} from 'recharts';
import { FaClipboardList, FaTrophy, FaCheckCircle, FaStar, FaChevronRight, FaPlus } from 'react-icons/fa';

const ExamDashboard = () => {
  const [testRecords, setTestRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false); // State for modal
  const { apiBase } = useContext(ThemeContext);
  const navigate = useNavigate();
  const inFlight = useRef(new Set());

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn("No token found, redirecting to login");
      navigate("/login");
      return;
    }

    const initializeDashboard = async () => {
       let user = JSON.parse(localStorage.getItem('user')) || {};
       
       // If user ID is missing, try to recover it from the server
       if (!user._id) {
           console.warn("User ID missing. Attempting to recover session...");
           try {
               const headers = { Authorization: `Bearer ${token}` };
               const response = await axios.get(`${apiBase}/api/auth/me`, { headers });
               
               if (response.data && response.data.user) {
                   user = response.data.user;
                   // Re-save to local storage to fix the state
                   localStorage.setItem('user', JSON.stringify(user));
                   console.log("Session recovered!", user);
               }
           } catch (error) {
               console.error("Failed to recover session:", error);
               // If we can't get the user, we might need to re-login
               // navigate("/login"); // Optional: strict mode
               return; 
           }
       }
       
       if (user._id) {
           fetchUserTests(user._id);
       }
    };

    initializeDashboard();
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
  
  // Avg Score
  const avgScore = totalTests > 0 
    ? Math.round(testRecords.reduce((acc, curr) => acc + (curr.bestScore || 0), 0) / totalTests) 
    : 0;
    
  // Best Score
  const bestScore = totalTests > 0 ? Math.max(...testRecords.map(t => t.bestScore || 0)) : 0;

  // Real Accuracy Calculation
  // Sum of all correct answers / Sum of all questions attempted (across best attempts)
  const accuracyCalc = testRecords.reduce((acc, record) => {
      // Find the best attempt (or last)
      const attempt = record.attempts.reduce((prev, curr) => curr.score > prev.score ? curr : prev, record.attempts[0]);
      if (!attempt) return acc;

      const correctCount = attempt.questionsAttempted.filter(q => q.isCorrect).length;
      return { 
          correct: acc.correct + correctCount, 
          total: acc.total + attempt.questionsAttempted.length 
      };
  }, { correct: 0, total: 0 });

  const accuracy = accuracyCalc.total > 0 
    ? Math.round((accuracyCalc.correct / accuracyCalc.total) * 100) + "%" 
    : "0%";

  // Aggregation by Subject (Category)
  const subjectMap = testRecords.reduce((acc, record) => {
      const cat = record.testId?.category || "General"; // Populated from backend
      if (!acc[cat]) acc[cat] = { totalScore: 0, count: 0 };
      acc[cat].totalScore += record.bestScore;
      acc[cat].count += 1;
      return acc;
  }, {});

  const subjectData = Object.keys(subjectMap).map((key, index) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      score: Math.round(subjectMap[key].totalScore / subjectMap[key].count),
      fill: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'][index % 4]
  }));

  // Fallback if no data
  if (subjectData.length === 0) {
      subjectData.push({ name: 'No Data', score: 0, fill: '#cbd5e1' });
  }

  // Chart Data (Last 7 tests)
  const scoreTrendData = testRecords
    .slice(-7) // Take last 7
    .map(r => ({
      name: new Date(r.lastAttempted).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      score: r.bestScore
    }));
  
  // Sparkline Generators
  const genSparkline = (field) => testRecords.slice(-6).map(r => ({ value: r[field] || 0 }));
  const scoreSpark = testRecords.slice(-6).map(r => ({ value: r.bestScore }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
         <button 
          onClick={() => setShowGoalModal(true)}
          className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
        >
          <FaPlus size={14} /> Start New Test
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Tests" 
          value={totalTests} 
          icon={<FaClipboardList />} 
          color="blue" 
          chartData={scoreSpark}
        />
        <KPICard 
          title="Avg Score" 
          value={avgScore} 
          unit="%" 
          icon={<FaTrophy />} 
          color="green" 
          chartData={scoreSpark}
        />
        <KPICard 
          title="Accuracy" 
          value={accuracy} 
          icon={<FaCheckCircle />} 
          color="purple" 
          chartData={scoreSpark}
        />
        <KPICard 
          title="Best Score" 
          value={bestScore} 
          unit="%" 
          icon={<FaStar />} 
          color="orange" 
          chartData={scoreSpark}
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

      {/* Floating Action Button (Mobile) or Header Button */}
      <div className="fixed bottom-8 right-8 md:hidden">
        <button 
          onClick={() => setShowGoalModal(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus size={24} />
        </button>
      </div>

       {/* Goal Selector Modal */}
       {showGoalModal && (
        <GoalSelector 
          onSelect={(category) => {
            setShowGoalModal(false);
            navigate(`/tests?category=${category}`);
          }}
          onClose={() => setShowGoalModal(false)}
        />
      )}
    </div>
  );
};

export default ExamDashboard;
