import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { FaUserCircle, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaChevronLeft } from 'react-icons/fa';

const TestAnalytics = () => {
    const { testId } = useParams();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const { apiBase } = useContext(ThemeContext);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await axios.get(`${apiBase}/api/instructor/test-stats/${testId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data.stats);
                setLoading(false);
            } catch (err) {
                console.error("Error loading stats", err);
                setLoading(false);
            }
        };
        fetchStats();
    }, [apiBase, testId]);

    return (
        <div className="space-y-8 animate-fadeIn">
            <header className="flex items-center gap-6">
                <Link to="/instructor/my-tests" className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-400 hover:text-indigo-600">
                    <FaChevronLeft />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Performance</h1>
                    <p className="text-slate-500 font-medium">Detailed audit trail for your assessment</p>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Attempt Date</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {stats.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-medium italic">
                                        No attempts recorded for this test yet.
                                    </td>
                                </tr>
                            ) : (
                                stats.map((record) => (
                                    <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <FaUserCircle className="text-2xl" />
                                                </div>
                                                <div>
                                                    <p className="text-slate-800 font-bold block">
                                                        {record.userId?.name || 
                                                         record.studentDetails?.Name || 
                                                         record.studentDetails?.name || 
                                                         record.studentDetails?.['Full Name'] || 
                                                         'Anonymous Guest'}
                                                    </p>
                                                    <p className="text-slate-400 text-xs font-medium">
                                                        {record.userId ? `@${record.userId.username}` : (record.studentDetails?.Email || record.studentDetails?.email || 'Guest Session')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                                <FaCalendarAlt className="text-slate-300" />
                                                {record.lastAttempted ? new Date(record.lastAttempted).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="space-y-1">
                                                <span className={`text-lg font-extrabold ${record.bestScore >= (record.testDetails?.passingScore || 0) ? 'text-teal-600' : 'text-red-500'}`}>
                                                    {record.bestScore}
                                                </span>
                                                <span className="text-slate-300 mx-1">/</span>
                                                <span className="text-slate-500 text-xs font-bold">{record.testDetails?.totalQuestions || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {record.bestScore >= (record.testDetails?.passingScore || 0) ? (
                                                <span className="inline-flex items-center gap-2 text-teal-600 bg-teal-50 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                    <FaCheckCircle /> Qualified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                    <FaTimesCircle /> Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-indigo-600 font-bold text-sm hover:underline underline-offset-4 decoration-2">
                                                View Response
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TestAnalytics;
