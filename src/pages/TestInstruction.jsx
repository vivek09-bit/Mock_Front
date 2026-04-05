import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const TestInstruction = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { apiBase } = useContext(ThemeContext);

  const [test, setTest] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`${apiBase}/api/test/${testId}`, { headers });
        setTest(response.data);

        // Fetch latest user profile if logged in
        if (token) {
          try {
            const userRes = await axios.get(`${apiBase}/api/auth/profile`, { headers });
            setUserProfile(userRes.data.user);
          } catch (e) {
            console.error("Could not fetch user profile", e);
          }
        }
      } catch (error) {
        console.error("Error fetching test details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [testId, apiBase]);

  const handlePurchase = async (purchaseType) => {
    if (!userProfile) {
        alert("Please log in to purchase tests.");
        navigate('/login');
        return;
    }
    setPurchasing(true);
    try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.post(`${apiBase}/api/test/${testId}/purchase`, { purchaseType }, { headers });
        alert("Purchase successful! You can now start the test.");
        
        // Refresh profile to get updated tokens and unlocks
        const userRes = await axios.get(`${apiBase}/api/auth/profile`, { headers });
        setUserProfile(userRes.data.user);
    } catch (err) {
        if (err.response?.status === 402) {
            alert(`Insufficient tokens! You need ${err.response.data.required} but have ${err.response.data.balance}.`);
            // You can redirect to pricing here if needed
        } else {
            alert("An error occurred during purchase.");
        }
        console.error("Purchase error", err);
    } finally {
        setPurchasing(false);
    }
  };

  const isUnlocked = useMemo(() => {
    if (!test || !userProfile) return test?.tokenCostAttempt === 0 && test?.tokenCostPermanent === 0 && test?.tokenCost === 0; // free tests are unlocked
    
    // Check if free
    if (isDynamic) {
        if (!test.tokenCost || test.tokenCost === 0) return true;
    } else {
        if (!test.tokenCostAttempt && !test.tokenCostPermanent) return true;
    }

    // Check if permanently unlocked
    if (userProfile.unlockedTests?.includes(testId)) return true;

    // Check if has available attempts
    if (userProfile.availableAttempts && userProfile.availableAttempts[testId] > 0) return true;

    return false;
  }, [test, userProfile, isDynamic, testId]);

  // 🔥 Detect type
  const isDynamic = useMemo(() => !!test?.rules, [test]);

  // 🔥 Calculate totals
  const totalQuestions = useMemo(() => {
    if (!test) return 0;

    if (isDynamic) {
      return test.rules?.reduce((acc, r) => acc + (r.questionCount || 0), 0);
    }

    return test.questions?.length || 0;
  }, [test, isDynamic]);

  const totalMarks = useMemo(() => {
    if (!test) return 0;

    if (isDynamic) {
      return test.rules?.reduce((acc, r) => acc + (r.questionCount || 0), 0);
    }

    return test.questions?.reduce((acc, q) => acc + (q.marks || 1), 0);
  }, [test, isDynamic]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading instructions...</div>;
  if (!test) return <div className="flex justify-center items-center h-screen">Test not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 font-inter">
      <div className="container mx-auto px-4 max-w-4xl">

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-blue-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2 font-poppins">{test.name}</h1>
            <p className="opacity-90">{test.description}</p>
          </div>

          {/* Content */}
          <div className="p-8">

            {/* META INFO */}
            <div className="flex flex-wrap gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <FaClock className="text-blue-500" />
                <span>Duration: <strong>{test.duration || 60} mins</strong></span>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <FaCheckCircle className="text-green-500" />
                <span>Total Marks: <strong>{totalMarks}</strong></span>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <span>Questions: <strong>{totalQuestions}</strong></span>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <span>Type: <strong>{isDynamic ? "Dynamic" : "Static"}</strong></span>
              </div>
            </div>

            {/* 🔥 Dynamic Rules Section */}
            {isDynamic && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Test Breakdown</h2>

                <div className="space-y-2">
                  {test.rules?.map((rule, idx) => (
                    <div key={idx} className="flex justify-between bg-gray-50 p-3 rounded-lg text-sm">
                      <div>
                        {rule.subject} → {rule.topic}
                        {rule.difficulty && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({rule.difficulty})
                          </span>
                        )}
                      </div>
                      <div className="font-semibold">
                        {rule.questionCount} Qs
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Instructions</h2>

            <ul className="space-y-3 text-gray-600 mb-8">
              <li>• Timer is server controlled</li>
              <li>• Do not refresh during test</li>
              <li>• Submit only after completion</li>
              {isDynamic && (
                <li>• Questions will be generated dynamically based on rules</li>
              )}
            </ul>

            {/* Warning */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="text-yellow-600" />
                <h3 className="font-bold text-yellow-800">Please Note</h3>
              </div>
              <p className="text-yellow-700 text-sm">
                Ensure stable internet. Dynamic tests may vary per attempt.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 border-t pt-6 mt-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>

              {!isUnlocked ? (
                  <div className="flex gap-3">
                    {test.tokenCostAttempt > 0 && (
                        <button
                          disabled={purchasing}
                          onClick={() => handlePurchase('attempt')}
                          className="px-6 py-3 rounded-xl font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                        >
                          Unlock Once (🪙 {test.tokenCostAttempt})
                        </button>
                    )}
                    {test.tokenCostPermanent > 0 && (
                        <button
                          disabled={purchasing}
                          onClick={() => handlePurchase('permanent')}
                          className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          Unlock Permanently (🪙 {test.tokenCostPermanent})
                        </button>
                    )}
                    {isDynamic && test.tokenCost > 0 && (
                         <button
                         disabled={purchasing}
                         onClick={() => handlePurchase('attempt')}
                         className="px-6 py-3 rounded-xl font-bold text-white bg-purple-600 shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                       >
                         Generate Test (🪙 {test.tokenCost})
                       </button>
                    )}
                  </div>
              ) : (
                <button
                  onClick={() => navigate(`/take-test/${testId}`)}
                  className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 shadow-md hover:bg-blue-700 transition-colors"
                >
                  Start Test
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInstruction;