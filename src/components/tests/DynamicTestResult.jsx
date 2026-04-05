import React, { useState, useEffect } from "react";
import { FaRedo, FaHome, FaChartBar, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaLightbulb, FaFireAlt } from "react-icons/fa";
import Confetti from "react-confetti";

const DynamicTestResult = ({ testResult, navigate, testId }) => {
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
    const score = testResult?.score || 0;

    // Calculate performance tier
    const getPerformanceTier = () => {
        if (accuracy >= 90) return { tier: "Excellent", color: "from-green-600 to-emerald-600", bg: "from-green-50 to-emerald-50" };
        if (accuracy >= 75) return { tier: "Good", color: "from-blue-600 to-cyan-600", bg: "from-blue-50 to-cyan-50" };
        if (accuracy >= 60) return { tier: "Average", color: "from-yellow-600 to-amber-600", bg: "from-yellow-50 to-amber-50" };
        return { tier: "Needs Improvement", color: "from-red-600 to-rose-600", bg: "from-red-50 to-rose-50" };
    };

    const performanceTier = getPerformanceTier();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
            {showConfetti && <Confetti numberOfPieces={250} recycle={false} />}

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2">Test Complete</h1>
                    <p className="text-slate-300">Comprehensive Performance Analysis</p>
                </div>

                {/* Main Score Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Left: Score */}
                    <div className={`lg:col-span-1 rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br ${performanceTier.bg}`}>
                        <div className={`bg-gradient-to-r ${performanceTier.color} text-white p-10 text-center relative overflow-hidden`}>
                            <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-white opacity-10 rounded-full"></div>
                            <div className="relative z-10">
                                <p className="text-sm opacity-90 uppercase tracking-widest mb-3 font-semibold">{performanceTier.tier}</p>
                                <div className="mb-4">
                                    <span className="text-6xl font-extrabold">{score}</span>
                                    <span className="text-xl opacity-75"> / 100</span>
                                </div>
                                <div className={`inline-block px-6 py-2 rounded-full ${isPassed ? 'bg-green-600' : 'bg-red-600'} text-white text-sm font-bold`}>
                                    {isPassed ? "✓ PASSED" : "✗ FAILED"}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white">
                            <div className="mb-6">
                                <p className="text-xs text-slate-500 font-bold uppercase mb-2">Accuracy</p>
                                <div className="text-4xl font-bold text-slate-800 mb-1">{accuracy}%</div>
                            </div>

                            <div className="space-y-3 border-t border-slate-200 pt-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Questions Attempted</span>
                                    <span className="font-bold text-slate-800">{attempted}/{totalQuestions}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Correct Answers</span>
                                    <span className="font-bold text-green-600">{correct}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Wrong Answers</span>
                                    <span className="font-bold text-red-600">{wrong}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Stats Grid */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                            <div className="flex items-center gap-3 mb-3">
                                <FaCheckCircle className="text-2xl text-green-600" />
                                <span className="text-sm text-slate-600 font-semibold">Correct</span>
                            </div>
                            <p className="text-4xl font-bold text-green-600">{correct}</p>
                            <p className="text-xs text-slate-500 mt-2">{Math.round((correct / totalQuestions) * 100)}% of total</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
                            <div className="flex items-center gap-3 mb-3">
                                <FaTimesCircle className="text-2xl text-red-600" />
                                <span className="text-sm text-slate-600 font-semibold">Incorrect</span>
                            </div>
                            <p className="text-4xl font-bold text-red-600">{wrong}</p>
                            <p className="text-xs text-slate-500 mt-2">{Math.round((wrong / totalQuestions) * 100)}% of total</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-500">
                            <div className="flex items-center gap-3 mb-3">
                                <FaExclamationCircle className="text-2xl text-amber-600" />
                                <span className="text-sm text-slate-600 font-semibold">Skipped</span>
                            </div>
                            <p className="text-4xl font-bold text-amber-600">{skipped}</p>
                            <p className="text-xs text-slate-500 mt-2">{Math.round((skipped / totalQuestions) * 100)}% of total</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                            <div className="flex items-center gap-3 mb-3">
                                <FaChartBar className="text-2xl text-blue-600" />
                                <span className="text-sm text-slate-600 font-semibold">Total</span>
                            </div>
                            <p className="text-4xl font-bold text-blue-600">{totalQuestions}</p>
                            <p className="text-xs text-slate-500 mt-2">Questions in this test</p>
                        </div>
                    </div>
                </div>

                {/* Performance Breakdown */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                        <FaChartBar className="text-blue-600" /> Performance Breakdown
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-slate-700">Correct Answer Rate</span>
                                <span className="text-2xl font-bold text-green-600">{accuracy}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
                                    style={{ width: `${accuracy}%` }}
                                >
                                    {accuracy > 10 && `${accuracy}%`}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-slate-700">Wrong Answer Rate</span>
                                <span className="text-2xl font-bold text-red-600">{100 - accuracy}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-red-500 to-rose-500 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
                                    style={{ width: `${100 - accuracy}%` }}
                                >
                                    {100 - accuracy > 10 && `${100 - accuracy}%`}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-slate-700">Attempt Rate</span>
                                <span className="text-2xl font-bold text-blue-600">{Math.round((attempted / totalQuestions) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
                                    style={{ width: `${(attempted / totalQuestions) * 100}%` }}
                                >
                                    {Math.round((attempted / totalQuestions) * 100)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Insights & Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Insights */}
                    <div className="bg-blue-50 rounded-2xl shadow-lg p-8 border-l-4 border-blue-500">
                        <h4 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
                            <FaLightbulb /> Key Insights
                        </h4>
                        <ul className="space-y-3 text-blue-800">
                            <li className="flex gap-2">
                                <span className="font-bold">•</span>
                                <span>You attempted {attempted} out of {totalQuestions} questions ({Math.round((attempted / totalQuestions) * 100)}%)</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">•</span>
                                <span>Your accuracy rate is {accuracy}%, which indicates {accuracy >= 75 ? 'strong' : accuracy >= 50 ? 'moderate' : 'developing'} understanding</span>
                            </li>
                            {skipped > 0 && (
                                <li className="flex gap-2">
                                    <span className="font-bold">•</span>
                                    <span>You skipped {skipped} question{skipped > 1 ? 's' : ''} - review these areas for improvement</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Recommendations */}
                    <div className={`rounded-2xl shadow-lg p-8 border-l-4 ${isPassed ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-500'}`}>
                        <h4 className={`font-bold mb-4 text-lg flex items-center gap-2 ${isPassed ? 'text-green-900' : 'text-amber-900'}`}>
                            <FaFireAlt /> {isPassed ? '✓ Keep It Up!' : '⚠️ All Next Steps'}
                        </h4>
                        <ul className={`space-y-3 ${isPassed ? 'text-green-800' : 'text-amber-800'}`}>
                            {isPassed ? (
                                <>
                                    <li className="flex gap-2">
                                        <span className="font-bold">•</span>
                                        <span>Excellent performance! You've demonstrated solid mastery of the material.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold">•</span>
                                        <span>Continue practicing with advanced tests to further sharpen your skills.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold">•</span>
                                        <span>Review incorrect answers to eliminate any remaining knowledge gaps.</span>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="flex gap-2">
                                        <span className="font-bold">•</span>
                                        <span>Review the topics covered in this test thoroughly before retaking.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold">•</span>
                                        <span>Focus on the questions you answered incorrectly to understand the concepts better.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold">•</span>
                                        <span>Practice similar questions and return when you're ready to attempt again.</span>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(`/take-test/${testId}`)}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition transform hover:-translate-y-0.5"
                    >
                        <FaRedo /> Retake Test
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border-2 border-slate-300 rounded-xl font-bold shadow-lg hover:bg-slate-50 hover:border-slate-400 transition"
                    >
                        <FaHome /> Back Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DynamicTestResult;
