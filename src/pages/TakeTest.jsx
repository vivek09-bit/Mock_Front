import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const { apiBase } = useContext(ThemeContext);

  // Fetch Test and User Details
  useEffect(() => {
    const fetchTestAndUser = async () => {
      try {
        const [testRes, userRes] = await Promise.all([
          axios.get(`${apiBase}/api/test/${testId}`),
          token
            ? axios.get(`${apiBase}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.reject("User authentication required."),
        ]);

        setTest(testRes.data);
        setUser(userRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestAndUser();
  }, [testId, token]);

  // Timer for Questions
  useEffect(() => {
    if (!test || !test.questions) return;
    
    setTimeLeft(test.questions[currentQuestionIndex]?.timeLimit || 60);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, test]);

  // Detect Tab Switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (tabSwitchCount > 2) handleSubmit();
  }, [tabSwitchCount]);

  const startTest = () => setShowGuidelines(false);

  const handleAnswerChange = (selectedOption) => {
    const questionId = test.questions[currentQuestionIndex]._id;
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!user) return setError("User not authenticated.");

    try {
      const response = await axios.post(`${apiBase}/api/test/submit`, {
        testId,
        userId: user.user._id,
        answers,
      });
      navigate("/Test-Submit", { state: { result: response.data } });
    } catch {
      setError("Submission failed. Try again.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );

  if (error) return <p className="text-red-500 text-center mt-5">{error}</p>;

  if (showGuidelines)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Test Guidelines</h2>
          <ul className="text-left space-y-2">
            <li>✅ Read each question carefully.</li>
            <li>⏳ You have a limited time for each question.</li>
            <li>🚫 Switching tabs more than twice will auto-submit your test.</li>
          </ul>
          <button onClick={startTest} className="mt-6 px-5 py-3 bg-blue-500 rounded-lg text-white hover:bg-blue-600">
            Start Test
          </button>
        </div>
      </div>
    );

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-800 text-white p-8 rounded-lg shadow-lg">
        
        {/* Test Name & Timer */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-400">{test.name}</h2>
          <span className="text-red-400 font-semibold">
            ⏳ Time Left: {timeLeft}s
          </span>
        </div>

        {/* Progress */}
        <div className="relative w-full bg-gray-700 rounded-full h-2 mb-6">
          <div className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full"
            style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold">
            {currentQuestionIndex + 1}. {currentQuestion.question?.text || currentQuestion.questionText}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => (
            <label key={idx} className="flex items-center bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition">
              <input
                type="radio"
                name={`question-${currentQuestion._id}`}
                value={option}
                checked={answers[currentQuestion._id] === option}
                onChange={() => handleAnswerChange(option)}
                className="mr-2 w-5 h-5"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>

        {/* Next/Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleNextQuestion}
            className="px-5 py-3 bg-green-500 rounded-lg text-white hover:bg-green-600"
          >
            {currentQuestionIndex < test.questions.length - 1 ? "Next" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
