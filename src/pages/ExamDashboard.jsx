import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext'; // Import ThemeContext
import GoalSelector from '../components/GoalSelector';
import { FaFilter, FaSearch, FaChevronRight } from 'react-icons/fa';

const ExamDashboard = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(localStorage.getItem('examCategory') || null);
  const [selectedExam, setSelectedExam] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(!selectedCategory);
  
  const { apiBase } = useContext(ThemeContext); // Validate source
  const navigate = useNavigate();

  // Mock list of exams for the sidebar (in real app, fetch from DB)
  const EXAMS_BY_CATEGORY = {
    'banking': ['All', 'SBI PO', 'IBPS PO', 'RBI Grade B', 'SBI Clerk'],
    'ssc': ['All', 'SSC CGL', 'SSC CHSL', 'SSC MTS'],
    'railways': ['All', 'RRB NTPC', 'RRB Group D'],
    'state-exams': ['All', 'UP Police', 'Bihar SI']
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchTests();
    }
  }, [selectedCategory, selectedExam]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const params = { category: selectedCategory }; // Map ID to display name if needed
      
      // Basic filtering support
      if (selectedExam !== 'All') {
        params.examTarget = selectedExam;
      }

      console.log(`Fetching from: ${apiBase}/api/test`); // Debug log
      const response = await axios.get(`${apiBase}/api/test`, { params });
      setTests(response.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSelect = (category) => {
    setSelectedCategory(category);
    localStorage.setItem('examCategory', category);
    setShowGoalModal(false);
    setSelectedExam('All'); // Reset exam filter
  };

  const filteredTests = tests.filter(test => 
    test.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 font-inter">
      {/* Goal Selector Modal */}
      {showGoalModal && <GoalSelector onSelect={handleGoalSelect} />}

      <div className="container mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 font-poppins mb-2">
              {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Exams` : 'Dashboard'}
            </h1>
            <p className="text-gray-500">Prepare for your dream job with our curated mock tests.</p>
          </div>
          <button 
            onClick={() => setShowGoalModal(true)}
            className="mt-4 md:mt-0 px-6 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-full hover:bg-indigo-100 transition-colors"
          >
            Change Goal
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar / Exam Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <FaFilter className="text-blue-500" /> Exams
              </h3>
              <div className="space-y-2">
                {(EXAMS_BY_CATEGORY[selectedCategory] || []).map((exam) => (
                  <button
                    key={exam}
                    onClick={() => setSelectedExam(exam)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      selectedExam === exam
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {exam}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content / Test Grid */}
          <main className="flex-1">
            
            {/* Search Bar */}
            <div className="mb-6 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all shadow-sm"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredTests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                  <div key={test._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden group">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          test.difficulty === 'hard' ? 'bg-red-100 text-red-600' :
                          test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {test.stage || 'Practice'}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {test.type || 'Mock Test'}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {test.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                        {test.description || "Comprehensive mock test to boost your preparation."}
                      </p>
                      
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400">Total Questions</span>
                          <span className="font-bold text-gray-700">{test.questionSets?.reduce((acc, set) => acc + set.numToPick, 0) || 'N/A'}</span>
                        </div>
                        <button 
                          onClick={() => navigate(`/test/instruction/${test._id}`)}
                          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 shadow-blue-200 shadow-lg"
                        >
                          Start Now <FaChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No tests found for this category.</p>
                <p className="text-gray-400 text-sm mt-1">Try changing the Exam filter or selected category.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ExamDashboard;
