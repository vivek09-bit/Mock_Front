import React, { useEffect } from "react";
import TestLayout from "./TestLayout";
import { FaClock, FaUserShield, FaInfoCircle } from "react-icons/fa";

const InstructorPremockTest = (props) => {
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

  // LaTeX Rendering
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
  }, [currentQuestionIndex, test]);

  return (
    <>
      {/* Instructor Preview Header */}
      <div className="bg-indigo-900 text-white py-2 px-6 flex justify-between items-center shadow-lg sticky top-0 z-[60]">
        <div className="flex items-center gap-3">
          <FaUserShield className="text-teal-400" />
          <span className="font-bold text-sm uppercase tracking-widest">Instructor Preview Mode</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-medium opacity-80">
          <FaInfoCircle />
          <span>Proctoring disabled for instructors</span>
        </div>
      </div>

      <TestLayout
        test={test}
        currentQuestionIndex={currentQuestionIndex}
        currentQuestion={currentQuestion}
        answers={answers}
        handleAnswerChange={handleAnswerChange}
        isMobile={isMobile}
        timeLeft={timeLeft}
        formatTime={formatTime}
        {...rest}
      >
        {/* Question Content */}
        <div className={`${isMobile ? 'w-full bg-white border-b' : 'flex-1 bg-white border-r'} p-6 overflow-y-auto`}>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Question {currentQuestionIndex + 1}</span>
            <div className="flex gap-2">
              <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">+{currentQuestion?.marks || 1}</span>
              <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold">-{currentQuestion?.negativeMarks || 0}</span>
            </div>
          </div>
          <div
            className="text-lg text-slate-800 font-medium leading-relaxed"
            dangerouslySetInnerHTML={{ __html: currentQuestion?.question?.text || "" }}
          />

          {/* Instructor Tip: Correct Answer display */}
          <div className="mt-8 p-4 bg-teal-50 border border-teal-100 rounded-xl">
             <p className="text-[10px] font-bold text-teal-600 uppercase mb-2">Instructor Note:</p>
             <p className="text-sm text-teal-800 font-medium">Correct Answer: <span className="font-bold">{currentQuestion?.correctAnswer || currentQuestion?.correct_option || "Not Set"}</span></p>
          </div>
        </div>

        {/* Options */}
        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Select Answer</h4>
          <div className="flex flex-col gap-3">
            {currentQuestion?.options?.map((opt, idx) => {
              const isSelected = answers[currentQuestion._id] === opt.key;
              const isCorrect = (currentQuestion?.correctAnswer?.includes(opt.key)) || (currentQuestion?.correct_option === opt.key);
              
              return (
                <label
                  key={idx}
                  className={`flex items-center gap-4 cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 ${isSelected ? 'border-slate-800 bg-white shadow-md' : 'border-transparent bg-white hover:border-slate-200'} ${isCorrect ? 'ring-2 ring-teal-400 ring-offset-2' : ''}`}
                >
                  <input
                    type="radio"
                    name="opt"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => handleAnswerChange(opt.key)}
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-200 text-slate-400'} ${isCorrect && !isSelected ? 'bg-teal-100 border-teal-400 text-teal-700' : ''}`}>
                    {opt.key}
                  </div>
                  <span
                    className={`text-slate-700 font-medium ${isCorrect ? 'text-teal-700 font-bold' : ''}`}
                    dangerouslySetInnerHTML={{ __html: opt.text }}
                  />
                  {isCorrect && <span className="ml-auto text-[10px] font-bold text-teal-500 uppercase tracking-tight">Correct</span>}
                </label>
              )
            })}
          </div>
        </div>
      </TestLayout>

      {/* Timer Display (Always visible but non-critical for instructors) */}
      <div className="fixed bottom-6 left-6 z-40 bg-slate-800 text-white p-4 rounded-xl border border-slate-700 shadow-xl flex items-center gap-3">
        <FaClock className="text-teal-400" />
        <div className="text-xl font-mono tracking-tighter">
          {formatTime(timeLeft)}
        </div>
      </div>
    </>
  );
};

export default InstructorPremockTest;
