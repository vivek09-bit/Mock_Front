import React, { useEffect, useState, useContext, useMemo } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import {
    FaUserCircle, FaCalendarAlt, FaCheckCircle, FaTimesCircle,
    FaChevronLeft, FaSearch, FaFileDownload, FaFlag, FaBan, FaFilter
} from 'react-icons/fa';

const TestAnalytics = () => {
    const { testId } = useParams();
    const [stats, setStats] = useState([]);
    const [summary, setSummary] = useState(null);
    const [requiredFields, setRequiredFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statsFilter, setStatsFilter] = useState("all"); // 'all', 'submitted', 'started'
    const [statusFilter, setStatusFilter] = useState("all");
    const { apiBase } = useContext(ThemeContext);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.get(`${apiBase}/api/instructor/test-stats/${testId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const normalizedStats = (res.data.stats || []).map((record) => {
                const attemptsArray = record.attempts
                    ? Array.isArray(record.attempts)
                        ? record.attempts
                        : Object.values(record.attempts)
                    : [];

                const latestAttempt =
                    attemptsArray.length > 0
                        ? attemptsArray[attemptsArray.length - 1]
                        : null;

                const submissionCount = attemptsArray.length;

                const startedAt =
                    latestAttempt?.startedAt ||
                    record.startedAt ||
                    record.lastAttempted ||
                    record.createdAt;

                const submittedAt =
                    latestAttempt?.submittedAt ||
                    record.submittedAt ||
                    null;

                const isSubmitted =
                    record.testStatus === "SUBMITTED" ||
                    !!submittedAt ||
                    submissionCount > 0;

                return {
                    ...record,
                    attemptsArray,
                    latestAttempt,
                    submissionCount,
                    startedAt,
                    submittedAt,
                    testStatus: isSubmitted ? "SUBMITTED" : (record.testStatus || "STARTED"),
                    bestScore: record.bestScore ?? latestAttempt?.score ?? 0,
                };
            });

            setStats(normalizedStats);
            setSummary(res.data.summary || null);
            setRequiredFields(res.data.requiredFields || []);
            setLoading(false);
            // console.log("Normalized stats:", normalizedStats);
        } catch (err) {
            console.error("Error loading stats", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [apiBase, testId]);

    const handleFlag = async (recordId, currentFlagged) => {
        const reason = !currentFlagged ? prompt("Reason for flagging this student?") : "";
        if (!currentFlagged && reason === null) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.post(`${apiBase}/api/instructor/flag-student`,
                { recordId, isFlagged: !currentFlagged, reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (err) {
            alert("Failed to update flag status");
        }
    };

    const handleBlacklist = async (record) => {
        const reason = prompt(`Reason for blacklisting ${record.userId?.name || record.studentDetails?.Name || 'this student'}?`);
        if (reason === null) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.post(`${apiBase}/api/instructor/blacklist-student`,
                {
                    email: record.studentDetails?.Email || record.studentDetails?.email || record.userId?.email,
                    userId: record.userId?._id,
                    reason
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Student added to blacklist. They will be blocked from future assessments.");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to blacklist student");
        }
    };

    const filteredStats = useMemo(() => {
        return stats.filter(record => {
            const name = (record.userId?.name || record.studentDetails?.Name || record.studentDetails?.name || "").toLowerCase();
            const email = (record.userId?.email || record.studentDetails?.Email || record.studentDetails?.email || "").toLowerCase();

            const customFieldsText = Object.values(record.studentDetails || {})
                .map(v => String(v ?? ""))
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                name.includes(searchTerm.toLowerCase()) ||
                email.includes(searchTerm.toLowerCase()) ||
                customFieldsText.includes(searchTerm.toLowerCase());

            const isSubmitted =
                record.testStatus === "SUBMITTED" ||
                !!record.submittedAt ||
                (record.submissionCount || 0) > 0;

            const isQualified = isSubmitted
                ? record.bestScore >= (record.testDetails?.passingScore || 0)
                : false;

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "qualified" && isSubmitted && isQualified) ||
                (statusFilter === "failed" && isSubmitted && !isQualified);

            const matchesStatsFilter =
                statsFilter === "all" ||
                (statsFilter === "submitted" && isSubmitted) ||
                (statsFilter === "started" && !isSubmitted);

            return matchesSearch && matchesStatus && matchesStatsFilter;
        });
    }, [stats, searchTerm, statusFilter, statsFilter]);

    const exportToCSV = () => {
        if (filteredStats.length === 0) return;

        const headers = ["Name", "Email", "Date", "Status", "Score", "Submission Count", ...requiredFields];

        const rows = filteredStats.map(r => {
            const isSubmitted =
                r.testStatus === "SUBMITTED" ||
                !!r.submittedAt ||
                (r.submissionCount || 0) > 0;

            const isQualified = isSubmitted
                ? r.bestScore >= (r.testDetails?.passingScore || 0)
                : false;

            return [
                r.userId?.name || r.studentDetails?.Name || r.studentDetails?.name || 'Anonymous',
                r.userId?.email || r.studentDetails?.Email || r.studentDetails?.email || 'N/A',
                new Date(r.startedAt || r.lastAttempted || r.createdAt).toLocaleString(),
                isSubmitted ? (isQualified ? "QUALIFIED" : "FAILED") : "STARTED",
                isSubmitted ? r.bestScore : "N/A",
                r.submissionCount || 0,
                ...requiredFields.map(f => r.studentDetails?.[f] || 'N/A')
            ].join(",");
        });

        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Results_${testId}.csv`;
        a.click();
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen space-x-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fadeIn pb-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link to="/instructor/my-tests" className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-400 hover:text-indigo-600">
                        <FaChevronLeft />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Test Analytics</h1>
                        <p className="text-slate-500 font-medium">Tracking {summary?.totalStarted || 0} candidates ({summary?.totalSubmitted || 0} submitted)</p>
                    </div>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                    <FaFileDownload /> Export CSV
                </button>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Started</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-black text-blue-600">{summary?.totalStarted || 0}</h3>
                        <p className="text-slate-400 text-sm mb-1 font-medium">Students</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Submitted</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-black text-indigo-600">{summary?.totalSubmitted || 0}</h3>
                        <p className="text-slate-400 text-sm mb-1 font-medium">Attempts</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Qualified Rate</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-black text-teal-600">
                            {summary?.totalSubmitted ? Math.round((summary.qualifiedCount / summary.totalSubmitted) * 100) : 0}%
                        </h3>
                        <p className="text-slate-400 text-sm mb-1 font-medium">{summary?.qualifiedCount}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Mean Score</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-black text-orange-600">{summary?.avgScore || 0}%</h3>
                        <p className="text-slate-400 text-sm mb-1 font-medium">Average</p>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search name, email, or roll no..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-full md:w-auto">
                        {['all', 'started', 'submitted'].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatsFilter(f)}
                                className={`flex-1 md:w-auto px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${statsFilter === f ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                title={f === 'started' ? 'Tests initiated but not submitted' : f === 'submitted' ? 'Tests with submissions' : 'All test records'}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-full md:w-auto">
                        {['all', 'qualified', 'failed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`flex-1 md:w-28 py-2 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidate</th>
                                {requiredFields.map(field => (
                                    <th key={field} className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{field}</th>
                                ))}
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Started Date</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Result</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Moderation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStats.length === 0 ? (
                                <tr>
                                    <td colSpan={requiredFields.length + 5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <FaFilter className="text-4xl text-slate-200" />
                                            <p className="text-slate-400 font-bold italic">No candidates match your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStats.map((record) => {
                                    const isSubmitted =
                                        record.testStatus === "SUBMITTED" ||
                                        !!record.submittedAt ||
                                        (record.submissionCount || 0) > 0;
                                    const isQualified = isSubmitted ? record.bestScore >= (record.testDetails?.passingScore || 0) : false;
                                    return (
                                        <tr key={record._id} className={`hover:bg-slate-50/50 transition-colors group ${record.isFlagged ? 'bg-amber-50/30' : ''}`}>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                                        <FaUserCircle className="text-2xl" />
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-800 font-bold block leading-tight">
                                                            {record.userId?.name || record.studentDetails?.Name || record.studentDetails?.name || 'Guest'}
                                                        </p>
                                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                                                            {record.userId?.email || record.studentDetails?.Email || record.studentDetails?.email || 'Individual Session'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Dynamic Custom Fields */}
                                            {requiredFields.map(field => (
                                                <td key={field} className="px-8 py-5">
                                                    <span className="text-slate-600 font-bold text-sm">
                                                        {record.studentDetails?.[field] || <span className="text-slate-300">—</span>}
                                                    </span>
                                                </td>
                                            ))}

                                            <td className="px-8 py-5">
                                                <span className="text-slate-600 font-bold text-sm">
                                                    {new Date(record.startedAt || record.lastAttempted || record.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>

                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className={`text-lg font-black leading-none ${isSubmitted && isQualified ? 'text-teal-600' : isSubmitted ? 'text-red-500' : 'text-slate-300'}`}>
                                                        {isSubmitted ? `${record.bestScore}%` : "—"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                        {isSubmitted ? `Pass: ${record.testDetails?.passingScore}%` : `Attempts: ${record.submissionCount || 0}`}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-8 py-5">
                                                {isSubmitted ? (
                                                    isQualified ? (
                                                        <span className="inline-flex items-center gap-2 text-teal-600 bg-teal-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                            <FaCheckCircle /> Qualified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                            <FaTimesCircle /> Failed
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                        In Progress
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleFlag(record._id, record.isFlagged)}
                                                        className={`p-2 rounded-lg transition-colors ${record.isFlagged ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:bg-slate-100 hover:text-amber-500'}`}
                                                        title={record.isFlagged ? `Flagged: ${record.flagReason}` : "Flag for Review"}
                                                    >
                                                        <FaFlag />
                                                    </button>
                                                    <button
                                                        onClick={() => handleBlacklist(record)}
                                                        className="p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                        title="Blacklist from future tests"
                                                    >
                                                        <FaBan />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TestAnalytics;
