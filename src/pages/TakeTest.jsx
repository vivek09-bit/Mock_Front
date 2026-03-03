import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";

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

  // Start with Guidelines TRUE to show instructions first
  const [showGuidelines, setShowGuidelines] = useState(true);

  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [questionStatus, setQuestionStatus] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // Responsive State
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

  // Fetch Test and User
  useEffect(() => {
    const fetchTestAndUser = async () => {
      try {
        const [testRes, userRes] = await Promise.all([
          axios.get(`${apiBase}/api/test/${testId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          token
            ? axios.get(`${apiBase}/api/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            : Promise.reject("User authentication required."),
        ]);
        setTest(testRes.data);
        setUser(userRes.data);

        const totalTime = testRes.data.questions?.reduce((acc, q) => acc + (q.timeLimit || 60), 0) || 3600;
        setTimeLeft(totalTime);

        const initialStatus = {};
        testRes.data.questions?.forEach((q, idx) => {
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

  // Timer
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

  // Security - Only active AFTER guidelines are dismissed
  useEffect(() => {
    if (showGuidelines) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount > 2) {
            handleSubmit();
          } else {
            setWarningMessage(`⚠️ Warning: You switched tabs! Only 2 switches allowed. Current switches: ${newCount}/2`);
          }
          return newCount;
        });
      }
    };

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && !warningMessage) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount > 2) {
            handleSubmit();
          } else {
            setWarningMessage(`⚠️ Warning: You exited full screen! This counts as a violation. Current violations: ${newCount}/2`);
          }
          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, [showGuidelines, warningMessage]);

  const handleResumeTest = () => {
    enterFullScreen();
    setWarningMessage("");
  };

  useEffect(() => {
    if (showGuidelines) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      setWarningMessage("⚠️ Right-click is not allowed during the test.");
      return false;
    };

    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        setWarningMessage("⚠️ Developer tools are disabled.");
        return false;
      }
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        setWarningMessage("⚠️ Copy/Paste is disabled.");
        return false;
      }
      // Block Alt+Tab attempt if possible (mostly OS level, but we can try to detect focus loss via visibility change)
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showGuidelines, setWarningMessage]);

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
        [questionId]: prev[questionId] === QUESTION_STATUS.NOT_ANSWERED ? QUESTION_STATUS.NOT_ANSWERED : QUESTION_STATUS.NOT_ANSWERED
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
      const response = await axios.post(`${apiBase}/api/test/submit`, {
        testId, userId: user.user._id, answers,
      }, { headers: { Authorization: `Bearer ${token}` } });
      exitFullScreen();
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
      }
    });
    return counts;
  }, [questionStatus]);

  // styles replaced with Tailwind; object removed

  const getStatusTailwindClasses = (status, isCurrent) => {
    let baseClasses = 'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer shadow-sm';
    
    if (isCurrent) {
      return `${baseClasses} bg-blue-600 text-white`;
    }
    
    let statusClasses = '';
    switch (status) {
      case QUESTION_STATUS.ANSWERED:
        statusClasses = 'bg-green-500 text-white';
        break;
      case QUESTION_STATUS.NOT_ANSWERED:
        statusClasses = 'bg-red-500 text-white';
        break;
      case QUESTION_STATUS.MARKED_FOR_REVIEW:
        statusClasses = 'bg-purple-600 text-white';
        break;
      case QUESTION_STATUS.ANSWERED_MARKED:
        statusClasses = 'bg-purple-600 text-white ring-2 ring-green-500';
        break;
      default:
        statusClasses = 'bg-gray-300 text-gray-800';
    }
    
    return `${baseClasses} ${statusClasses}`;
  };

  if (loading) return <div className="h-screen bg-gray-50 font-sans flex flex-col overflow-hidden items-center justify-center">Loading...</div>;
  if (error) return <div className="h-screen bg-gray-50 font-sans flex flex-col overflow-hidden items-center justify-center">{error}</div>;

  // Guidelines / Initial Stats Screen
  if (showGuidelines) {
    return (
      <div className="h-screen bg-gray-50 font-sans flex flex-col overflow-hidden items-center justify-center">
        <div className="bg-white w-11/12 max-w-3xl text-left flex flex-col max-h-[80vh] overflow-auto p-6 rounded-lg">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h1 className="text-blue-700 m-0">Test Instructions</h1>
            <p className="text-gray-600 mt-1">Please read the following instructions carefully.</p>
          </div>

          <div className="flex-1 overflow-y-auto mb-5 leading-relaxed text-gray-800">
            {test.instructions ? (
              <div dangerouslySetInnerHTML={{ __html: test.instructions }} />
            ) : (
              <div>
                <p>1. The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.</p>
                <p>2. The question palette at the right of screen shows one of the following statuses of each of the questions numbered.</p>
                <p>3. You can click on the "&gt;" arrow button to save your answer and move to the next question.</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-5 text-center">
            <div className="mb-2 text-sm text-red-600 font-bold">
              Note: The test will open in Full Screen mode. Switching tabs is prohibited.
            </div>
            <button onClick={startTest} className="bg-blue-700 text-white py-3 px-10 rounded-md text-lg font-bold">
              I am ready to begin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const counts = getStatusCounts();

  return (
    <div className="h-screen bg-gray-50 font-sans flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-4 z-50">
        <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-700 tracking-tight`}>Ignite Verse</div>
        {!isMobile && <div className="font-medium text-sm text-gray-800">{test.name}</div>}
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-gray-600">{isMobile ? '' : 'Time Left'}</span>
          <div className="bg-gray-800 text-white py-1 px-2 rounded text-sm font-bold tracking-wider">{formatTime(timeLeft)}</div>
        </div>
      </div>

      {/* SECTION BAR */}
      <div className="h-10 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
        <div className="bg-blue-700 text-white px-5 h-10 flex items-center text-sm font-bold rounded-tl rounded-tr">Quantitative Aptitude</div>
        <button className={`${isMobile ? 'flex' : 'hidden'} items-center gap-1.5 py-1 px-2 border border-blue-700 rounded text-blue-700 font-bold text-xs bg-transparent`} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? 'Close Panel' : 'Question Panel'}
        </button>
      </div>

      {/* MAIN BODY */}
      <div className={`flex flex-1 ${isMobile ? 'flex-col' : 'flex-row'} relative ${isMobile ? 'h-[calc(100vh-160px)]' : 'h-[calc(100vh-120px)]'}`}>
        {/* Mobile Overlay */}
        <div className={`absolute inset-0 bg-black bg-opacity-50 z-40 ${isMobile && isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

        {/* COL 1: Questions */}
        <div className={`${isMobile ? 'w-full bg-white border-b border-gray-200' : 'flex-1 bg-white border-r border-gray-200'} p-5 overflow-y-auto flex flex-col ${isMobile ? 'max-h-1/2' : ''}`}>
          <div className="flex justify-between border-b border-gray-200 pb-2 mb-4 items-center">
            <div className="text-lg font-bold text-gray-800">Q. {currentQuestionIndex + 1}</div>
            <div className="text-xs text-gray-600 flex gap-1 items-center">
              <span className="bg-green-100 text-green-800 px-1.5 rounded text-xs font-bold">+2.0</span> <span className="bg-red-100 text-red-800 px-1.5 rounded text-xs font-bold">-0.5</span>
            </div>
          </div>

          <div className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-800 font-medium mb-6 leading-relaxed`}>
            {currentQuestion.question?.text || currentQuestion.questionText}
          </div>
        </div>

        {/* COL 2: Options */}
        <div className="flex-1 bg-gray-50 border-r border-gray-200 p-5 overflow-y-auto">
          <h4 className="mb-4 text-gray-600">Options</h4>
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = answers[currentQuestion._id] === opt;
              return (
                <label
                  key={idx}
                  className={`flex items-center gap-2 cursor-pointer p-3 rounded border border-gray-200 bg-white transition-all duration-200 ${isSelected ? 'bg-gray-50 border-gray-500' : ''}`}
                >
                  <input
                    type="radio"
                    name="opt"
                    className="accent-gray-500 w-4 h-4"
                    checked={isSelected}
                    onChange={() => handleAnswerChange(opt)}
                  />
                  <span className="text-sm text-gray-800">{opt}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* COL 3: Sidebar */}
        <div className={`bg-blue-50 border-l border-gray-300 flex flex-col ${isMobile ? 'absolute w-10/12' : 'w-80'} top-0 right-0 bottom-0 z-50 transform ${isMobile ? (isSidebarOpen ? 'translate-x-0' : 'translate-x-full') : 'translate-x-0'} transition-transform duration-300 shadow-lg`}>
          <div className={`${isMobile ? 'flex' : 'hidden'} justify-end p-2`}>
            <button onClick={() => setIsSidebarOpen(false)} className="bg-transparent border-none text-xl">✕</button>
          </div>
          <div className="flex items-center gap-2 p-2 bg-blue-100 border-b border-blue-200">
            <div className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold">{user?.user?.name?.charAt(0) || 'U'}</div>
            <div className="text-xs font-bold">{user?.user?.name}</div>
          </div>

          <div className="p-2 grid grid-cols-2 gap-2 text-xs border-b border-gray-300 bg-white">
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[0.625rem]">{counts.answered}</div> Answered</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[0.625rem]">{counts.notAnswered}</div> Not Answered</div>
            <div className="flex items:center gap-1"><div className="w-4 h-4 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center text-[0.625rem]">{counts.notVisited}</div> Not Visited</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[0.625rem]">{counts.markedReview}</div> Marked</div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-[0.75rem] font-bold text-gray-800 mb-2 bg-blue-200 px-1 py-0.5">SECTION : Quantitative Aptitude</div>
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((q, idx) => {
                const status = questionStatus[q._id] || QUESTION_STATUS.NOT_VISITED;
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <div
                    key={idx}
                    className={getStatusTailwindClasses(status, isCurrent)}
                    onClick={() => {
                      jumpToQuestion(idx);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                  >
                    {idx + 1}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-2 bg-blue-100 border-t border-blue-200">
            <button className="w-full bg-blue-700 text-white py-2 rounded text-sm font-bold" onClick={() => setShowSubmitModal(true)}>Submit Test</button>
            <div className="flex gap-1 mt-1 justify-between text-xs">
              <button className="text-blue-700">Question Paper</button>
              <button className="text-blue-700">Instructions</button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className={`bg-white border-t border-gray-200 flex ${isMobile ? 'flex-col gap-2 py-2' : 'h-16 items-center justify-between px-4'}`}>
        <div className={`flex gap-2 ${isMobile ? 'w-full justify-between' : ''}`}>
          <button className="bg-blue-500 text-white py-2 rounded text-xs font-medium" onClick={markForReview}>Mark for Review & Next</button>
          <button className="bg-white text-gray-800 border border-gray-300 py-2 rounded text-xs font-medium" onClick={clearResponse}>Clear Response</button>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-700 text-white py-2 px-4 rounded text-sm font-bold" onClick={() => setShowSubmitModal(true)}>Submit</button>
          {!isMobile && <button className="bg-blue-700 text-white py-2 px-4 rounded text-sm font-bold" onClick={saveAndNext}>Save & Next</button>}
        </div>
      </div>

      {/* MODALS */}
      {warningMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center border-t-4 border-orange-500">
            <h2 className="text-red-600">Security Warning</h2>
            <p>{warningMessage}</p>
            <button className="bg-orange-500 text-white py-2 px-4 rounded" onClick={handleResumeTest}>Resume Test</button>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <h2>Submit Test?</h2>
            <div className="grid grid-cols-2 gap-1 mt-5">
              <div className="bg-green-100 p-1">Answered: {counts.answered}</div>
              <div className="bg-red-100 p-1">Not Answered: {counts.notAnswered}</div>
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowSubmitModal(false)} className="bg-gray-200 py-2 px-4 rounded">Cancel</button>
              <button className="bg-blue-700 text-white py-2 px-4 rounded" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeTest;
