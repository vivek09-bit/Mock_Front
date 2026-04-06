import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { FaClock, FaClipboardList, FaBolt, FaArrowRight, FaLock } from 'react-icons/fa';

const StudentLanding = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { apiBase } = useContext(ThemeContext);

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [studentData, setStudentData] = useState({});
    const [timeLeftToStart, setTimeLeftToStart] = useState(null);

    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                const res = await axios.get(`${apiBase}/api/instructor/public/test-info/${testId}`);
                const testData = res.data.test;

                if (!testData.isPublished) {
                    setError("This test is not yet published by the educator.");
                    return;
                }

                setTest(testData);

                // Initialize form state
                const initialForm = {};
                (testData.requiredStudentDetails || []).forEach(detail => initialForm[detail] = "");
                setStudentData(initialForm);

                // Handle Scheduling
                checkTiming(testData);
            } catch (err) {
                setError("Test not found or no longer available.");
            } finally {
                setLoading(false);
            }
        };
        fetchTestDetails();
    }, [testId, apiBase]);

    const checkTiming = (testData) => {
        const now = new Date();
        const start = testData.startTime ? new Date(testData.startTime) : null;
        const end = testData.endTime ? new Date(testData.endTime) : null;

        if (start && now < start) {
            setTimeLeftToStart(start.getTime() - now.getTime());
            return "too-early";
        }
        if (end && now > end) {
            setError("This assessment period has concluded.");
            return "too-late";
        }
        return "on-time";
    };

    // Countdown Timer for early arrivals
    useEffect(() => {
        if (timeLeftToStart === null || timeLeftToStart <= 0) return;
        const timer = setInterval(() => {
            setTimeLeftToStart(prev => prev - 1000);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeftToStart]);

    const handleInputChange = (detail, value) => {
        setStudentData(prev => ({ ...prev, [detail]: value }));
    };

    const handleStart = (e) => {
        e.preventDefault();
        // Save student info temporarily and proceed to test
        localStorage.setItem(`student_info_${testId}`, JSON.stringify(studentData));
        navigate(`/take-test/${testId}`);
    };

    const formatCountdown = (ms) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / 1000 / 60) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <FaLock className="text-red-500 text-2xl" />
                </div>
                <h1 className="text-2xl font-bold text-white">Access Denied</h1>
                <p className="text-slate-400">{error}</p>
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all"
                >
                    Return to Home
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white p-4 py-12 md:py-20">
            <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
                <header className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <div className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
                            Official Assessment
                        </div>
                        <div className="inline-block px-3 py-1 bg-teal-500/10 text-teal-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-teal-500/20">
                            ✓ Guest Access · No Login Required
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{test.name}</h1>
                    <p className="text-slate-400 font-medium">Domain: {test.category} • {test.duration} Minutes</p>
                </header>

                <div className="bg-[#1e293b] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
                    <div className="p-8 md:p-12 space-y-10">

                        {test.testModel === 'live' ? (
                            <div className="text-center space-y-8 py-6">
                                <div className="w-24 h-24 bg-amber-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-amber-500 shadow-xl shadow-amber-500/5 rotate-12">
                                    <FaBolt className="text-4xl animate-pulse" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black text-white tracking-tight leading-tight">Interactive Live Session</h2>
                                    <p className="text-slate-400 font-medium max-w-sm mx-auto">
                                        This is a synchronized live battle. You'll need the session passcode from your instructor to join the arena.
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(`/live/join/${testId}`)}
                                    className="w-full bg-amber-500 text-[#0f172a] py-5 rounded-2xl font-black text-xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-900/40 transform active:scale-[0.98]"
                                >
                                    Jump to Arena
                                </button>
                            </div>
                        ) : timeLeftToStart > 0 ? (
                            <div className="text-center space-y-6">
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-500 animate-pulse">
                                    <FaClock className="text-3xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Entry Starts Soon</h2>
                                    <p className="text-slate-400 text-sm mt-1">This assessment is scheduled to begin in:</p>
                                </div>
                                <div className="text-5xl font-mono font-black text-indigo-400 bg-slate-900/50 py-4 rounded-2xl border border-slate-800">
                                    {formatCountdown(timeLeftToStart)}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleStart} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                                        <FaClipboardList className="text-teal-400" />
                                        <h2 className="text-lg font-bold text-white uppercase tracking-wider text-sm">Required Details</h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        {test.requiredStudentDetails.map(detail => (
                                            <div key={detail}>
                                                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{detail}</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={studentData[detail]}
                                                    onChange={(e) => handleInputChange(detail, e.target.value)}
                                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                                                    placeholder={`Enter your ${detail.toLowerCase()}`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {test.requiredStudentDetails.length === 0 && (
                                        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 text-center">
                                            <p className="text-slate-400 font-medium italic">No additional details required. You are ready to begin.</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3 group"
                                >
                                    Begin Assessment Now <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        )}

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-8 mt-4">
                            <div className="text-center">
                                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Passing Criteria</p>
                                <p className="text-white font-bold text-lg mt-1">{test.passingScore}%</p>
                            </div>
                            <div className="text-center border-l border-slate-800">
                                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Total Time</p>
                                <p className="text-white font-bold text-lg mt-1">{test.duration} Min</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500"></div>
                </div>

                <div className="text-center opacity-40">
                    <p className="text-slate-500 text-xs">&copy; 2026 Ignite Verse Assessment Engine. Secure Environment V2.4</p>
                </div>
            </div>
        </div>
    );
};

export default StudentLanding;
