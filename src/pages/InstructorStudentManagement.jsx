import React, { useEffect, useState, useContext, useMemo } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { 
    FaUsers, FaSearch, FaFileDownload, FaUserCircle, 
    FaChartBar, FaClock, FaBan, FaFilter 
} from 'react-icons/fa';

const InstructorStudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { apiBase } = useContext(ThemeContext);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.get(`${apiBase}/api/instructor/all-students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(res.data.students || []);
            setLoading(false);
        } catch (err) {
            console.error("Error loading students", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [apiBase]);

    const handleBlacklist = async (student) => {
        const reason = prompt(`Reason for blacklisting ${student.name}?`);
        if (reason === null) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.post(`${apiBase}/api/instructor/blacklist-student`, 
                { 
                    email: student.email,
                    userId: student.userId,
                    reason 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Student blacklisted successfully.");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to blacklist student");
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const search = searchTerm.toLowerCase();
            return (
                s.name.toLowerCase().includes(search) || 
                s.email.toLowerCase().includes(search) ||
                (s.username && s.username.toLowerCase().includes(search))
            );
        });
    }, [students, searchTerm]);

    const exportToCSV = () => {
        if (filteredStudents.length === 0) return;

        const headers = ["Name", "Email", "Total Tests", "Avg Score", "Last Activity"];
        const rows = filteredStudents.map(s => [
            s.name,
            s.email,
            s.totalTests,
            `${s.avgScore}%`,
            new Date(s.lastActivity).toLocaleDateString()
        ].join(","));

        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "Instructor_Students_List.csv";
        a.click();
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen space-x-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce delay-200"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fadeIn pb-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Directory</h1>
                    <p className="text-slate-500 font-medium">Managing {students.length} unique candidates across all assessments</p>
                </div>
                <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                    <FaFileDownload /> Export Directory
                </button>
            </header>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Reach</p>
                    <h3 className="text-2xl font-black text-slate-800">{students.length}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Engaged Since</p>
                    <h3 className="text-2xl font-black text-indigo-600">30 Days</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Avg. Participation</p>
                    <h3 className="text-2xl font-black text-teal-600">
                        {students.length > 0 ? (students.reduce((acc, s) => acc + s.totalTests, 0) / students.length).toFixed(1) : 0}
                    </h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Global Avg Score</p>
                    <h3 className="text-2xl font-black text-purple-600">
                        {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.avgScore, 0) / students.length) : 0}%
                    </h3>
                </div>
            </div>

            {/* Search & Bulk Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search student name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Information</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assessments</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Score</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Activity</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <FaUsers className="text-4xl text-slate-200" />
                                            <p className="text-slate-400 font-bold italic">No students found in your directory.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <FaUserCircle className="text-2xl" />
                                                </div>
                                                <div>
                                                    <p className="text-slate-800 font-bold leading-tight">{student.name}</p>
                                                    <p className="text-slate-400 text-[10px] font-bold uppercase">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="inline-flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1 rounded-lg text-xs font-bold border border-slate-100">
                                                <FaChartBar className="text-indigo-400" /> {student.totalTests} Mocks
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${student.avgScore > 70 ? 'bg-teal-500' : student.avgScore > 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${student.avgScore}%` }}></div>
                                                </div>
                                                <span className="text-sm font-black text-slate-700">{student.avgScore}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                                <FaClock className="text-slate-300" /> {new Date(student.lastActivity).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => handleBlacklist(student)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Blacklist Student"
                                            >
                                                <FaBan />
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

export default InstructorStudentManagement;
