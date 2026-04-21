import React, { useEffect } from "react";
import TestLayout from "./TestLayout";
import { FaClock, FaExclamationTriangle } from "react-icons/fa";

const StaticTest = (props) => {
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

  // Timer urgency levels
  const isCritical = timeLeft < 300; // < 5 minutes
  const isVeryLow = timeLeft < 60;   // < 1 minute


  useEffect(() => {
    if (showGuidelines) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [showGuidelines]);

  // LaTeX/Math Rendering
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
  }, [currentQuestionIndex, test]);

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
        {...rest}
      >
        {/* COL 1: Questions */}
        <div className={`${isMobile ? 'w-full bg-white border-b border-gray-200' : 'flex-1 bg-white border-r border-gray-200'} p-5 overflow-y-auto flex flex-col ${isMobile ? 'max-h-1/2' : ''}`}>
          <div className="flex justify-between border-b border-gray-200 pb-2 mb-4 items-center">
            <div className="text-lg font-bold text-gray-800">Q. {currentQuestionIndex + 1}</div>
            <div className="text-xs text-gray-600 flex gap-1 items-center">
              <span className="bg-green-100 text-green-800 px-1.5 rounded text-xs font-bold">+{currentQuestion?.marks || 1.0}</span>
              <span className="bg-red-100 text-red-800 px-1.5 rounded text-xs font-bold">-{currentQuestion?.negativeMarks || 0.0}</span>
            </div>
          </div>

          <div
            className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-800 font-medium mb-6 leading-relaxed question-content`}
            dangerouslySetInnerHTML={{ __html: currentQuestion?.question?.text || currentQuestion?.questionText || "" }}
          />
        </div>

        {/* COL 2: Options */}
        <div className="flex-1 bg-gray-50 border-r border-gray-200 p-5 overflow-y-auto">
          <h4 className="mb-4 text-gray-600">Options</h4>
          <div className="flex flex-col gap-3">
            {currentQuestion?.options?.map((opt, idx) => {
              const value = typeof opt === "object" ? opt.key : opt;
              const label = typeof opt === "object" ? opt.text : opt;
              const isSelected = answers[currentQuestion._id] === value;
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
                    onChange={() => handleAnswerChange(value)}
                  />
                  <span
                    className="text-sm text-gray-800 flex-1 option-content"
                    dangerouslySetInnerHTML={{ __html: label }}
                  />
                </label>
              )
            })}
          </div>
        </div>
      </TestLayout>

      {/* CRITICAL TIME WARNING - Floating Display */}
      {isCritical && (
        <div className={`fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2 p-4 rounded-xl border-2 shadow-2xl ${isVeryLow ? 'bg-red-700 border-red-900 animate-pulse' : 'bg-orange-600 border-orange-700'}`}>
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

export default StaticTest;
