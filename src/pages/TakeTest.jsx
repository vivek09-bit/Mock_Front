import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";

// Question Status Constants
const QUESTION_STATUS = {
  NOT_VISITED: 'not-visited',
  NOT_ANSWERED: 'not-answered', // Red
  ANSWERED: 'answered', // Green
  MARKED_FOR_REVIEW: 'marked-review', // Purple
  ANSWERED_MARKED: 'answered-marked' // Purple with tick
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

  const { apiBase } = useContext(ThemeContext);

  // Fetch Test and User Details
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

        // Calculate total time
        const totalTime = testRes.data.questions?.reduce((acc, q) => acc + (q.timeLimit || 60), 0) || 3600;
        setTimeLeft(totalTime);

        // Initialize statuses
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

  // Security: Tab Switch & Full Screen
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

  // Security: Block Keys/Right Click
  useEffect(() => {
    if (showGuidelines) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        alert("⚠️ Developer tools are disabled.");
        return false;
      }
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        alert("⚠️ Copy/Paste is disabled.");
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showGuidelines]);

  const enterFullScreen = () => {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen().catch((err) => console.error(err));
    } else if (docElm.mozRequestFullScreen) {
      docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullScreen) {
      docElm.webkitRequestFullScreen();
    } else if (docElm.msRequestFullscreen) {
      docElm.msRequestFullscreen();
    }
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  const startTest = () => {
    enterFullScreen();
    setShowGuidelines(false);
  };

  // Answer Handling
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

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
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
      navigate("/Test-Submit", { state: { result: response.data } });
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

  // --- STYLES ---
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9f9f9',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    },
    // Header
    header: {
      height: '60px', backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0', // Thinner border
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', zIndex: 100
    },
    logo: { fontSize: '24px', fontWeight: 'bold', color: '#007991', letterSpacing: '-0.5px' }, // Teal Logo
    headerRight: { display: 'flex', alignItems: 'center', gap: '20px' },
    timerBox: {
      backgroundColor: '#444', color: '#fff', padding: '5px 10px', borderRadius: '4px',
      fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px'
    },

    // Sub-header / Section Bar
    sectionBar: {
      height: '40px', backgroundColor: '#fff', borderBottom: '1px solid #ddd',
      display: 'flex', alignItems: 'center', padding: '0 20px'
    },
    activeTab: {
      backgroundColor: '#007991', color: '#fff', padding: '0 20px', height: '40px',
      display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 'bold',
      borderTopLeftRadius: '4px', borderTopRightRadius: '4px'
    },

    // Layout
    mainBody: { display: 'flex', flex: 1, height: 'calc(100vh - 120px)' }, // 60 header + 60 footer

    // Col 1: Question
    questionCol: {
      flex: 1.5, // Wider column for reading question
      backgroundColor: '#fff',
      borderRight: '1px solid #ddd',
      padding: '20px',
      overflowY: 'auto',
      display: 'flex', flexDirection: 'column'
    },

    // Col 2: Options
    optionsCol: {
      flex: 1, // Standard width for options
      backgroundColor: '#fcfcfc',
      borderRight: '1px solid #ddd',
      padding: '20px',
      overflowY: 'auto'
    },

    // Col 3: Right Sidebar
    sidebar: {
      width: '320px', backgroundColor: '#eef4fa', borderLeft: '1px solid #d0d0d0',
      display: 'flex', flexDirection: 'column'
    },

    // Inner Styles
    questionHeaderRow: {
      display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee',
      paddingBottom: '10px', marginBottom: '15px'
    },
    qNum: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
    marks: { fontSize: '12px', color: '#666', display: 'flex', gap: '10px', alignItems: 'center' },
    markBadge: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' },
    negBadge: { backgroundColor: '#ffebee', color: '#c62828', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' },

    qText: { fontSize: '16px', lineHeight: '1.6', color: '#222', marginBottom: '25px', fontWeight: '500' },

    optionsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    optionRow: {
      display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
      padding: '10px', borderRadius: '6px', border: '1px solid #eee', backgroundColor: '#fff', transition: 'all 0.2s'
    },
    optionRowSelected: {
      backgroundColor: '#e0f7fa', borderColor: '#007991'
    },
    radio: { accentColor: '#007991', width: '18px', height: '18px' },
    optionText: { fontSize: '15px', color: '#333' },

    // Sidebar Specifics
    userProfile: {
      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
      backgroundColor: '#e1f5fe', borderBottom: '1px solid #b3e5fc'
    },
    avatar: {
      width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#7b1fa2', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
    },

    legendBox: {
      padding: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
      fontSize: '11px', borderBottom: '1px solid #d0d0d0', backgroundColor: '#fff'
    },
    legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
    lIcon: {
      width: '20px', height: '20px', borderRadius: '50%', color: '#fff', fontSize: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
    },

    gridArea: { flex: 1, overflowY: 'auto', padding: '10px' },
    sectionLabel: {
      fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '10px',
      padding: '5px', backgroundColor: '#bbdefb'
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' },
    gridBall: {
      width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #ccc', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    },

    sidebarFooter: { padding: '10px', backgroundColor: '#e1f5fe', borderTop: '1px solid #b3e5fc' },
    btnSubmit: {
      width: '100%', backgroundColor: '#007991', color: '#fff', padding: '10px',
      border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px'
    },

    // Footer
    footer: {
      height: '60px', backgroundColor: '#fff', borderTop: '1px solid #ddd',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px',
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90
    },
    fGroup: { display: 'flex', gap: '10px' },
    btnMark: { backgroundColor: '#42a5f5', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
    btnClear: { backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
    btnSave: { backgroundColor: '#007991', color: '#fff', border: 'none', padding: '8px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },

    // Modal
    modalOverlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    },
    modal: { backgroundColor: '#fff', width: '400px', padding: '20px', borderRadius: '8px', textAlign: 'center' }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case QUESTION_STATUS.ANSWERED: return { bg: '#4caf50', color: '#fff' };
      case QUESTION_STATUS.NOT_ANSWERED: return { bg: '#ef5350', color: '#fff' };
      case QUESTION_STATUS.MARKED_FOR_REVIEW: return { bg: '#ab47bc', color: '#fff' };
      case QUESTION_STATUS.ANSWERED_MARKED: return { bg: '#ab47bc', color: '#fff', border: '3px solid #4caf50' };
      default: return { bg: '#e0e0e0', color: '#333' };
    }
  };

  if (loading) return <div style={styles.container}>Loading...</div>;
  if (error) return <div style={styles.container}>{error}</div>;

  if (showGuidelines) {
    return (
      <div style={{ ...styles.container, alignItems: 'center', justifyContent: 'center' }}>
        {/* <div className="bg-teal-800 text-white p-10 rounded-md"> */}
        {/* <h1 className='bg-teal-800 text-white text-center pb-8'>Instructions</h1> */}
        <button onClick={startTest} style={{ ...styles.btnSave, padding: '15px 30px', fontSize: '16px' }}>Start Test</button>
        {/* </div> */}
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const counts = getStatusCounts();

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logo}>Ignite Verse</div>
        <div style={{ fontWeight: '500', fontSize: '14px', color: '#333' }}>{test.name}</div>
        <div style={styles.headerRight}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Time Left</span>
          <div style={styles.timerBox}>{formatTime(timeLeft)}</div>
        </div>
      </div>

      {/* SECTION BAR */}
      <div style={styles.sectionBar}>
        <div style={styles.activeTab}>Quantitative Aptitude</div>
      </div>

      {/* MAIN BODY - 3 COLUMN LAYOUT */}
      <div style={styles.mainBody}>

        {/* COL 1: Questions */}
        <div style={styles.questionCol}>
          <div style={styles.questionHeaderRow}>
            <div style={styles.qNum}>Question No. {currentQuestionIndex + 1}</div>
            <div style={styles.marks}>
              Marks <span style={styles.markBadge}>+2.0</span> <span style={styles.negBadge}>-0.5</span>
            </div>
          </div>

          <div style={styles.qText}>
            {currentQuestion.question?.text || currentQuestion.questionText}
          </div>
        </div>

        {/* COL 2: Options */}
        <div style={styles.optionsCol}>
          <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>Options</h4>
          <div style={styles.optionsList}>
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = answers[currentQuestion._id] === opt;
              return (
                <label
                  key={idx}
                  style={{
                    ...styles.optionRow,
                    ...(isSelected ? styles.optionRowSelected : {})
                  }}
                >
                  <input
                    type="radio"
                    name="opt"
                    style={styles.radio}
                    checked={isSelected}
                    onChange={() => handleAnswerChange(opt)}
                  />
                  <span style={styles.optionText}>{opt}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* COL 3: Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.userProfile}>
            <div style={styles.avatar}>{user?.user?.name?.charAt(0) || 'U'}</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{user?.user?.name}</div>
          </div>

          <div style={styles.legendBox}>
            <div style={styles.legendItem}><div style={{ ...styles.lIcon, backgroundColor: '#4caf50' }}>{counts.answered}</div> Answered</div>
            <div style={styles.legendItem}><div style={{ ...styles.lIcon, backgroundColor: '#ef5350' }}>{counts.notAnswered}</div> Not Answered</div>
            <div style={styles.legendItem}><div style={{ ...styles.lIcon, backgroundColor: '#e0e0e0', color: '#333' }}>{counts.notVisited}</div> Not Visited</div>
            <div style={styles.legendItem}><div style={{ ...styles.lIcon, backgroundColor: '#ab47bc' }}>{counts.markedReview}</div> Marked</div>
          </div>

          <div style={styles.gridArea}>
            <div style={styles.sectionLabel}>SECTION : Quantitative Aptitude</div>
            <div style={styles.grid}>
              {test.questions.map((q, idx) => {
                const status = questionStatus[q._id] || QUESTION_STATUS.NOT_VISITED;
                const colors = getStatusColor(status);
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <div
                    key={idx}
                    style={{
                      ...styles.gridBall,
                      backgroundColor: colors.bg,
                      color: colors.color,
                      border: isCurrent ? '2px solid #000' : '1px solid #ccc'
                    }}
                    onClick={() => jumpToQuestion(idx)}
                  >
                    {idx + 1}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={styles.sidebarFooter}>
            <button style={styles.btnSubmit} onClick={() => setShowSubmitModal(true)}>Submit Test</button>
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px', justifyContent: 'space-between' }}>
              <button style={{ ...styles.btnClear, border: 'none', background: 'none', color: '#007991', fontSize: '12px' }}>Question Paper</button>
              <button style={{ ...styles.btnClear, border: 'none', background: 'none', color: '#007991', fontSize: '12px' }}>Instructions</button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <div style={styles.fGroup}>
          <button style={styles.btnMark} onClick={markForReview}>Mark for Review & Next</button>
          <button style={styles.btnClear} onClick={clearResponse}>Clear Response</button>
        </div>
        <div>
          <button style={styles.btnSave} onClick={saveAndNext}>Save & Next</button>
        </div>
      </div>

      {/* MODALS */}
      {warningMessage && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, borderTop: '5px solid #ff9800' }}>
            <h2 style={{ color: '#ef5350' }}>Security Warning</h2>
            <p>{warningMessage}</p>
            <button style={{ ...styles.btnSave, backgroundColor: '#ff9800' }} onClick={handleResumeTest}>Resume Test</button>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Submit Test?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', margin: '20px 0' }}>
              <div style={{ background: '#e8f5e9', padding: '5px' }}>Answered: {counts.answered}</div>
              <div style={{ background: '#ffebee', padding: '5px' }}>Not Answered: {counts.notAnswered}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setShowSubmitModal(false)} style={styles.btnClear}>Cancel</button>
              <button onClick={handleSubmit} style={styles.btnSave}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeTest;
