import React, { useEffect } from "react";
import TestLayout from "./TestLayout";

const PremockTest = (props) => {
  const {
    test,
    currentQuestionIndex,
    answers,
    handleAnswerChange,
    showGuidelines,
    setTabSwitchCount,
    handleSubmit,
    setWarningMessage,
    isMobile,
    ...rest
  } = props;

  const currentQuestion = test?.questions?.[currentQuestionIndex];

  // Security - Tab Switching & Anti-Cheat
  useEffect(() => {
    if (showGuidelines) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount > 2) {
            handleSubmit();
          } else {
            setWarningMessage(`⚠️ Security Alert: Tab switch detected. Only 2 switches allowed. Count: ${newCount}/2`);
          }
          return newCount;
        });
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      setWarningMessage("⚠️ Right-click is disabled in Premock mode.");
    };

    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        setWarningMessage("⚠️ Developer tools are disabled.");
      }
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        setWarningMessage("⚠️ Copy/Paste is disabled.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showGuidelines, setWarningMessage, setTabSwitchCount, handleSubmit]);

  // LaTeX Rendering
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
  }, [currentQuestionIndex, test]);

  return (
    <TestLayout
      test={test}
      currentQuestionIndex={currentQuestionIndex}
      currentQuestion={currentQuestion}
      answers={answers}
      handleAnswerChange={handleAnswerChange}
      isMobile={isMobile}
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
      </div>

      {/* Options */}
      <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Select Answer</h4>
        <div className="flex flex-col gap-3">
          {currentQuestion?.options?.map((opt, idx) => {
            const isSelected = answers[currentQuestion._id] === opt.key;
            return (
              <label
                key={idx}
                className={`flex items-center gap-4 cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 ${isSelected ? 'border-slate-800 bg-white shadow-md' : 'border-transparent bg-white hover:border-slate-200'}`}
              >
                <input
                  type="radio"
                  name="opt"
                  className="hidden"
                  checked={isSelected}
                  onChange={() => handleAnswerChange(opt.key)}
                />
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-200 text-slate-400'}`}>
                  {opt.key}
                </div>
                <span 
                  className="text-slate-700 font-medium"
                  dangerouslySetInnerHTML={{ __html: opt.text }}
                />
              </label>
            )
          })}
        </div>
      </div>
    </TestLayout>
  );
};

export default PremockTest;
