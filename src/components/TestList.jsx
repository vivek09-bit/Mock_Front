import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { Link, useSearchParams } from "react-router-dom";
import { FaFilter, FaBolt, FaUniversity, FaBook, FaTrain, FaGlobe, FaLayerGroup, FaGraduationCap, FaRegFileAlt, FaClock, FaChevronRight, FaTimes, FaSave } from 'react-icons/fa';

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [filterMetadata, setFilterMetadata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { apiBase } = useContext(ThemeContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') || '';
  const activeExam = searchParams.get('examTarget') || 'All';

  // Interest Popup State
  const [showInterestPopup, setShowInterestPopup] = useState(false);
  const [userPreferences, setUserPreferences] = useState({});
  const [tempCategory, setTempCategory] = useState("");
  const [tempExam, setTempExam] = useState("");
  const [popupError, setPopupError] = useState("");

  const targetCategoryData = filterMetadata.find(m => m.category === tempCategory);
  const targetExams = targetCategoryData ? ['All', ...targetCategoryData.exams] : ['All'];

  // Pagination settings
  const itemsPerPage = 12; // Display 12 tests per page (middle of 10-15 range)

  // 1. Helper to map icons to dynamic category names
  const getIcon = (categoryName) => {
    const map = {
      'Banking': <FaUniversity />,
      'SSC': <FaBook />,
      'Railways': <FaTrain />,
      'State Exams': <FaGlobe />,
      'Medical': <FaBolt />,
      'NEET': <FaBolt />,
      'Engineering': <FaLayerGroup />,
      'JEE': <FaLayerGroup />,
    };
    return map[categoryName] || <FaGraduationCap />; // Default icon
  };

  // 2. Fetch Filter Metadata (Categories & Exams)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(`${apiBase}/api/test/filters`);
        setFilterMetadata(response.data);
      } catch (err) {
        console.error("Failed to fetch filter metadata", err);
      }
    };
    fetchMetadata();
  }, [apiBase]);

  // 2.5 Fetch user preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      console.log("[DEBUG] Starting fetchPreferences...");
      try {
        const token = localStorage.getItem("authToken");
        console.log("[DEBUG] Auth Token found:", !!token);
        if (!token) return;

        const response = await axios.get(`${apiBase}/api/user/preferences`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const prefs = response.data || {};
        console.log("[DEBUG] User Preferences:", prefs);
        setUserPreferences(prefs);

        const urlCat = searchParams.get('category');
        if (!prefs.interestCategory && !prefs.interestExam) {
          console.log("[DEBUG] No interest set. Showing popup...");
          setShowInterestPopup(true);
        } else if (!urlCat) {
          console.log("[DEBUG] Using stored preferences for filtering...");
          setSearchParams({
            category: prefs.interestCategory || '',
            examTarget: prefs.interestExam || 'All'
          });
        }
      } catch (err) {
        console.error("[DEBUG] Failed to fetch user preferences", err);
      }
    };
    fetchPreferences();
  }, [apiBase, searchParams, setSearchParams]);

  const handleSaveInterest = async () => {
    try {
      setPopupError("");
      const token = localStorage.getItem("authToken");
      if (!token) {
        setShowInterestPopup(false);
        return;
      }

      const newPreferences = {
        ...userPreferences,
        interestCategory: tempCategory,
        interestExam: tempExam || 'All'
      };

      await axios.put(`${apiBase}/api/user/preferences`, newPreferences, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserPreferences(newPreferences);
      setShowInterestPopup(false);
      setSearchParams({ category: tempCategory, examTarget: tempExam || 'All' });
    } catch (err) {
      setPopupError("Failed to save preferences. Please try again!");
      console.error("Failed to update user preferences", err);
    }
  };

  const handleDismissPopup = () => {
    setShowInterestPopup(false);
    // If interest is set, default to it instead of empty
    const defaultCat = userPreferences.interestCategory || '';
    const defaultExam = userPreferences.interestExam || 'All';
    setSearchParams({ category: defaultCat, examTarget: defaultExam });
  };

  // 3. Fetch Tests based on active filters
  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      setCurrentPage(1); // Reset to first page when filters change
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

  const handleCategoryChange = (catId) => {
    if (catId === '' && userPreferences.interestCategory) {
      // If choosing "All", but has an interest, show only interest category
      setSearchParams({ category: userPreferences.interestCategory, examTarget: userPreferences.interestExam || 'All' });
    } else {
      setSearchParams({ category: catId, examTarget: 'All' });
    }
  };
  const handleExamChange = (examName) => setSearchParams({ category: activeCategory, examTarget: examName });

  // 4. Derive available exams for the sidebar based on fetched metadata
  const currentCategoryData = filterMetadata.find(m => m.category === activeCategory);
  const dynamicExams = currentCategoryData ? ['All', ...currentCategoryData.exams] : [];

  // Pagination calculations
  const totalPages = Math.ceil(tests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTests = tests.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeCategory === '' || activeCategory === userPreferences.interestCategory ? 'bg-purple-50 text-purple-700 font-bold border border-blue-100' : 'text-blue-600 hover:bg-blue-50'
                }`}
            >
              <FaLayerGroup /> <span>{userPreferences.interestCategory ? 'My Goal' : 'All'}</span>
            </button>

            {filterMetadata
              .filter(item => !userPreferences.interestCategory || item.category === userPreferences.interestCategory)
              .map(item => (
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
          <div className="mb-8 animate-in fade-in slide-in-from-top-1 duration-300">
            <h4 className="text-xs font-bold text-blue-400 uppercase mb-3">Exams</h4>
            <div className="space-y-1">
              {dynamicExams
                .filter(exam => activeExam === 'All' || exam === activeExam || exam === 'All')
                .map(exam => (
                  <button
                    key={exam}
                    onClick={() => handleExamChange(exam)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${activeExam === exam ? 'bg-purple-800 text-white shadow-md' : 'text-blue-600 hover:bg-blue-100'
                      }`}
                  >
                    {exam}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Personalized Sections: Subjects & Topics (Always Appear) */}
        <div className="mb-8 opacity-60">
          <h4 className="text-xs font-bold text-blue-400 uppercase mb-3">Subjects</h4>
          <p className="text-[10px] text-slate-400 italic px-4">All subjects for {activeExam === 'All' ? activeCategory : activeExam} will appear here.</p>
        </div>

        <div className="mb-8 opacity-60">
          <h4 className="text-xs font-bold text-blue-400 uppercase mb-3">Topics</h4>
          <p className="text-[10px] text-slate-400 italic px-4">Topic-wise refinement available for selected tests.</p>
        </div>

        {/* Debug Button - Can be removed later */}
        <div className="mt-10 pt-6 border-t border-blue-100">
          <button
            onClick={() => setShowInterestPopup(true)}
            className="w-full text-[10px] font-bold text-blue-600 hover:text-blue-500 uppercase tracking-widest text-left"
          >
            Manage Interests (Debug)
          </button>
        </div>
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
        ) : tests.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedTests.map((test) => (
                <div key={test._id} className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 flex flex-col relative overflow-hidden">
                  {/* Accent line */}
                  <div className="absolute top-0 left-0 w-1.5 h-0 bg-indigo-600 group-hover:h-full transition-all duration-300" />

                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
                      {test.stage || 'Prelims'}
                    </span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                      {test.type || 'Sectional'}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {test.name}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 min-h-[2.5rem]">
                      {test.description || "No description provided for this mock test."}
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-slate-400 font-bold text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <FaRegFileAlt className="text-indigo-400" />
                        {getQuestionCount(test)} Qs
                      </div>
                      {test.duration && (
                        <div className="flex items-center gap-1.5">
                          <FaClock className="text-indigo-400" />
                          {test.duration} Min
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/test/instruction/${test._id}`}
                      className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-black py-2.5 px-5 rounded-2xl transition-all active:scale-95 shadow-lg shadow-slate-200 group/btn"
                    >
                      Start <FaChevronRight className="text-[8px] group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-6 mt-12 pt-8 border-t border-slate-200">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>

                  <div className="flex gap-1 items-center">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-colors ${currentPage === page
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>

                <p className="text-sm text-slate-500 font-medium">
                  Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, tests.length)} of {tests.length} tests
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-slate-500">No tests found. Try adjusting your filters.</p>
          </div>
        )}
      </main>

      {/* Interest Selection Popup Modal */}
      {showInterestPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 flex flex-col gap-6">
            <button
              onClick={handleDismissPopup}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <FaTimes size={20} />
            </button>

            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">What's your goal?</h2>
              <p className="text-slate-500 font-medium text-sm">
                Select your interest so we can show you the most relevant test sets!
              </p>
            </div>

            {popupError && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold border border-red-100">
                {popupError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Select Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {filterMetadata.map(item => (
                    <button
                      key={item.category}
                      onClick={() => { setTempCategory(item.category); setTempExam('All'); }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all border text-sm font-semibold ${tempCategory === item.category
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                        }`}
                    >
                      {getIcon(item.category)} <span className="truncate">{item.category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {tempCategory && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Select Exam Target</label>
                  <select
                    value={tempExam}
                    onChange={(e) => setTempExam(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none"
                  >
                    {targetExams.map(exam => (
                      <option key={exam} value={exam}>{exam}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={handleDismissPopup}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleSaveInterest}
                disabled={!tempCategory}
                className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                <FaSave /> Save Interest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestList;