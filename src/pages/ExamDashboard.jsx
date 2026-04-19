import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import KPICard from '../components/KPICard';
import TestHistoryTable from '../components/TestHistoryTable';
import GoalSelector from '../components/GoalSelector';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, Cell
} from 'recharts';
import { FaClipboardList, FaTrophy, FaCheckCircle, FaStar, FaChevronRight, FaPlus, FaFire, FaAward, FaLightbulb } from 'react-icons/fa';

const ExamDashboard = () => {
  const [testRecords, setTestRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [userName, setUserName] = useState('');
  const { apiBase } = useContext(ThemeContext);
  const navigate = useNavigate();
  const inFlight = useRef(new Set());

  // debug: log when records change so we can see state updates
  useEffect(() => {
    if (testRecords.length) {
      console.log('testRecords state updated:', testRecords);
    }
  }, [testRecords]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn("No token found, redirecting to login");
      navigate("/login");
      return;
    }

    const initializeDashboard = async () => {
      let user = JSON.parse(localStorage.getItem('user')) || {};
      setUserName(user.name || 'Learner');

      // If user ID is missing, try to recover it from the server
      if (!user._id) {
        console.warn("User ID missing. Attempting to recover session...");
        try {
          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.get(`${apiBase}/api/auth/me`, { headers });

          if (response.data && response.data.user) {
            user = response.data.user;
            setUserName(user.name || 'Learner');
            localStorage.setItem('user', JSON.stringify(user));
            console.log("Session recovered!", user);
          }
        } catch (error) {
          console.error("Failed to recover session:", error);
          return;
        }
      }

      if (user._id) {
        await fetchUserTests(user._id);
      }
      // refresh the profile info as well
      await fetchProfileData();
    };

    initializeDashboard();
  }, []);

  const fetchProfileData = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${apiBase}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUserName(res.data.user.name || 'Learner');
    } catch (err) {
      console.error('Error fetching profile data:', err);
    }
  };

  const fetchUserTests = async (userId) => {
    if (inFlight.current.has(userId)) return;
    inFlight.current.add(userId);
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${apiBase}/api/user/tests/${userId}`, { headers });
      console.log("Fetched test records:", response?.data?.records);
      let records = response.data.records || response.data || [];
      if (!Array.isArray(records)) records = [];
      setTestRecords([...records]);
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

  // ---------- Performance helpers ----------
  const totalTests = testRecords.length;

  // average of best scores
  const avgScore = totalTests > 0
    ? Math.round(testRecords.reduce((acc, curr) => acc + (curr.bestScore || 0), 0) / totalTests)
    : 0;

  // best score overall
  const bestScore = totalTests > 0 ? Math.max(...testRecords.map(t => t.bestScore || 0)) : 0;

  // real accuracy calculation
  const accuracyCalc = testRecords.reduce((acc, record) => {
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

  // helper: compute current streak of days with at least one test
  const calculateStreak = (records) => {
    const days = Array.from(new Set(records.map(r => new Date(r.lastAttempted).toDateString()))).sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (let day of days) {
      const d = new Date(day);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === cursor.getTime()) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else if (d.getTime() < cursor.getTime()) {
        break;
      }
    }
    return streak;
  };

  // helper: achievement level based on avgScore thresholds
  const getAchievementLevel = (score) => {
    if (score >= 90) return 'Master';
    if (score >= 75) return 'Advanced';
    if (score >= 50) return 'Intermediate';
    if (score > 0) return 'Beginner';
    return 'New';
  };

  // helper: compare avg of last 7 days vs previous 7
  const calculateLearningRate = (records) => {
    if (records.length === 0) return 0;
    const now = new Date();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const week1 = records.filter(r => new Date(r.lastAttempted) >= new Date(now - weekMs));
    const week2 = records.filter(r => {
      const d = new Date(r.lastAttempted);
      return d < new Date(now - weekMs) && d >= new Date(now - 2 * weekMs);
    });
    const avg = arr => arr.length ? arr.reduce((a, c) => a + (c.bestScore || 0), 0) / arr.length : 0;
    const w1 = avg(week1);
    const w2 = avg(week2);
    if (w2 === 0) return w1 > 0 ? 100 : 0;
    return Math.round(((w1 - w2) / w2) * 100);
  };

  const currentStreak = calculateStreak(testRecords);
  const achievementLevel = getAchievementLevel(avgScore);
  const learningRate = calculateLearningRate(testRecords);


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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-800">Loading your dashboard</p>
            <p className="text-sm text-slate-500">Preparing your learning insights...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50 pb-20">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome back, {userName.toUpperCase()}!
              </h1>
              <p className="text-slate-500 text-lg">Let's track your progress and ace those tests</p>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-105 transition-all transform"
            >
              <FaPlus size={16} /> Start New Test
            </button>
          </div>
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

        {/* Performance Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-2">Current Streak 🔥</p>
                <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
                <p className="text-xs text-slate-500 mt-1">day{currentStreak === 1 ? '' : 's'} in a row</p>
              </div>
              <FaFire size={40} className="text-orange-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-2">Achievement Level 🏆</p>
                <p className="text-3xl font-bold text-blue-600">{achievementLevel}</p>
                <p className="text-xs text-slate-500 mt-1">based on performance</p>
              </div>
              <FaAward size={40} className="text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-2">Learning Rate 💡</p>
                <p className="text-3xl font-bold text-green-600">{learningRate >= 0 ? `+${learningRate}%` : `${learningRate}%`}</p>
                <p className="text-xs text-slate-500 mt-1">vs previous week</p>
              </div>
              <FaLightbulb size={40} className="text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Score Trend */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Score Trend</h3>
                  <p className="text-sm text-slate-500 mt-1">Your performance over time</p>
                </div>
                <div className="flex gap-2 items-center px-3 py-1 bg-blue-100 rounded-full">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-xs font-semibold text-blue-700">Last 7 tests</span>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrendData.length > 0 ? scoreTrendData : [{ name: 'Jan 5', score: 45 }, { name: 'Jan 10', score: 72 }, { name: 'Jan 15', score: 65 }, { name: 'Jan 20', score: 90 }]}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.95)' }}
                      wrapperStyle={{ outline: 'none' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                      dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Accuracy by Subject */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Performance by Subject</h3>
                <p className="text-sm text-slate-500 mt-1">Your accuracy across different topics</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      dx={-10}
                    />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.95)' }}
                      wrapperStyle={{ outline: 'none' }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={50}>
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 pt-4 flex-wrap">
                {subjectData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }}></span>
                    <span className="text-xs font-bold text-slate-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Test History Table */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Recent Tests</h3>
              <p className="text-sm text-slate-500 mt-1">Your latest test attempts</p>
            </div>
            <button
              onClick={() => navigate('/my-tests')}
              className="text-blue-600 font-bold text-sm hover:text-blue-700 flex items-center gap-1 px-4 py-2 hover:bg-blue-50 rounded-lg transition-all"
            >
              See all <FaChevronRight size={12} />
            </button>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all">
            <TestHistoryTable testRecords={testRecords.slice(0, 5)} showFilters={false} />
          </div>
        </div>

        {/* Floating Action Button (Mobile) */}
        <div className="fixed bottom-8 right-8 md:hidden z-50">
          <button
            onClick={() => setShowGoalModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all transform"
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

      {/* Animation Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default ExamDashboard;
