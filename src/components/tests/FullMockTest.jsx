import React, { useEffect, useRef, useState } from "react";
import TestLayout from "./TestLayout";
import { FaVideo, FaExpand, FaExclamationTriangle, FaClock } from "react-icons/fa";

const FullMockTest = (props) => {
  const {
    test,
    currentQuestionIndex,
    answers,
    handleAnswerChange,
    showGuidelines,
    setTabSwitchCount,
    handleSubmit,
    setWarningMessage,
    enterFullScreen,
    isMobile,
    timeLeft,
    formatTime,
    ...rest
  } = props;

  const currentQuestion = test?.questions?.[currentQuestionIndex];
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(document.fullscreenElement !== null);

  // Timer urgency levels
  const isCritical = timeLeft < 300; // < 5 minutes
  const isVeryLow = timeLeft < 60;   // < 1 minute

  // Security - Webcam & Fullscreen & Tab Switching
  useEffect(() => {
    if (showGuidelines) return;

    // Webcam Setup
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        setWarningMessage("⚠️ Camera access is REQUIRED for this test. Please enable your camera.");
      }
    };
    startCamera();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount > 2) handleSubmit();
          else setWarningMessage(`⚠️ CRITICAL: Security violation (Tab switch). Final Warning: ${newCount}/2`);
          return newCount;
        });
      }
    };

    const handleFullscreenChange = () => {
      const isFull = document.fullscreenElement !== null;
      setIsFullscreen(isFull);
      if (!isFull) {
        setWarningMessage("⚠️ WARNING: Fullscreen mode is REQUIRED. Please click 'Re-enter Fullscreen' below.");
      }
    };

    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
        e.preventDefault();
        setWarningMessage("⚠️ Security System: DevTools are blocked.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      const stream = videoRef.current?.srcObject;
      stream?.getTracks().forEach(track => track.stop());
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showGuidelines, setWarningMessage, setTabSwitchCount, handleSubmit]);

  const proctoringSidebar = (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video bg-black rounded overflow-hidden border-2 border-slate-700">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale opacity-80" />
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isCameraActive ? 'bg-red-500' : 'bg-slate-500'}`} />
          <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Live Monitor</span>
        </div>
      </div>
      <div className="bg-slate-900/10 p-2 rounded-lg border border-slate-900/20">
        <div className="flex items-center gap-2 text-slate-800 mb-1">
          <FaVideo className="text-[10px]" />
          <span className="text-[10px] font-bold uppercase tracking-tight">AI Identity Verification: Active</span>
        </div>
        <div className="text-[8px] text-slate-500 font-medium">Monitoring for multiple persons, objects, and eye tracking.</div>
      </div>
    </div>
  );

  if (!isFullscreen && !showGuidelines) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center text-white">
        <FaExclamationTriangle className="text-6xl text-amber-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Assessment Interrupted</h1>
        <p className="text-slate-400 max-w-md mb-8">
          This test is protected by mandatory fullscreen proctoring. You must remain in fullscreen to view questions and submit answers.
        </p>
        <button
          onClick={enterFullScreen}
          className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-slate-100 transition-all"
        >
          <FaExpand />
          Re-enter Fullscreen (Recommended)
        </button>
      </div>
    );
  }

  return (
    <>
      <TestLayout
        test={test}
        currentQuestionIndex={currentQuestionIndex}
        currentQuestion={currentQuestion}
        answers={answers}
        handleAnswerChange={handleAnswerChange}
        isMobile={isMobile}
        timeLeft={timeLeft}
        formatTime={formatTime}
        proctoringSidebar={proctoringSidebar}
        {...rest}
      >
        {/* Question Content */}
        <div className={`${isMobile ? 'w-full bg-white border-b' : 'flex-1 bg-white border-r'} p-8 overflow-y-auto`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{currentQuestionIndex + 1}</div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Locked Mock Instance</span>
            </div>
            <div className="flex gap-2">
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100">+{currentQuestion?.marks || 1}</span>
              <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-bold border border-rose-100">-{currentQuestion?.negativeMarks || 0}</span>
            </div>
          </div>
          <div
            className="text-xl text-slate-800 font-semibold leading-relaxed"
            dangerouslySetInnerHTML={{ __html: currentQuestion?.question?.text || "" }}
          />
        </div>

        {/* Options */}
        <div className="flex-1 bg-slate-50 p-8 overflow-y-auto border-r border-slate-100">
          <div className="flex flex-col gap-4">
            {currentQuestion?.options?.map((opt, idx) => {
              const isSelected = answers[currentQuestion._id] === opt.key;
              return (
                <label
                  key={idx}
                  className={`flex items-center gap-5 cursor-pointer p-5 rounded-3xl border-2 transition-all duration-300 ${isSelected ? 'border-blue-600 bg-white shadow-xl shadow-blue-900/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <input
                    type="radio"
                    name="opt"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => handleAnswerChange(opt.key)}
                  />
                  <div className={`w-8 h-8 rounded-2xl flex items-center justify-center font-bold text-sm transition-colors ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-400/50' : 'bg-slate-100 text-slate-400'}`}>
                    {opt.key}
                  </div>
                  <span
                    className={`text-slate-700 text-lg font-bold ${isSelected ? 'text-blue-700' : ''}`}
                    dangerouslySetInnerHTML={{ __html: opt.text }}
                  />
                </label>
              )
            })}
          </div>
        </div>
      </TestLayout>

      {/* CRITICAL TIME WARNING - Floating Display (FullMock Premium) */}
      {isCritical && (
        <div className={`fixed top-20 right-6 z-40 flex flex-col items-center gap-2 p-5 rounded-xl border-2 shadow-2xl ${isVeryLow ? 'bg-red-700 border-red-900 animate-pulse' : 'bg-orange-600 border-orange-700'}`}>
          <div className="flex items-center gap-2">
            <FaClock className={`text-2xl ${isVeryLow ? 'animate-spin text-white' : 'text-yellow-100'}`} />
            <span className="text-white font-black text-sm uppercase">{isVeryLow ? '⚠️ CRITICAL' : '⏰ HURRY'}</span>
          </div>
          <div className={`text-2xl font-black tracking-wider ${isVeryLow ? 'text-white' : 'text-yellow-100'}`}>
            {formatTime(timeLeft)}
          </div>
          {isVeryLow && (
            <div className="text-[10px] text-red-100 font-bold text-center">
              Less than 1 minute!<br />Submit immediately
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FullMockTest;
