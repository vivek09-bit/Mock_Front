import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { FaChartBar, FaEye, FaTrash, FaEdit, FaChevronRight, FaShareAlt, FaGlobe, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const InstructorTestList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiBase } = useContext(ThemeContext);

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${apiBase}/api/instructor/my-tests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTests(res.data.tests);
      setLoading(false);
    } catch (err) {
      console.error("Error loading tests", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [apiBase]);

  const handlePublish = async (testId, currentStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(`${apiBase}/api/instructor/publish/${testId}`,
        { isPublished: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTests(); // Refresh
      alert(`Test ${!currentStatus ? 'published' : 'unpublished'}!`);
    } catch (err) {
      alert("Failed to update test status.");
    }
  };

  const copyTestLink = (testId) => {
    const link = `${window.location.origin}/start-test/${testId}`;
    navigator.clipboard.writeText(link);
    alert("Shareable link copied to clipboard!");
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Assessments</h1>
          <p className="text-slate-500 font-medium">Overview of all tests you've created</p>
        </div>
        <Link
          to="/instructor/create-test"
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          New Assessment
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Test Details</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Attempts</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tests.length === 0 && !loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-medium italic">
                    No tests created yet. Let's build your first one!
                  </td>
                </tr>
              ) : (
                tests.map((test) => (
                  <tr key={test._id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                          {test.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-slate-800 font-bold block">{test.name}</p>
                          <p className="text-slate-400 text-xs font-medium">{test.category} • {test.examTarget}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${test.testType === 'static' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {test.testType}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-bold text-slate-700">24</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {test.isPublished ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                            <span className="text-sm font-bold text-teal-600">Published</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                            <span className="text-sm font-bold text-slate-400">Draft</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handlePublish(test._id, test.isPublished)}
                          className={`p-2 rounded-lg transition-colors ${test.isPublished ? 'text-teal-600 hover:bg-teal-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                          title={test.isPublished ? "Unpublish Test" : "Publish Test"}
                        >
                          {test.isPublished ? <FaLock /> : <FaGlobe />}
                        </button>
                        {test.isPublished && (
                          <button
                            onClick={() => copyTestLink(test._id)}
                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Copy Student Link"
                          >
                            <FaShareAlt />
                          </button>
                        )}
                        <Link
                          to={`/instructor/test-stats/${test._id}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Analytics"
                        >
                          <FaChartBar />
                        </Link>
                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <FaTrash />
                        </button>
                      </div>
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

export default InstructorTestList;
