import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaFilter, FaSearch, FaUniversity, FaBook, FaTrain, FaGlobe } from 'react-icons/fa';

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiBase } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get active filters from URL
  const activeCategory = searchParams.get('category') || 'banking';
  const activeExam = searchParams.get('examTarget') || 'All';

  // Hardcoded Sidebar Categories (Matching Backend/GoalSelector)
  const CATEGORIES = [
    { id: 'banking', label: 'Banking', icon: <FaUniversity /> },
    { id: 'ssc', label: 'SSC', icon: <FaBook /> },
    { id: 'railways', label: 'Railways', icon: <FaTrain /> },
    { id: 'state-exams', label: 'State Exams', icon: <FaGlobe /> }
  ];

  const EXAMS_BY_CATEGORY = {
    'banking': ['All', 'SBI PO', 'IBPS PO', 'RBI Grade B', 'SBI Clerk'],
    'ssc': ['All', 'SSC CGL', 'SSC CHSL', 'SSC MTS'],
    'railways': ['All', 'RRB NTPC', 'RRB Group D'],
    'state-exams': ['All', 'UP Police', 'Bihar SI']
  };

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        // Build query params
        const params = { category: activeCategory };
        if (activeExam !== 'All') params.examTarget = activeExam;

        const response = await axios.get(`${apiBase}/api/test`, {
          params,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setTests(response.data);
      } catch (err) {
        console.error("Failed to fetch tests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [apiBase, activeCategory, activeExam]);

  const handleCategoryChange = (catId) => {
    setSearchParams({ category: catId, examTarget: 'All' });
  };

  const handleExamChange = (examName) => {
    setSearchParams({ category: activeCategory, examTarget: examName });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-teal-50">

      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 bg-white border-r border-teal-200 p-6 flex-shrink-0">
        <h3 className="font-bold text-teal-800 mb-6 flex items-center gap-2 text-lg">
          <FaFilter className="text-teal-600" /> Filters
        </h3>

        {/* Category List */}
        <div className="mb-8">
          <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">Categories</h4>
          <div className="space-y-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeCategory === cat.id
                  ? 'bg-teal-50 text-teal-700 font-bold border border-teal-100 shadow-sm'
                  : 'text-teal-600 hover:bg-teal-50'
                  }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Exam List (Dependent on Category) */}
        <div>
          <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">Exams</h4>
          <div className="space-y-1">
            {(EXAMS_BY_CATEGORY[activeCategory] || []).map(exam => (
              <button
                key={exam}
                onClick={() => handleExamChange(exam)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${activeExam === exam
                  ? 'bg-teal-800 text-white font-medium'
                  : 'text-teal-600 hover:bg-teal-100'
                  }`}
              >
                {exam}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-teal-800">
              {activeCategory ? CATEGORIES.find(c => c.id === activeCategory)?.label : 'All'} Tests
              {activeExam !== 'All' && <span className="text-teal-400 font-light"> / {activeExam}</span>}
            </h1>
            <p className="text-teal-500 mt-1">Found {tests.length} tests available for you.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : tests.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test._id}
                className="bg-white shadow-sm hover:shadow-xl rounded-2xl p-6 border border-teal-100 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 transform -tranteal-x-full group-hover:tranteal-x-0 transition-transform duration-300" />

                <div className="flex justify-between items-start mb-3">
                  <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">{test.stage || 'Prelims'}</span>
                  <span className="text-teal-400 text-xs font-semibold">{test.type || 'Full Test'}</span>
                </div>

                <h3 className="text-lg font-bold text-teal-800 mb-2 group-hover:text-teal-700 transition-colors line-clamp-1">{test.name}</h3>
                <p className="text-teal-500 text-sm mb-6 line-clamp-2 h-10">{test.description}</p>

                <div className="flex items-center justify-between border-t border-teal-50 pt-4 mt-auto">
                  <div className="text-xs text-teal-400 font-medium">
                    {test.questionSets?.reduce((acc, s) => acc + s.numToPick, 0) || 0} Questions
                  </div>
                  <Link
                    to={`/test/instruction/${test._id}`}
                    className="bg-teal-900 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg transition-all text-sm transform active:scale-95"
                  >
                    Start Test
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-teal-200">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-teal-500 text-lg font-medium">No tests found in this category.</p>
            <button
              onClick={() => handleExamChange('All')}
              className="mt-4 text-teal-600 font-bold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default TestList;