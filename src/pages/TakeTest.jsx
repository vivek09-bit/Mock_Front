import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";

// Import specialized components
import FullMockTest from "../components/tests/FullMockTest";
import PremockTest from "../components/tests/PremockTest";
import LiveTest from "../components/tests/LiveTest";
import StaticTest from "../components/tests/StaticTest";
import DynamicTest from "../components/tests/DynamicTest";
import InstructorPremockTest from "../components/tests/InstructorPremockTest";
import InstructorFullMockTest from "../components/tests/InstructorFullMockTest";
import DeprecatedTest from "../components/tests/DeprecatedTest";

// Question Status Constants
const QUESTION_STATUS = {
  NOT_VISITED: 'not-visited',
  NOT_ANSWERED: 'not-answered',
  ANSWERED: 'answered',
  MARKED_FOR_REVIEW: 'marked-review',
  ANSWERED_MARKED: 'answered-marked'
};

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
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStartTime, setTestStartTime] = useState(null);

  const [showGuidelines, setShowGuidelines] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [questionStatus, setQuestionStatus] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { apiBase } = useContext(ThemeContext);

  // Enhanced Security: Prevent malicious behaviors
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);

    // Security: Prevent screenshot tools
    const preventScreenshots = (e) => {
      if (e.keyCode === 44) {
        e.preventDefault();
        setWarningMessage("⚠️ Screenshots are not allowed during the test.");
      }
    };

    // Security: Disable drag-drop of content
    const disableDragDrop = (e) => {
      if (!showGuidelines && e.target.closest('[data-allow-drag]') === null) {
        e.preventDefault();
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', preventScreenshots);
    document.addEventListener('dragstart', disableDragDrop);
    document.addEventListener('drop', disableDragDrop);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', preventScreenshots);
      document.removeEventListener('dragstart', disableDragDrop);
      document.removeEventListener('drop', disableDragDrop);
    };
  }, [showGuidelines]);

  useEffect(() => {
    const fetchTestAndUser = async () => {
      try {
        const fetchPromises = [
          axios.get(`${apiBase}/api/test/${testId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
        ];

        if (token) {
          fetchPromises.push(axios.get(`${apiBase}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }));
        }

        const results = await Promise.allSettled(fetchPromises);
        const testRes = results[0].status === 'fulfilled' ? results[0].value : null;
        const userRes = results[1]?.status === 'fulfilled' ? results[1].value : null;

        if (!testRes) throw new Error("Failed to load test metadata.");
        const data = testRes.data;

        // Fetch session data
        let questionsData = data;
        let finalQuestions = [];

        try {
          const startRes = await axios.post(
            `${apiBase}/api/test/start`,
            { testId },
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
          questionsData = startRes.data;
          finalQuestions = startRes.data.questions || [];
        } catch (e) {
          console.error("Failed to start test session", e);
          setError("Session start failed. Please check your connection.");
          return;
        }

        setTest({ ...questionsData, questions: finalQuestions });
        if (userRes) setUser(userRes.data);

        // Enforce student details if required by educator
        const requiredFields = questionsData.requiredStudentDetails || [];
        if (requiredFields.length > 0) {
          const savedInfo = localStorage.getItem(`student_info_${testId}`);
          if (!savedInfo) {
            navigate(`/start-test/${testId}`);
            return;
          }
        }

        const totalRemaining = (questionsData.duration || 60) * 60;
        setTimeLeft(totalRemaining);

        const initialStatus = {};
        finalQuestions.forEach((q, idx) => {
          initialStatus[q._id] = idx === 0 ? QUESTION_STATUS.NOT_ANSWERED : QUESTION_STATUS.NOT_VISITED;
        });
        setQuestionStatus(initialStatus);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTestAndUser();
  }, [testId, token, apiBase]);

  // Global Timer (remains in container as it's cross-cutting)
  useEffect(() => {
    if (!test || showGuidelines) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [test, showGuidelines]);

  const enterFullScreen = () => {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) docElm.requestFullscreen().catch((err) => console.error(err));
    else if (docElm.mozRequestFullScreen) docElm.mozRequestFullScreen();
    else if (docElm.webkitRequestFullScreen) docElm.webkitRequestFullScreen();
    else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  };

  const startTest = () => {
    if (testStartTime === null) {
      setTestStartTime(Date.now());
    }
    enterFullScreen();
    setShowGuidelines(false);
  };

  const handleResumeTest = () => {
    enterFullScreen();
    setWarningMessage("");
  };

  const handleAnswerChange = (selectedOption) => {
    const questionId = test.questions[currentQuestionIndex]._id;
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    setQuestionStatus((prev) => ({
      ...prev,
      [questionId]: prev[questionId] === QUESTION_STATUS.MARKED_FOR_REVIEW || prev[questionId] === QUESTION_STATUS.ANSWERED_MARKED
        ? QUESTION_STATUS.ANSWERED_MARKED
        : QUESTION_STATUS.ANSWERED
    }));
  };

  const clearResponse = () => {
    const questionId = test.questions[currentQuestionIndex]._id;
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
    setQuestionStatus((prev) => ({
      ...prev,
      [questionId]: prev[questionId] === QUESTION_STATUS.ANSWERED_MARKED
        ? QUESTION_STATUS.MARKED_FOR_REVIEW
        : QUESTION_STATUS.NOT_ANSWERED
    }));
  };

  const markForReview = () => {
    const questionId = test.questions[currentQuestionIndex]._id;
    setQuestionStatus((prev) => ({
      ...prev,
      [questionId]: answers[questionId] ? QUESTION_STATUS.ANSWERED_MARKED : QUESTION_STATUS.MARKED_FOR_REVIEW
    }));
    goToNextQuestion();
  };

  const saveAndNext = () => {
    const questionId = test.questions[currentQuestionIndex]._id;
    if (answers[questionId]) {
      setQuestionStatus((prev) => ({
        ...prev,
        [questionId]: prev[questionId] === QUESTION_STATUS.ANSWERED_MARKED ? QUESTION_STATUS.ANSWERED_MARKED : QUESTION_STATUS.ANSWERED
      }));
    } else {
      setQuestionStatus((prev) => ({
        ...prev,
        [questionId]: QUESTION_STATUS.NOT_ANSWERED
      }));
    }
    goToNextQuestion();
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      const nextQuestionId = test.questions[nextIndex]._id;
      if (questionStatus[nextQuestionId] === QUESTION_STATUS.NOT_VISITED) {
        setQuestionStatus((prev) => ({ ...prev, [nextQuestionId]: QUESTION_STATUS.NOT_ANSWERED }));
      }
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    const questionId = test.questions[index]._id;
    if (questionStatus[questionId] === QUESTION_STATUS.NOT_VISITED) {
      setQuestionStatus((prev) => ({ ...prev, [questionId]: QUESTION_STATUS.NOT_ANSWERED }));
    }
  };

  const handleSubmit = async () => {
    // Security: Prevent re-submission spam
    if (loading) return;

    // If not logged in, we check if studentDetails exist in localStorage
    const savedStudentInfo = JSON.parse(localStorage.getItem(`student_info_${testId}`) || "null");

    if (!user && !savedStudentInfo) {
      setWarningMessage("⚠️ Security: Student details are required. Please fill in your information.");
      return;
    }

    // Security: Validate answers data
    if (!answers || typeof answers !== 'object') {
      setWarningMessage("⚠️ Invalid submission data detected. Please refresh and try again.");
      return;
    }

    // Security: Prevent submission of tampered data by validating answer keys
    const validAnswerKeys = new Set(test.questions.map(q => q._id));
    const allAnswersValid = Object.keys(answers).every(key => validAnswerKeys.has(key));

    if (!allAnswersValid) {
      setWarningMessage("⚠️ Security: Invalid answer data detected. Submission blocked.");
      return;
    }

    try {
      setLoading(true);

      const submissionPayload = {
        testId,
        userId: user?.user?._id || null,
        answers,
        studentDetails: savedStudentInfo,
        testStartTime: new Date(testStartTime).toISOString(), // Include for audit trail
        submittedAt: new Date().toISOString(),
        submissionDuration: Math.floor((Date.now() - testStartTime) / 1000), // Duration in seconds
        userAgent: navigator.userAgent, // For device fingerprinting
        timeOnPage: Math.floor((Date.now() - testStartTime) / 1000)
      };

      const response = await axios.post(
        `${apiBase}/api/test/submit`,
        submissionPayload,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          timeout: 30000
        }
      );

      exitFullScreen();
      localStorage.removeItem(`student_info_${testId}`);

      navigate("/test-result", {
        state: {
          result: response.data,
          testModel: test.testModel,
          testId,
          attempted: Object.keys(answers).length,
          totalQuestions: test.questions.length
        }
      });
    } catch (err) {
      // Security: Don't expose sensitive error details
      const errorMsg = err.response?.status === 401
        ? "Your session has expired. Please log in again."
        : err.response?.status === 403
          ? "You don't have permission to submit this test."
          : "Submission failed. Please check your connection and try again.";

      setWarningMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  const getStatusCounts = useCallback(() => {
    const counts = { answered: 0, notAnswered: 0, markedReview: 0, answeredMarked: 0, notVisited: 0 };
    Object.values(questionStatus).forEach(status => {
      switch (status) {
        case QUESTION_STATUS.ANSWERED: counts.answered++; break;
        case QUESTION_STATUS.NOT_ANSWERED: counts.notAnswered++; break;
        case QUESTION_STATUS.MARKED_FOR_REVIEW: counts.markedReview++; break;
        case QUESTION_STATUS.ANSWERED_MARKED: counts.answeredMarked++; break;
        case QUESTION_STATUS.NOT_VISITED: counts.notVisited++; break;
        default: break;
      }
    });
    return counts;
  }, [questionStatus]);

  const getStatusTailwindClasses = (status, isCurrent) => {
    let baseClasses = 'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer shadow-sm';
    if (isCurrent) return `${baseClasses} bg-blue-600 text-white`;
    switch (status) {
      case QUESTION_STATUS.ANSWERED: return `${baseClasses} bg-green-500 text-white`;
      case QUESTION_STATUS.NOT_ANSWERED: return `${baseClasses} bg-red-500 text-white`;
      case QUESTION_STATUS.MARKED_FOR_REVIEW: return `${baseClasses} bg-purple-600 text-white`;
      case QUESTION_STATUS.ANSWERED_MARKED: return `${baseClasses} bg-purple-600 text-white ring-2 ring-green-500`;
      default: return `${baseClasses} bg-gray-300 text-gray-800`;
    }
  };

  if (loading) return <div className="h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="h-screen bg-gray-50 flex items-center justify-center">{error}</div>;

  if (showGuidelines) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white w-11/12 max-w-3xl p-6 rounded-lg shadow-sm">
          <h1 className="text-blue-700 m-0 text-2xl font-bold border-b border-gray-200 pb-2 mb-4">Test Instructions</h1>
          <div className="max-h-[50vh] overflow-y-auto mb-6 text-gray-800 leading-relaxed">
            {test.instructions ? (
              <div dangerouslySetInnerHTML={{ __html: test.instructions }} />
            ) : (
              <div>
                <p>1. The clock is set at the server.</p>
                <p>2. The palette shows question statuses.</p>
                <p>3. Switching tabs is strictly prohibited.</p>
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-red-600 font-bold mb-4">Note: Full-screen mode will be enabled.</p>
            <button onClick={startTest} className="bg-blue-700 text-white py-3 px-10 rounded-md text-lg font-bold">I am ready to begin</button>
          </div>
        </div>
      </div>
    );
  }

  const commonProps = {
    test, user, timeLeft, formatTime, isMobile, isSidebarOpen, setIsSidebarOpen,
    currentQuestionIndex, counts: getStatusCounts(), questionStatus, QUESTION_STATUS,
    getStatusTailwindClasses, jumpToQuestion, setShowSubmitModal, markForReview,
    clearResponse, saveAndNext, setTabSwitchCount, setWarningMessage, handleSubmit,
    showGuidelines, enterFullScreen, answers, handleAnswerChange, warningMessage,
    handleResumeTest, showSubmitModal
  };

  const isInstructor = user?.role === 'ins' || JSON.parse(localStorage.getItem('user'))?.role === 'ins';

  let testView;
  switch (test.testModel) {
    case "fullmock":
      testView = isInstructor ? <InstructorFullMockTest {...commonProps} /> : <FullMockTest {...commonProps} />;
      break;
    case "premock":
      testView = isInstructor ? <InstructorPremockTest {...commonProps} /> : <PremockTest {...commonProps} />;
      break;
    case "live": testView = <LiveTest {...commonProps} />; break;
    case "static": testView = <StaticTest {...commonProps} />; break;
    case "dynamic": testView = <DynamicTest {...commonProps} />; break;
    default:
      testView = isInstructor ? <InstructorPremockTest {...commonProps} /> : <PremockTest {...commonProps} />;
  }

  // Legacy support for older schema
  if (!test.testModel && test.testMode === "LEGACY") {
    testView = <DeprecatedTest {...commonProps} />;
  }

  return (
    <>
      {testView}

      {/* MODALS (Shared across components for consistency) */}
      {warningMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg text-center border-t-4 border-orange-500">
            <h2 className="text-red-600 text-xl font-bold mb-2">Security Warning</h2>
            <p className="text-gray-800 mb-4">{warningMessage}</p>
            <button className="bg-orange-500 text-white py-2 px-6 rounded font-bold" onClick={handleResumeTest}>Resume Test</button>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Submit Test</h2>
              <p className="text-blue-100 text-sm mt-1">Please review before submission</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Questions Answered</p>
                  <p className="text-2xl font-bold text-blue-700">{Object.keys(answers).length}/{test?.questions?.length || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Time Spent</p>
                  <p className="text-2xl font-bold text-green-700">{testStartTime ? formatTime(Math.floor((Date.now() - new Date(testStartTime).getTime()) / 1000)) : '0:00'}</p>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded">
                <p className="text-orange-900 font-semibold text-sm">Important:</p>
                <p className="text-orange-800 text-sm mt-1">Once submitted, you cannot modify your answers. This action is final.</p>
              </div>

              {/* Questions Status */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 font-semibold text-sm mb-3">Test Status</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Answered:</span>
                    <span className="font-bold text-green-600">{getStatusCounts().answered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Not Answered:</span>
                    <span className="font-bold text-red-600">{getStatusCounts().notAnswered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marked for Review:</span>
                    <span className="font-bold text-purple-600">{getStatusCounts().markedReview}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 bg-gray-100 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  Go Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TakeTest;
