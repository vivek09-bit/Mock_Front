import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaRedo, FaHome } from "react-icons/fa";
import Confetti from "react-confetti";

const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result } = location.state || {};
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (result?.passed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [result]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#062925] to-[#003C3B] text-white text-center">
        <h2 className="text-3xl font-bold">No Result Found!</h2>
        <button
          className="mt-4 px-5 py-2 bg-[#00A896] rounded-lg hover:bg-[#007D77] transition duration-300"
          onClick={() => navigate("/")}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#031C1A] to-[#045D5D] p-6">
      {showConfetti && <Confetti numberOfPieces={200} />}

      <div className="bg-white bg-opacity-10 backdrop-blur-xl shadow-lg rounded-lg p-8 w-full max-w-2xl text-white border border-[#1DBAB6]">
        {/* Test Name */}
        <h2 className="text-3xl font-bold text-center text-[#1DBAB6]">{result.testName}</h2>

        {/* Score Display */}
        <div className="mt-6 flex flex-col items-center justify-center">
          <p className="text-lg text-gray-300">Your Score</p>
          <div
            className={`text-6xl font-bold ${
              result.passed ? "text-[#4CAF50]" : "text-[#FF3B3B]"
            }`}
          >
            {result.score}%
          </div>
        </div>

        {/* Status */}
        <p
          className={`text-center text-lg font-semibold mt-4 ${
            result.passed ? "text-[#46D39A]" : "text-[#FF6B6B]"
          }`}
        >
          {result.passed ? "✅ Passed! Great Job!" : "❌ Failed! Try Again!"}
        </p>

        {/* Test Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-gray-300 text-sm">
          <div className="p-4 bg-[#073B3A] rounded-lg text-center shadow-md">
            <p className="text-xl font-semibold text-[#1DBAB6]">
              {result.totalQuestions}
            </p>
            <p>Total Questions</p>
          </div>
          <div className="p-4 bg-[#073B3A] rounded-lg text-center shadow-md">
            <p className="text-xl font-semibold text-[#46D39A]">
              {result.correctAnswers}
            </p>
            <p>Correct Answers</p>
          </div>
          <div className="p-4 bg-[#073B3A] rounded-lg text-center shadow-md">
            <p className="text-xl font-semibold text-[#FF6B6B]">
              {result.totalQuestions - result.correctAnswers}
            </p>
            <p>Incorrect Answers</p>
          </div>
          <div className="p-4 bg-[#073B3A] rounded-lg text-center shadow-md">
            <p className="text-xl font-semibold text-[#F4D35E]">
              {result.passingScore}%
            </p>
            <p>Passing Score</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-6">
          <button
            className="flex items-center px-5 py-2 bg-[#00A896] text-white rounded-lg shadow-md hover:bg-[#007D77] transition duration-300"
            onClick={() => navigate(`/take-test/${result.testId}`)}
          >
            <FaRedo className="mr-2" /> Retake Test
          </button>

          <button
            className="flex items-center px-5 py-2 bg-[#043F3B] text-white rounded-lg shadow-md hover:bg-[#032A28] transition duration-300"
            onClick={() => navigate("/")}
          >
            <FaHome className="mr-2" /> Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResult;
