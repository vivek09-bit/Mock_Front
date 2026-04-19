import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import KPICard from '../components/KPICard';
import TestHistoryTable from '../components/TestHistoryTable';
import GoalSelector from '../components/GoalSelector'; // Import GoalSelector
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  FaClipboardList, FaTrophy, FaCheckCircle, FaStar, FaChevronRight, 
  FaPlus, FaCamera, FaUniversity, FaTrain, FaBook, FaGlobe, FaEdit, FaSave
} from 'react-icons/fa';

const Profile = () => {
  const [testRecords, setTestRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false); // State for modal
  const [activeTab, setActiveTab] = useState('Personal Info'); // Default to Profile Info tab
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [newProfile, setNewProfile] = useState({});
  const [interestMetadata, setInterestMetadata] = useState([]);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [savingInterest, setSavingInterest] = useState(false);
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
        console.log("Fetching tests for user:", user.username);
        fetchUserTests(user._id);
      }
      fetchProfileData();
    };

      initializeDashboard();
      fetchFilters();
    }, []);
  
    const fetchFilters = async () => {
      try {
        const response = await axios.get(`${apiBase}/api/test/filters`);
        setInterestMetadata(response.data || []);
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

  const fetchProfileData = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      setError('Please log in');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${apiBase}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUserData(res.data.user);
      setNewProfile({
        username: res.data.user.username || '',
        name: res.data.user.name,
        email: res.data.user.email,
        profile: res.data.user.profile || '',
        phone: res.data.user.phone || '',
        dob: res.data.user.dob || '',
      });
      if (res.data._id) fetchUserTests(res.data._id);
    } catch (err) {
      setError('Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterest = async (category, exam) => {
    setSavingInterest(true);
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    try {
      const response = await axios.put(`${apiBase}/api/user/preferences`, {
        interestCategory: category,
        interestExam: exam
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setUserData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          interestCategory: category,
          interestExam: exam
        }
      }));
      
      // Update local storage user object
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        storedUser.preferences = {
          ...storedUser.preferences,
          interestCategory: category,
          interestExam: exam
        };
        localStorage.setItem('user', JSON.stringify(storedUser));
      }

      setShowInterestModal(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error("Failed to update interest:", err);
      alert("Failed to update interest. Please try again.");
    } finally {
      setSavingInterest(false);
    }
  };

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
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-slate-200">

        <button
          onClick={() => setActiveTab('Personal Info')}
          className={`px-6 py-3 font-bold transition-all ${activeTab === 'Personal Info'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('Dashboard')}
          className={`px-6 py-3 font-bold transition-all ${activeTab === 'Dashboard'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Dashboard
        </button>

      </div>

      {/* Dashboard Tab */}
      {activeTab === 'Dashboard' && (
        <div className="space-y-8">
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
                  <AreaChart data={scoreTrendData.length > 0 ? scoreTrendData : [{ name: 'Jan 5', score: 45 }, { name: 'Jan 10', score: 72 }, { name: 'Jan 15', score: 65 }, { name: 'Jan 20', score: 90 }]}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
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
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                      dx={-10}
                    />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
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
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }}></span>
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
      )}

      {/* Profile Tab */}
      {activeTab === 'Personal Info' && (
        <div className="space-y-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* User Info Card */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  {!userData?.profilePic ? (
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-blue-500 flex items-center justify-center text-white text-4xl font-bold">
                      {userData?.username?.match(/[a-zA-Z]/)?.[0]?.toUpperCase() || 'U'}
                    </div>
                  ) : (
                    <img src={userData.profilePic} alt="Profile" className="w-32 h-32 rounded-full border-4 border-white shadow-lg" />
                  )}
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaCamera size={14} />
                  </button>
                </div>
                <div className="flex-1 text-center md:text-left space-y-1">
                  <h2 className="text-3xl font-bold text-slate-800">{userData?.name}</h2>
                  <p className="text-lg text-slate-500 font-medium">{userData?.email}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-slate-400 font-semibold">
                    <span>User ID: {userData?._id?.slice(-6).toUpperCase() || 'BST1234'}</span>
                    <span>•</span>
                    <span>Joined: January 2026</span>
                  </div>
                </div>

              </div>

              {/* Exam Interests Section - Moved for visibility */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">
                    {(() => {
                      const cat = userData?.preferences?.interestCategory?.toLowerCase();
                      if (cat === 'banking') return <FaUniversity />;
                      if (cat === 'ssc') return <FaBook />;
                      if (cat === 'railways') return <FaTrain />;
                      return <FaGlobe />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Exam Goals</h3>
                    <p className="text-slate-500 font-medium">
                      {userData?.preferences?.interestCategory && userData?.preferences?.interestExam 
                        ? `${userData.preferences.interestCategory} • ${userData.preferences.interestExam}` 
                        : "Set your exam goals to get personalized tests"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedCategory(userData?.preferences?.interestCategory || null);
                    setShowInterestModal(true);
                  }}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
                >
                  <FaEdit size={14} /> {userData?.preferences?.interestCategory ? 'Update Goals' : 'Set Your Goals'}
                </button>
              </div>

              {/* Additional Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-600">Username</label>
                      <p className="text-slate-800">{userData?.username || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600">Phone</label>
                      <p className="text-slate-800">{userData?.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600">Date of Birth</label>
                      <p className="text-slate-800">{userData?.dob || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Test Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-600">Total Tests</label>
                      <p className="text-2xl font-bold text-blue-600">{totalTests}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600">Average Score</label>
                      <p className="text-2xl font-bold text-green-600">{avgScore}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600">Best Score</label>
                      <p className="text-2xl font-bold text-orange-600">{bestScore}%</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Interest Selection Modal */}
              {showInterestModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                    <div className="p-8">
                      <h2 className="text-2xl font-bold text-slate-800 mb-2">Change Your Goal</h2>
                      <p className="text-slate-500 mb-8">Select your target category and exam for personalized tests.</p>

                      {!selectedCategory ? (
                        <div className="grid grid-cols-2 gap-4">
                          {interestMetadata.map((filter) => (
                            <button
                              key={filter.category}
                              onClick={() => setSelectedCategory(filter.category)}
                              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            >
                              <div className="text-3xl text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                                {filter.category === 'Banking' ? <FaUniversity /> :
                                 filter.category === 'SSC' ? <FaBook /> :
                                 filter.category === 'Railways' ? <FaTrain /> : <FaGlobe />}
                              </div>
                              <span className="font-bold text-slate-700">{filter.category}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 text-blue-600 font-bold mb-4">
                            <button onClick={() => { setSelectedCategory(null); setSelectedExam(null); }} className="hover:underline">Categories</button>
                            <FaChevronRight size={10} className="text-slate-300" />
                            <span>{selectedCategory}</span>
                            {selectedExam && (
                              <>
                                <FaChevronRight size={10} className="text-slate-300" />
                                <span className="text-slate-800">{selectedExam}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            <button
                              onClick={() => setSelectedExam('All')}
                              className={`p-4 rounded-xl border-2 font-semibold transition-all text-left ${selectedExam === 'All' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 text-slate-700 hover:border-blue-500'}`}
                            >
                              All {selectedCategory} Exams
                            </button>
                            {interestMetadata.find(f => f.category === selectedCategory)?.exams.map(exam => (
                              <button
                                key={exam}
                                onClick={() => setSelectedExam(exam)}
                                className={`p-4 rounded-xl border-2 font-semibold transition-all text-left ${selectedExam === exam ? 'border-blue-500 bg-blue-50' : 'border-slate-100 text-slate-700 hover:border-blue-500'}`}
                              >
                                {exam}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-slate-50 p-6 flex justify-end gap-4">
                      <button 
                        onClick={() => { setShowInterestModal(false); setSelectedCategory(null); setSelectedExam(null); }}
                        className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      {selectedCategory && (
                        <button 
                          disabled={!selectedExam || savingInterest}
                          onClick={() => handleUpdateInterest(selectedCategory, selectedExam)}
                          className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {savingInterest ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : <FaSave />}
                          Set Goal
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
