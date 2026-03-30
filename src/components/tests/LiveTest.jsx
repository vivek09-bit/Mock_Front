import React, { useEffect, useState } from "react";
import TestLayout from "./TestLayout";
import { FaBolt, FaQuestionCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const LiveTest = (props) => {
  const {
    test,
    currentQuestionIndex,
    handleAnswerChange,
    isHost = false,
    ...rest
  } = props;

  const [selectedOption, setSelectedOption] = useState(null);
  const [hasResponded, setHasResponded] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setHasResponded(false);
  }, [currentQuestionIndex]);

  const onOptionClick = (key) => {
    if (hasResponded) return;
    setSelectedOption(key);
    setHasResponded(true);
    handleAnswerChange(key);
  };

  const optionStyles = {
    A: "bg-red-500 hover:bg-red-600 shadow-red-200",
    B: "bg-blue-500 hover:bg-blue-600 shadow-blue-200",
    C: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
    D: "bg-teal-500 hover:bg-teal-600 shadow-teal-200"
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 lg:p-12 animate-fadeIn transition-colors duration-500">
        <div className="max-w-4xl w-full space-y-8 text-center">
            <header className="mb-10 animate-slideDown">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-xs font-black uppercase tracking-widest mb-4">
                   <FaBolt /> Question {currentQuestionIndex + 1}
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tight">Focus on the Host Screen!</h1>
            </header>

            {!hasResponded ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {['A', 'B', 'C', 'D'].map(key => (
                        <button
                            key={key}
                            onClick={() => onOptionClick(key)}
                            className={`h-48 lg:h-64 rounded-[3rem] text-6xl font-black text-white shadow-2xl transition-all active:scale-95 group relative overflow-hidden ${optionStyles[key]}`}
                        >
                            {key}
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="animate-zoomIn flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-5xl shadow-2xl animate-bounce">
                        <FaCheckCircle />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Response Locked!</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Waiting for the next round...</p>
                    </div>
                    <div className="px-8 py-3 bg-white border border-slate-100 rounded-2xl text-slate-500 font-bold text-xl shadow-sm">
                        You chose Option <span className="text-indigo-600 font-black">{selectedOption}</span>
                    </div>
                </div>
            )}
        </div>

        {/* Decorative elements */}
        <div className="fixed -bottom-20 -left-20 w-80 h-80 bg-red-400/5 rounded-full blur-[100px] -z-10"></div>
        <div className="fixed -top-20 -right-20 w-80 h-80 bg-blue-400/5 rounded-full blur-[100px] -z-10"></div>
    </div>
  );
};

export default LiveTest;
