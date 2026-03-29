import React, { useEffect } from "react";
import TestLayout from "./TestLayout";
import { FaBolt, FaQuestionCircle } from "react-icons/fa";

const LiveTest = (props) => {
  const {
    test,
    currentQuestionIndex,
    answers,
    handleAnswerChange,
    isMobile,
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
    <TestLayout
      test={test}
      currentQuestionIndex={currentQuestionIndex}
      currentQuestion={currentQuestion}
      answers={answers}
      handleAnswerChange={handleAnswerChange}
      isMobile={isMobile}
      {...rest}
    >
      <div className="flex-1 bg-white p-12 overflow-y-auto flex flex-col items-center">
        <div className="max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-amber-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <FaBolt />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Active Live Session</span>
                    <h2 className="text-xl font-bold text-slate-900">{test.name}</h2>
                </div>
            </div>

            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 mb-10 shadow-sm border-b-4 border-b-slate-200">
                <div className="flex items-center gap-2 mb-4">
                    <FaQuestionCircle className="text-slate-400 text-xs" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">Question {currentQuestionIndex + 1} of {test.questions.length}</span>
                </div>
                <div 
                    className="text-2xl text-slate-800 font-bold leading-tight"
                    dangerouslySetInnerHTML={{ __html: currentQuestion?.question?.text || "" }}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion?.options?.map((opt, idx) => {
                const isSelected = answers[currentQuestion._id] === opt.key;
                return (
                <label
                    key={idx}
                    className={`flex items-center gap-4 cursor-pointer p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${isSelected ? 'border-amber-500 bg-amber-50 shadow-xl shadow-amber-500/10 active:scale-[0.98]' : 'border-slate-100 bg-white hover:border-slate-200 active:scale-[0.98]'}`}
                >
                    <input
                    type="radio"
                    name="opt"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => handleAnswerChange(opt.key)}
                    />
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${isSelected ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50' : 'bg-slate-100 text-slate-400'}`}>
                    {opt.key}
                    </div>
                    <span 
                    className={`text-lg font-bold ${isSelected ? 'text-amber-700' : 'text-slate-700'}`}
                    dangerouslySetInnerHTML={{ __html: opt.text }}
                    />
                </label>
                )
            })}
            </div>
        </div>
      </div>
    </TestLayout>
  );
};

export default LiveTest;
