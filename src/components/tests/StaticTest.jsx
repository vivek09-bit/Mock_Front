import React, { useEffect } from "react";
import TestLayout from "./TestLayout";

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
    ...rest
  } = props;

  const currentQuestion = test?.questions?.[currentQuestionIndex];

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
      if (!document.fullscreenElement) {
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
  }, [showGuidelines, setWarningMessage, setTabSwitchCount, handleSubmit]);

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
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showGuidelines, setWarningMessage]);

  // LaTeX/Math Rendering
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
  );
};

export default StaticTest;
