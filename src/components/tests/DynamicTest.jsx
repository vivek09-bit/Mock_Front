import React, { useEffect } from "react";
import TestLayout from "./TestLayout";

const DynamicTest = (props) => {
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
    <TestLayout
      test={test}
      currentQuestionIndex={currentQuestionIndex}
      currentQuestion={currentQuestion}
      answers={answers}
      handleAnswerChange={handleAnswerChange}
      isMobile={isMobile}
      {...rest}
    >
      <div className={`${isMobile ? 'w-full bg-white border-b border-gray-200' : 'flex-1 bg-white border-r border-gray-200'} p-5 overflow-y-auto flex flex-col ${isMobile ? 'max-h-1/2' : ''}`}>
        <div className="flex justify-between border-b border-gray-200 pb-2 mb-4 items-center">
          <div className="text-lg font-bold text-gray-800">Q. {currentQuestionIndex + 1} (Dynamic)</div>
          <div className="text-xs text-gray-600 flex gap-1 items-center">
            <span className="bg-green-100 text-green-800 px-1.5 rounded text-xs font-bold">+{currentQuestion?.marks || 1}</span>
            <span className="bg-red-100 text-red-800 px-1.5 rounded text-xs font-bold">-{currentQuestion?.negativeMarks || 0}</span>
          </div>
        </div>
        <div
          className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-800 font-medium mb-6 leading-relaxed question-content`}
          dangerouslySetInnerHTML={{ __html: currentQuestion?.question?.text || currentQuestion?.questionText || "" }}
        />
      </div>

      <div className="flex-1 bg-gray-50 border-r border-gray-200 p-5 overflow-y-auto">
        <h4 className="mb-4 text-gray-600">Options</h4>
        <div className="flex flex-col gap-3">
          {currentQuestion?.options?.map((opt, idx) => {
            const value = typeof opt === "object" ? opt.key : opt;
            const label = typeof opt === "object" ? opt.text : opt;
            const isSelected = answers[currentQuestion._id] === value;
            return (
              <label key={idx} className={`flex items-center gap-2 cursor-pointer p-3 rounded border border-gray-200 bg-white transition-all duration-200 ${isSelected ? 'bg-gray-50 border-gray-500' : ''}`}>
                <input type="radio" name="opt" className="accent-gray-500 w-4 h-4" checked={isSelected} onChange={() => handleAnswerChange(value)} />
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

export default DynamicTest;
