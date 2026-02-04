import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const TestInstruction = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { apiBase } = useContext(ThemeContext);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We can fetch basic test info from the same list endpoint or a specific detail endpoint
    // For now, let's fetch the specific test if there's an endpoint, otherwise finding it from the list might be invalid if not loaded.
    // Assuming GET /api/test returns a list, checking if there is a detail endpoint. 
    // Usually GET /api/test/:id exists. Let's try that, or fallback to fetching all and filtering.
    // Based on previous code, testRoutes has router.get("/:id", ...).

    const fetchTestDetails = async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${apiBase}/api/test/${testId}`, { headers });
        setTest(response.data);
      } catch (error) {
        console.error("Error fetching test details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [testId, apiBase]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading instructions...</div>;
  if (!test) return <div className="flex justify-center items-center h-screen">Test not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 font-inter">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-teal-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2 font-poppins">{test.name}</h1>
            <p className="opacity-90">{test.description}</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                <FaClock className="text-teal-500" />
                <span>Duration: <strong>{test.duration || 60} Mins</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                <FaCheckCircle className="text-green-500" />
                <span>Total Marks: <strong>{test.totalMarks || 100}</strong></span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Instructions</h2>
            <ul className="space-y-3 text-gray-600 mb-8">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-teal-500">•</span>
                <span>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-teal-500">•</span>
                <span>The question palette at the right of screen shows one of the following statuses of each of the questions numbered.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-teal-500">•</span>
                <span>You can click on the &quot;&gt;&quot; arrow button to save your answer and move to the next question.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-teal-500">•</span>
                <span>Click on <strong>Submit Test</strong> only when you have completed the test. You cannot change answers after submission.</span>
              </li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="text-yellow-600" />
                <h3 className="font-bold text-yellow-800">Please Note</h3>
              </div>
              <p className="text-yellow-700 text-sm">Ensure you have a stable internet connection. Do not refresh the page during the test.</p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate(`/take-test/${testId}`)}
                className="px-8 py-3 rounded-lg font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                I am ready to begin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInstruction;
