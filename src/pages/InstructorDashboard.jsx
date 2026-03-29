import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { FaBook, FaUsers, FaChartLine, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const InstructorDashboard = () => {
  const [stats, setStats] = useState({ totalTests: 0, totalAttempts: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);
  const { apiBase } = useContext(ThemeContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiBase}/api/instructor/my-tests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const tests = res.data.tests;
        setStats(prev => ({ ...prev, totalTests: tests.length }));
        
        // In a real app, we'd fetch more granular stats here
        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard stats", err);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [apiBase]);

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
      <div className={`p-4 rounded-xl ${color} text-white text-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Educator Portal</h1>
          <p className="text-slate-500 font-medium">Managing your classes, students, and evaluations</p>
        </div>
        <Link 
          to="/instructor/create-test"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
        >
          <FaPlus /> Create New Test
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Tests" value={stats.totalTests} icon={<FaBook />} color="bg-blue-500" />
        <StatCard title="Total Students" value="128" icon={<FaUsers />} color="bg-purple-500" />
        <StatCard title="Avg. Score" value="74%" icon={<FaChartLine />} color="bg-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {i}
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 font-bold text-sm">New attempt on "Banking Awareness Mock"</p>
                  <p className="text-slate-500 text-xs text-medium">2 hours ago</p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">View</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-900 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">AI Test Assistant</h2>
            <p className="text-indigo-200 mb-6 leading-relaxed">
              Unlock the power of AI to generate comprehensive question sets tailored to your curriculum in seconds.
            </p>
            <Link 
              to="/instructor/create-test?tab=ai"
              className="inline-block bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
            >
              Try Generation
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
