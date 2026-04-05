import React, { useEffect, useRef, useState } from "react";
import TestLayout from "./TestLayout";
import { FaVideo, FaClock, FaUserShield, FaInfoCircle, FaCheck } from "react-icons/fa";

const InstructorFullMockTest = (props) => {
  const {
    test,
    currentQuestionIndex,
    answers,
    handleAnswerChange,
    showGuidelines,
    isMobile,
    timeLeft,
    formatTime,
    ...rest
  } = props;

  const currentQuestion = test?.questions?.[currentQuestionIndex];
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Security - Webcam Setup (Instructors can still see their cam but no proctoring logic)
  useEffect(() => {
    if (showGuidelines) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        console.warn("Camera access failed in instructor mode - non-critical.");
      }
    };
    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [showGuidelines]);

  const proctoringSidebar = (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video bg-black rounded overflow-hidden border-2 border-slate-700">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale opacity-80" />
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isCameraActive ? 'bg-red-500' : 'bg-slate-500'}`} />
          <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Live Monitor Preview</span>
        </div>
      </div>
      <div className="bg-slate-900/10 p-2 rounded-lg border border-slate-900/20">
        <div className="flex items-center gap-2 text-slate-800 mb-1 font-bold text-[10px] uppercase">
          <FaUserShield className="text-teal-600" />
          <span>Full Mock Instructor Mode</span>
        </div>
        <div className="text-[8px] text-slate-500 font-medium leading-tight">Proctoring (fullscreen lock, tab-switching) is disabled for instructors.</div>
      </div>
    </div>
  );

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
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Locked Mock Instructor View</span>
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

          <div className="mt-8 p-4 bg-teal-50 border border-teal-100 rounded-xl">
             <div className="flex items-center gap-2 mb-2">
                <FaInfoCircle className="text-teal-600" />
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-tight">Answer Key</span>
             </div>
             <p className="text-sm text-teal-800 font-medium">The correct option is: <span className="font-bold underline">{currentQuestion?.correctAnswer || currentQuestion?.correct_option || "Not Defined"}</span></p>
          </div>
        </div>

        {/* Options */}
        <div className="flex-1 bg-slate-50 p-8 overflow-y-auto border-r border-slate-100">
          <div className="flex flex-col gap-4">
            {currentQuestion?.options?.map((opt, idx) => {
              const isSelected = answers[currentQuestion._id] === opt.key;
              const isCorrect = (currentQuestion?.correctAnswer?.includes(opt.key)) || (currentQuestion?.correct_option === opt.key);

              return (
                <label
                  key={idx}
                  className={`flex items-center gap-5 cursor-pointer p-5 rounded-3xl border-2 transition-all duration-300 ${isSelected ? 'border-blue-600 bg-white shadow-xl shadow-blue-900/5' : 'border-slate-100 bg-white hover:border-slate-200'} ${isCorrect ? 'ring-2 ring-teal-400 ring-offset-4' : ''}`}
                >
                  <input
                    type="radio"
                    name="opt"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => handleAnswerChange(opt.key)}
                  />
                  <div className={`w-8 h-8 rounded-2xl flex items-center justify-center font-bold text-sm transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'} ${isCorrect && !isSelected ? 'bg-teal-100 text-teal-600' : ''}`}>
                    {opt.key}
                  </div>
                  <span
                    className={`text-slate-700 text-lg font-bold ${isSelected ? 'text-blue-700' : ''} ${isCorrect ? 'text-teal-700 underline decoration-teal-300 decoration-4' : ''}`}
                    dangerouslySetInnerHTML={{ __html: opt.text }}
                  />
                  {isCorrect && (
                    <div className="ml-auto w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg animate-bounce">
                        <FaCheck size={10} />
                    </div>
                  )}
                </label>
              )
            })}
          </div>
        </div>
      </TestLayout>

      {/* Floating Timer */}
      <div className="fixed top-20 right-6 z-40 bg-slate-900/90 border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center gap-3 text-white backdrop-blur-md">
        <FaClock className="text-teal-400" />
        <span className="text-xl font-black font-mono tracking-wider">{formatTime(timeLeft)}</span>
      </div>
    </>
  );
};

export default InstructorFullMockTest;
