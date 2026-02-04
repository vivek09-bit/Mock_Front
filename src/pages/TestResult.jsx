import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaRedo, FaHome, FaCheckCircle, FaTimesCircle, FaChartPie, FaListAlt } from "react-icons/fa";
import Confetti from "react-confetti";

const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, attempted } = location.state || {};
  const [showConfetti, setShowConfetti] = useState(false);

  // Theme Colors
  const themeColor = "#00695C"; // Teal from TakeTest
  const successColor = "#4CAF50";
  const errorColor = "#EF5350";
  const warningColor = "#FF9800";

  useEffect(() => {
    if (result?.passed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
    }
  }, [result]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 font-sans">
        <h2 className="text-3xl font-bold mb-4">No Result Found</h2>
        <p className="text-gray-500 mb-8">It looks like you haven't completed a test yet.</p>
        <button
          className="px-6 py-3 bg-teal-700 text-white rounded-lg shadow-md hover:bg-teal-800 transition duration-300 font-semibold"
          onClick={() => navigate("/")}
        >
          Go Back Home
        </button>
      </div>
    );
  }

  // Calculate stats
  const totalQuestions = result.totalQuestions || 0;
  const correct = result.correctAnswers || 0;
  // Use passed attempted count, or fallback to result.attempted, or infer from correct if missing (fallback)
  const attemptedCount = attempted !== undefined ? attempted : (result.attempted || 0);

  // Wrong is Attempted minus Correct. (Ensure non-negative)
  const wrong = Math.max(0, attemptedCount - correct);

  // Skipped is Total minus Attempted
  const skipped = Math.max(0, totalQuestions - attemptedCount);

  const accuracy = attemptedCount > 0 ? Math.round((correct / attemptedCount) * 100) : 0;
  const isPassed = result.passed;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 font-sans">
      {showConfetti && <Confetti numberOfPieces={300} recycle={false} />}

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Score Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden text-center sticky top-24">
            <div className={`${isPassed ? 'bg-teal-700' : 'bg-red-600'} text-white p-8 relative overflow-hidden`}>
              <div className="relative z-10">
                <h2 className="text-xl font-medium opacity-90 uppercase tracking-widest">{result.testName}</h2>
                <div className="mt-6 mb-2">
                  <span className="text-7xl font-extrabold">{result.score}</span>
                  <span className="text-2xl opacity-75"> / 100</span>
                </div>
                <div className="inline-block px-4 py-1 rounded-full bg-white bg-opacity-20 backdrop-blur-sm text-sm font-bold mt-2">
                  {isPassed ? "PASS" : "FAIL"}
                </div>
              </div>
              {/* Decorative Circle */}
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white opacity-10 rounded-full"></div>
            </div>

            <div className="p-8">
              <p className="text-gray-600 mb-6 font-medium">
                {isPassed
                  ? "Excellent work! You have cleared this test successfully."
                  : "Don't give up! Review your mistakes and try again."}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-gray-400 text-xs uppercase mb-1">Accuracy</p>
                  <p className="font-bold text-gray-800 text-lg">{accuracy}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-gray-400 text-xs uppercase mb-1">Duration</p>
                  <p className="font-bold text-gray-800 text-lg">--:--</p> {/* Placeholder if time not passed */}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  className="w-full py-3 bg-teal-700 text-white rounded-lg font-bold shadow hover:bg-teal-800 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  onClick={() => navigate(`/take-test/${result.testId}`)}
                >
                  <FaRedo /> Retake Test
                </button>
                <button
                  className="w-full py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  onClick={() => navigate("/")}
                >
                  <FaHome /> Back Home
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Analytics */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Section 1: Quick Stats Grid */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaChartPie className="text-teal-600" /> Performance Summary
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{totalQuestions}</div>
                <div className="text-xs text-blue-400 font-bold uppercase">Total Qs</div>
              </div>
              <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{result.correctAnswers}</div>
                <div className="text-xs text-green-400 font-bold uppercase">Correct</div>
              </div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">{wrong}</div>
                <div className="text-xs text-red-400 font-bold uppercase">Incorrect</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <div className="text-3xl font-bold text-gray-600 mb-1">{skipped}</div>
                <div className="text-xs text-gray-400 font-bold uppercase">Skipped</div>
              </div>
            </div>
          </div>

          {/* Section 2: Question Breakdown (Placeholder for future detail list) */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaListAlt className="text-teal-600" /> Question Analysis
              </h3>
              <span className="text-sm text-gray-400">Detailed breakdown coming soon</span>
            </div>

            <div className="space-y-4">
              {/* Visual Bars for representation */}
              <div>
                <div className="flex justify-between text-sm mb-1 text-gray-600">
                  <span>Correct Answers</span>
                  <span className="font-bold">{Math.round((correct / totalQuestions) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(correct / totalQuestions) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1 text-gray-600">
                  <span>Incorrect Answers</span>
                  <span className="font-bold">{Math.round((wrong / totalQuestions) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-red-500 h-3 rounded-full" style={{ width: `${(wrong / totalQuestions) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1 text-gray-600">
                  <span>Skipped</span>
                  <span className="font-bold">{Math.round((skipped / totalQuestions) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-gray-400 h-3 rounded-full" style={{ width: `${(skipped / totalQuestions) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-teal-50 rounded-xl border border-teal-100">
              <h4 className="font-bold text-teal-800 mb-2">Recommendation</h4>
              <p className="text-teal-700 text-sm leading-relaxed">
                {isPassed
                  ? "Great job! You have demonstrated strong understanding of the core concepts. Try attempting advanced level tests to further sharpen your skills."
                  : "We recommend focusing on the topics where you faced difficulties. Review the learning materials and attempt the practice quizzes again before retaking the test."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TestResult;
