import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import KPICard from '../components/KPICard';
import { FaUser, FaLock, FaCog, FaHistory, FaIdCard, FaCamera, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import { FaClipboardList, FaTrophy, FaCheckCircle, FaStar } from 'react-icons/fa';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [testRecords, setTestRecords] = useState([]);
    const [activeTab, setActiveTab] = useState('Overview');
    const [isEditing, setIsEditing] = useState(false);
    const [newProfile, setNewProfile] = useState({
        name: '',
        email: '',
        profile: '',
        phone: '',
        dob: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { apiBase } = useContext(ThemeContext);
    const inFlight = useRef(new Set());

    useEffect(() => {
        fetchProfileData();
    }, []);

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
            setUserData(res.data);
            setNewProfile({
                name: res.data.name,
                email: res.data.email,
                profile: res.data.profile || '',
                phone: res.data.phone || '',
                dob: res.data.dob || '',
            });
            if (res.data._id) fetchUserTests(res.data._id);
        } catch (err) {
            setError('Error fetching profile data');
        } finally {
            setLoading(false);
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
            console.error("Profile tests fetch failed:", err);
        } finally {
            inFlight.current.delete(userId);
        }
    };

    const handleProfileUpdate = async () => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        try {
            const res = await axios.put(`${apiBase}/api/auth/profile`, newProfile, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUserData(res.data);
            setIsEditing(false);
        } catch (err) {
            setError('Error updating profile');
        }
    };

    // Metrics
    const totalTests = testRecords.length;
    const avgScore = testRecords.length > 0 ? Math.round(testRecords.reduce((acc, curr) => acc + (curr.bestScore || 0), 0) / totalTests) : 0;
    const accuracy = totalTests > 0 ? "68%" : "0%";
    const bestScore = testRecords.length > 0 ? Math.max(...testRecords.map(t => t.bestScore || 0)) : 0;

    const tabs = ['Overview', 'Personal Info', 'Preferences', 'Security'];

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-slate-800">Profile</h1>
            </header>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-bold transition-all relative ${
                            activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {activeTab === 'Overview' && (
                <div className="space-y-8">
                    {/* User Info Card */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <img 
                                src={userData?.profilePic || "/assets/adventurer-1739115902517.svg"} 
                                alt="Profile" 
                                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                            />
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
                        <div className="flex gap-3">
                            <button onClick={() => setActiveTab('Personal Info')} className="px-6 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2">
                                <FaCog /> Edit Profile
                            </button>
                            <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                                <FaCamera /> Upload Photo
                            </button>
                        </div>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard title="Total Tests" value={totalTests} icon={<FaClipboardList />} color="blue" chartData={[{value: 30}, {value: 45}, {value: 35}, {value: 50}]} />
                        <KPICard title="Average Score" value={avgScore} unit="%" icon={<FaTrophy />} color="green" chartData={[{value: 40}, {value: 55}, {value: 50}, {value: 70}]} />
                        <KPICard title="Overall Accuracy" value={accuracy} icon={<FaCheckCircle />} color="purple" chartData={[{value: 60}, {value: 65}, {value: 62}, {value: 68}]} />
                        <KPICard title="Best Score" value={bestScore} unit="%" icon={<FaStar />} color="orange" chartData={[{value: 50}, {value: 70}, {value: 85}, {value: 80}]} />
                    </div>
                </div>
            )}

            {activeTab === 'Personal Info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                           <FaIdCard className="text-blue-600" /> Personal Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    value={newProfile.name}
                                    onChange={e => setNewProfile({...newProfile, name: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                                <input 
                                    type="email" 
                                    value={newProfile.email}
                                    onChange={e => setNewProfile({...newProfile, email: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                                    <input 
                                        type="text" 
                                        value={newProfile.phone}
                                        onChange={e => setNewProfile({...newProfile, phone: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        value={newProfile.dob}
                                        onChange={e => setNewProfile({...newProfile, dob: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                        <button onClick={handleProfileUpdate} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                            Save Changes
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Preferences */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                            <h3 className="text-xl font-bold text-slate-800">Preferences</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Language</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium">
                                        <option>English</option>
                                        <option>Hindi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Difficulty Level</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium">
                                        <option>Intermediate</option>
                                        <option>Beginner</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>
                            </div>
                            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                                Save Changes
                            </button>
                        </div>

                        {/* Security Shortcut */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <FaLock />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Account Settings</h4>
                                    <p className="text-sm text-slate-500">Regularly update your password.</p>
                                </div>
                            </div>
                            <button onClick={() => setActiveTab('Security')} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600">
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {(activeTab === 'Preferences' || activeTab === 'Security') && (
                <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-slate-100 text-center space-y-4">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                        <FaCog className="animate-spin-slow" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">{activeTab} Section</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">This section is currently being updated to provide a better user experience.</p>
                </div>
            )}
        </div>
    );
};

export default Profile;
