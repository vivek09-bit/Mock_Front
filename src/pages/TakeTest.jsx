import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";

// Import specialized components
import StaticTest from "../components/tests/StaticTest";
import DynamicTest from "../components/tests/DynamicTest";
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

  const [showGuidelines, setShowGuidelines] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [questionStatus, setQuestionStatus] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { apiBase } = useContext(ThemeContext);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTestAndUser = async () => {
      try {
        const [testRes, userRes] = await Promise.all([
          axios.get(`${apiBase}/api/test/${testId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          token ? axios.get(`${apiBase}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }) : Promise.reject("User authentication required."),
        ]);
        const data = testRes.data;

        // Fetch session data
        let questionsData = data;
        let finalQuestions = [];

        try {
          const startRes = await axios.post(
            `${apiBase}/api/test/start`,
            { testId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          questionsData = startRes.data;
          finalQuestions = startRes.data.questions || [];
        } catch (e) {
          console.error("Failed to start test session", e);
          setError("Session start failed. Please check your connection.");
          return;
        }

        setTest({ ...questionsData, questions: finalQuestions });
        setUser(userRes.data);

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
    if (!user) return setError("User not authenticated.");
    try {
      const studentDetails = JSON.parse(localStorage.getItem(`student_info_${testId}`) || "{}");
      
      const response = await axios.post(`${apiBase}/api/test/submit`, {
        testId, 
        userId: user.user._id, 
        answers,
        studentDetails // Send the collected metadata
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      exitFullScreen();
      // Clean up metadata after successful submission
      localStorage.removeItem(`student_info_${testId}`);
      
      const attemptedCount = Object.keys(answers).length;
      navigate("/Test-Submit", { state: { result: response.data, attempted: attemptedCount } });
    } catch {
      setError("Submission failed. Try again.");
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

  let testView;
  switch (test.testMode) {
    case "STATIC": testView = <StaticTest {...commonProps} />; break;
    case "DYNAMIC": testView = <DynamicTest {...commonProps} />; break;
    case "LEGACY": testView = <DeprecatedTest {...commonProps} />; break;
    default: testView = <StaticTest {...commonProps} />;
  }

  return (
    <>
      {testView}

      {/* MODALS (Shared across components for consistency) */}
      {warningMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg text-center border-t-4 border-orange-500">
            <h2 className="text-red-600 text-xl font-bold mb-2">Security Warning</h2>
            <p className="text-gray-800 mb-4">{warningMessage}</p>
            <button className="bg-orange-500 text-white py-2 px-6 rounded font-bold" onClick={handleResumeTest}>Resume Test</button>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg text-center shadow-xl">
            <h2 className="text-xl font-bold mb-4">Submit Test?</h2>
            <p className="text-gray-600 mb-4">Are you sure you want to end the test?</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setShowSubmitModal(false)} className="bg-gray-200 py-2 px-6 rounded font-medium">Cancel</button>
              <button className="bg-blue-700 text-white py-2 px-6 rounded font-bold" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TakeTest;
