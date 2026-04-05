import React, { useState, useEffect } from "react";
import { FaRedo, FaHome, FaChartPie, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from "react-icons/fa";
import Confetti from "react-confetti";

const StaticTestResult = ({ testResult, navigate, testId }) => {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (testResult?.passed) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }, [testResult]);

    const totalQuestions = testResult?.totalQuestions || 0;
    const correct = testResult?.correctAnswers || 0;
    const attempted = testResult?.attempted || 0;
    const wrong = Math.max(0, attempted - correct);
    const skipped = Math.max(0, totalQuestions - attempted);
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const isPassed = testResult?.passed;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
            {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">Test Completed!</h1>
                    <p className="text-slate-500">Here's your performance summary</p>
                </div>

                {/* Main Score Card */}
                <div className={`rounded-3xl shadow-2xl overflow-hidden mb-8 ${isPassed ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-rose-50'}`}>
                    <div className={`${isPassed ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-rose-600'} text-white p-12 text-center relative overflow-hidden`}>
                        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white opacity-10 rounded-full"></div>
                        <div className="relative z-10">
                            <h2 className="text-lg font-medium opacity-90 uppercase tracking-widest mb-4">{testResult?.testName || "Test Result"}</h2>
                            <div className="mb-6">
                                <span className="text-7xl font-extrabold">{testResult?.score || 0}</span>
                                <span className="text-2xl opacity-75"> / 100</span>
                            </div>
                            <div className={`inline-block px-6 py-2 rounded-full ${isPassed ? 'bg-green-700' : 'bg-red-700'} text-white text-lg font-bold`}>
                                {isPassed ? "✓ PASSED" : "✗ FAILED"}
                            </div>
                        </div>
                    </div>

                    <div className="p-12">
                        <p className="text-center text-slate-700 mb-8 text-lg font-medium">
                            {isPassed
                                ? "🎉 Excellent! You've successfully passed the test."
                                : "Keep practicing! Review and retake the test."}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white rounded-2xl p-6 text-center border-2 border-slate-200 hover:border-blue-400 transition">
                                <div className="flex justify-center mb-2">
                                    <FaChartPie className="text-3xl text-blue-600" />
                                </div>
                                <div className="text-3xl font-bold text-slate-800 mb-1">{accuracy}%</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Accuracy</div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 text-center border-2 border-slate-200 hover:border-green-400 transition">
                                <div className="flex justify-center mb-2">
                                    <FaCheckCircle className="text-3xl text-green-600" />
                                </div>
                                <div className="text-3xl font-bold text-slate-800 mb-1">{correct}</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Correct</div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 text-center border-2 border-slate-200 hover:border-red-400 transition">
                                <div className="flex justify-center mb-2">
                                    <FaTimesCircle className="text-3xl text-red-600" />
                                </div>
                                <div className="text-3xl font-bold text-slate-800 mb-1">{wrong}</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Incorrect</div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 text-center border-2 border-slate-200 hover:border-amber-400 transition">
                                <div className="flex justify-center mb-2">
                                    <FaExclamationCircle className="text-3xl text-amber-600" />
                                </div>
                                <div className="text-3xl font-bold text-slate-800 mb-1">{skipped}</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Skipped</div>
                            </div>
                        </div>

                        {/* Distribution Bars */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2 text-slate-700 font-semibold">
                                    <span>Correct Answers</span>
                                    <span>{Math.round((correct / totalQuestions) * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full" style={{ width: `${(correct / totalQuestions) * 100}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-2 text-slate-700 font-semibold">
                                    <span>Incorrect Answers</span>
                                    <span>{Math.round((wrong / totalQuestions) * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                                    <div className="bg-gradient-to-r from-red-500 to-rose-500 h-4 rounded-full" style={{ width: `${(wrong / totalQuestions) * 100}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-2 text-slate-700 font-semibold">
                                    <span>Skipped</span>
                                    <span>{Math.round((skipped / totalQuestions) * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-4 rounded-full" style={{ width: `${(skipped / totalQuestions) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attempt Summary */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Attempt Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <p className="text-slate-600 text-sm font-medium mb-1">Total Questions</p>
                            <p className="text-3xl font-bold text-blue-600">{totalQuestions}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <p className="text-slate-600 text-sm font-medium mb-1">Questions Attempted</p>
                            <p className="text-3xl font-bold text-emerald-600">{attempted}</p>
                        </div>
                    </div>
                </div>

                {/* Recommendation */}
                <div className={`rounded-2xl p-8 mb-8 border-l-4 ${isPassed ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-500'}`}>
                    <h4 className={`font-bold ${isPassed ? 'text-green-800' : 'text-amber-800'} mb-2 text-lg`}>
                        {isPassed ? "✓ Great Job!" : "⚠️ Recommendation"}
                    </h4>
                    <p className={`${isPassed ? 'text-green-700' : 'text-amber-700'} leading-relaxed`}>
                        {isPassed
                            ? "You've demonstrated good understanding of the material. Continue practicing to maintain and improve your performance on similar tests."
                            : "Review the concepts covered in this test and practice more questions. Focus on the areas where you faced difficulties before attempting again."}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate(`/take-test/${testId}`)}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition transform hover:-translate-y-0.5"
                    >
                        <FaRedo /> Retake Test
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 px-8 py-3 bg-white text-slate-700 border-2 border-slate-300 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-400 transition"
                    >
                        <FaHome /> Back Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaticTestResult;
