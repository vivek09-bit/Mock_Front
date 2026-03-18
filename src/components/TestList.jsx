import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { Link, useSearchParams } from "react-router-dom";
import { FaFilter, FaUniversity, FaBook, FaTrain, FaGlobe, FaLayerGroup, FaGraduationCap } from 'react-icons/fa';

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [filterMetadata, setFilterMetadata] = useState([]); // Stores dynamic categories/exams
  const [loading, setLoading] = useState(true);
  const { apiBase } = useContext(ThemeContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') || '';
  const activeExam = searchParams.get('examTarget') || 'All';

  // 1. Helper to map icons to dynamic category names
  const getIcon = (categoryName) => {
    const map = {
      'Banking': <FaUniversity />,
      'SSC': <FaBook />,
      'Railways': <FaTrain />,
      'State Exams': <FaGlobe />,
    };
    return map[categoryName] || <FaGraduationCap />; // Default icon
  };

  // 2. Fetch Filter Metadata (Categories & Exams)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(`${apiBase}/api/test/meta/filters`);
        setFilterMetadata(response.data);
      } catch (err) {
        console.error("Failed to fetch filter metadata", err);
      }
    };
    fetchMetadata();
  }, [apiBase]);

  // 3. Fetch Tests based on active filters
  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const params = {};
        if (activeCategory) params.category = activeCategory;
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

  const getQuestionCount = (test) => {
    if (test.questions && Array.isArray(test.questions)) return test.questions.length;
    if (test.questionSets && Array.isArray(test.questionSets)) {
      return test.questionSets.reduce((acc, s) => acc + (s.numToPick || 0), 0);
    }
    return 0;
  };

  const handleCategoryChange = (catId) => setSearchParams({ category: catId, examTarget: 'All' });
  const handleExamChange = (examName) => setSearchParams({ category: activeCategory, examTarget: examName });

  // 4. Derive available exams for the sidebar based on fetched metadata
  const currentCategoryData = filterMetadata.find(m => m.category === activeCategory);
  const dynamicExams = currentCategoryData ? ['All', ...currentCategoryData.exams] : [];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-purple-50">
      <aside className="w-full md:w-64 bg-white border-r border-blue-200 p-6 flex-shrink-0">
        <h3 className="font-bold text-blue-800 mb-6 flex items-center gap-2 text-lg">
          <FaFilter className="text-blue-600" /> Filters
        </h3>

        {/* Dynamic Categories */}
        <div className="mb-8">
          <h4 className="text-xs font-bold text-blue-400 uppercase mb-3">Categories</h4>
          <div className="space-y-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeCategory === '' ? 'bg-purple-50 text-purple-700 font-bold border border-blue-100' : 'text-blue-600 hover:bg-blue-50'
                }`}
            >
              <FaLayerGroup /> <span>All</span>
            </button>

            {filterMetadata.map(item => (
              <button
                key={item.category}
                onClick={() => handleCategoryChange(item.category)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeCategory === item.category ? 'bg-purple-50 text-purple-700 font-bold border border-blue-100' : 'text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {getIcon(item.category)} <span>{item.category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Exams */}
        {activeCategory && (
          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase mb-3">Exams</h4>
            <div className="space-y-1">
              {dynamicExams.map(exam => (
                <button
                  key={exam}
                  onClick={() => handleExamChange(exam)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${activeExam === exam ? 'bg-purple-800 text-white' : 'text-blue-600 hover:bg-blue-100'
                    }`}
                >
                  {exam}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-800 capitalize">
            {activeCategory || 'All'} Tests {activeExam !== 'All' && <span className="text-blue-400 font-light">/ {activeExam}</span>}
          </h1>
          <p className="text-blue-500 mt-1">Found {tests.length} tests available.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div key={test._id} className="bg-white shadow-sm hover:shadow-xl rounded-2xl p-6 border border-blue-100 flex flex-col group relative overflow-hidden transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase">{test.stage || 'Prelims'}</span>
                  <span className="text-blue-400 text-xs font-semibold">{test.type || 'Sectional'}</span>
                </div>
                <h3 className="text-lg font-bold text-blue-800 mb-2 line-clamp-1">{test.name}</h3>
                <p className="text-blue-500 text-sm mb-6 line-clamp-2 h-10">{test.description}</p>
                <div className="flex items-center justify-between border-t border-blue-50 pt-4 mt-auto">
                  <div className="text-xs text-blue-400 font-medium">{getQuestionCount(test)} Questions</div>
                  <Link to={`/test/instruction/${test._id}`} className="bg-blue-900 hover:bg-purple-900 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all active:scale-95">
                    Start Test
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TestList;