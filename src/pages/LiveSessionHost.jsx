import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import io from "socket.io-client";
import { ThemeContext } from "../context/ThemeContext";
import { FaUserCircle, FaTachometerAlt, FaBolt, FaQuestionCircle, FaChevronRight, FaPlay, FaBan, FaArrowLeft } from "react-icons/fa";
import axios from "axios";

let socket;

const LiveSessionHost = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { apiBase } = useContext(ThemeContext);

    // UI State
    const [test, setTest] = useState(null);
    const [status, setStatus] = useState("lobby"); // lobby, question, results, final
    const [loading, setLoading] = useState(true);

    // Live State
    const [passcode, setPasscode] = useState("");
    const [participants, setParticipants] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [liveData, setLiveData] = useState({
        totalResponses: 0,
        correctNames: []
    });
    const [rankedCorrect, setRankedCorrect] = useState([]); // [{rank, name, timeTaken}]
    const [timer, setTimer] = useState(30);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        let interval;
        if (status === "question" && !showResults && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0 && !showResults) {
            handleRevealAnswer();
        }
        return () => clearInterval(interval);
    }, [status, timer, showResults]);

    // ── Socket + Test Setup (runs once on mount) ───────────────────────────
    useEffect(() => {
        const generatedPasscode = Math.random().toString(36).substring(2, 6).toUpperCase();
        setPasscode(generatedPasscode);

        // 1. Create socket immediately so listeners are attached before connection
        socket = io(apiBase.replace(/\/api\/?$/, ''), { transports: ['websocket', 'polling'] });
        console.log(`[HOST_SOCKET_INIT] Creating connection to: ${apiBase.replace(/\/api\/?$/, '')}`);

        // Connection logging
        socket.on('connect', () => {
            console.log(`[HOST_CONNECTED] Socket ID: ${socket.id}, Test ID: ${testId}`);
        });

        socket.on('connect_error', (error) => {
            console.error(`[HOST_SOCKET_ERROR] Connection failed:`, error);
        });

        // 2. Register ALL incoming listeners right away
        socket.on('session-update', (data) => {
            console.log(`[HOST_SESSION_UPDATE] Participants: ${data.participants?.length || 0}`);
            console.log(`  - Participants:`, data.participants?.map(p => `${p.name} (${p.score}pts)`).join(', '));
            setParticipants(data.participants || []);
        });

        socket.on('new-response', (data) => {
            console.log(`[HOST_NEW_RESPONSE] Total: ${data.totalResponses}, Correct: ${data.correctNames?.length || 0}`);
            console.log(`  - Correct students:`, data.correctNames?.join(', ') || 'none');
            setLiveData(data);
        });

        socket.on('answer-revealed', (data) => {
            console.log(`[HOST_ANSWER_REVEALED] Q${data.currentQuestionIndex}, Responses: ${data.responses?.length || 0}, Ranked: ${data.rankedCorrect?.length || 0}`);
            if (data.rankedCorrect) setRankedCorrect(data.rankedCorrect);
        });

        socket.on('session-ended', () => {
            console.log('[HOST_SESSION_ENDED] Host ended the test session');
        });

        // 3. Fetch test, then register session only AFTER socket is confirmed connected
        const fetchAndRegister = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await axios.get(`${apiBase}/api/instructor/host/test-info/${testId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.data.success) return;

                const testData = res.data.test;
                setTest(testData);
                setLoading(false);

                const emitCreate = () => {
                    console.log('[HOST] Emitting host-create-session, socket:', socket.id);
                    socket.emit('host-create-session', {
                        testId,
                        passcode: generatedPasscode,
                        questions: testData.questions,
                    });
                    setSocketConnected(true);
                };

                // Only emit when socket is confirmed open
                if (socket.connected) {
                    emitCreate();
                } else {
                    socket.once('connect', emitCreate);
                }

            } catch (err) {
                console.error('Error fetching test for hosting:', err);
                setLoading(false);
            }
        };

        fetchAndRegister();

        return () => {
            if (socket) socket.disconnect();
        };
    }, [apiBase, testId]);

    const [socketConnected, setSocketConnected] = useState(false);

    const handleStartTest = () => {
        if (participants.length === 0) return alert("Wait for at least one student to join.");
        console.log(`[HOST_START_TEST] Starting test with ${participants.length} students`);
        setStatus("question");
        setCurrentQuestionIndex(0);
        setTimer(30);
        setShowResults(false);
        socket.emit('host-start-test', { testId });
    };

    const handleRevealAnswer = () => {
        console.log(`[HOST_REVEAL_ANSWER] Revealing answer for Q${currentQuestionIndex}`);
        setShowResults(true);
        socket.emit('host-reveal-answer', { testId });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex === test.questions.length - 1) {
            console.log(`[HOST_END_SESSION] Last question reached (Q${currentQuestionIndex}), ending session`);
            socket.emit('host-end-session', { testId });
            setStatus("final");
            return;
        }
        const nextIndex = currentQuestionIndex + 1;
        console.log(`[HOST_NEXT_QUESTION] Moving to Q${nextIndex}`);
        setLiveData({ totalResponses: 0, correctNames: [] });
        setRankedCorrect([]);
        setTimer(30);
        setShowResults(false);
        socket.emit('host-next-question', { testId });
    };

    const handleKick = (socketId) => {
        socket.emit('host-kick-student', { testId, studentSocketId: socketId });
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (status === "lobby") {
        return (
            <div className="min-h-screen bg-slate-50 p-8 flex flex-col gap-8 animate-fadeIn">
                <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <Link to="/instructor/my-tests" className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                            <FaArrowLeft />
                        </Link>
                        <div>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Live Battle Lobby</span>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{test.name}</h1>
                        </div>
                    </div>
                    <div className="bg-indigo-900 text-white px-8 py-4 rounded-2xl flex flex-col items-center">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Entry Passcode</span>
                        <h2 className="text-3xl font-black tracking-[0.5rem] leading-none ml-2">{passcode}</h2>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex-1 min-h-[400px]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Joined Students ({participants.length})</h3>
                                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div> Waiting Area
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {participants.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-300">
                                        <FaUserCircle className="text-6xl mb-4" />
                                        <p className="font-bold">Wait for students to join using passcode {passcode}</p>
                                    </div>
                                ) : (
                                    participants.map((p, idx) => (
                                        <div key={p.socketId} className="group relative flex flex-col items-center gap-3 animate-zoomIn">
                                            <div className="w-16 h-16 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm transition-transform hover:scale-110">
                                                {p.name.charAt(0).toUpperCase()}
                                            </div>
                                            <p className="text-xs font-black text-slate-700 truncate w-full text-center tracking-tight">{p.name}</p>
                                            <button
                                                onClick={() => handleKick(p.socketId)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <FaBan size={10} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-200">
                            <h3 className="text-xl font-black mb-4">Ready to Battle?</h3>
                            <p className="text-indigo-100 text-sm mb-8 leading-relaxed font-medium">
                                Once you start, students will only see response buttons. The questions will be shown here on your screen.
                            </p>
                            <button
                                onClick={handleStartTest}
                                className="w-full bg-white text-indigo-950 py-4 rounded-2xl font-black text-xl hover:bg-indigo-50 transition-all shadow-lg flex items-center justify-center gap-3"
                            >
                                <FaPlay /> Start Battle
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Proctoring Mode</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <FaTachometerAlt className="text-indigo-400" /> Auto-Lock Session
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600 opacity-50">
                                    <FaBolt className="text-indigo-400" /> Randomize Order
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === "question") {
        const currentQuestion = test.questions[currentQuestionIndex];
        return (
            <div className="min-h-screen bg-white flex flex-col animate-slideUp">
                {/* Progress Header */}
                <div className="h-2 w-full bg-slate-100 overflow-hidden flex relative">
                    <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}></div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-12 gap-12 max-w-5xl mx-auto w-full">
                    {/* Meta & Timer */}
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 px-6 py-2 bg-slate-100 rounded-full text-slate-500 text-xs font-black uppercase tracking-widest">
                            <FaQuestionCircle /> Question {currentQuestionIndex + 1} of {test.questions.length}
                        </div>
                        <div className={`px-8 py-3 rounded-2xl text-2xl font-black shadow-lg transition-colors ${timer <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white'}`}>
                            {timer}s
                        </div>
                    </div>

                    {/* Question Text */}
                    <div
                        className="text-4xl md:text-5xl font-black text-slate-900 leading-tight text-center tracking-tight bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-inner w-full"
                        dangerouslySetInnerHTML={{ __html: currentQuestion?.question?.text }}
                    />

                    {/* Options Grid for Master Screen */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
                        {currentQuestion?.options?.map((opt) => {
                            const isCorrect = currentQuestion.correctAnswer.includes(opt.key);
                            const colors = {
                                A: "bg-red-500 border-red-600 text-white",
                                B: "bg-blue-500 border-blue-600 text-white",
                                C: "bg-amber-500 border-amber-600 text-white",
                                D: "bg-teal-500 border-teal-600 text-white"
                            };

                            let displayStyle = colors[opt.key] || 'bg-slate-50 text-slate-900';
                            if (showResults) {
                                displayStyle = isCorrect ? 'bg-green-500 border-green-600 text-white scale-105 shadow-2xl z-10' : 'bg-slate-100 text-slate-300 border-slate-200 opacity-50 grayscale';
                            }

                            return (
                                <div key={opt.key} className={`flex items-center gap-6 p-8 rounded-[2.5rem] border-b-8 shadow-xl transition-all duration-500 ${displayStyle}`}>
                                    <span className="text-5xl font-black opacity-40">{opt.key}</span>
                                    <div
                                        className="text-2xl font-bold leading-tight"
                                        dangerouslySetInnerHTML={{ __html: opt.text }}
                                    />
                                    {showResults && isCorrect && <FaBolt className="ml-auto text-yellow-300 animate-bounce" size={40} />}
                                </div>
                            )
                        })}
                    </div>

                    {/* Reveal Phase: Ranked Correct-Answer Leaderboard */}
                    {showResults && (
                        <div className="w-full bg-slate-50 p-8 rounded-[3rem] border border-slate-100 animate-fadeIn mt-4">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FaBolt className="text-yellow-500" /> Speed Leaderboard — Correct Warriors ({rankedCorrect.length})
                                </h3>
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Ranked by response speed</span>
                            </div>

                            {rankedCorrect.length === 0 ? (
                                <p className="text-slate-400 font-bold italic text-sm">No correct answers this round.</p>
                            ) : (
                                <div className="space-y-3">
                                    {rankedCorrect.map((entry, i) => {
                                        const medalColors = ['bg-yellow-400 text-yellow-900', 'bg-slate-300 text-slate-700', 'bg-amber-600 text-amber-50'];
                                        const medalEmoji = ['🥇', '🥈', '🥉'];
                                        const rowColor = i === 0 ? 'border-yellow-200 bg-yellow-50' : i === 1 ? 'border-slate-200 bg-white' : i === 2 ? 'border-amber-100 bg-amber-50/50' : 'border-slate-100 bg-white';
                                        return (
                                            <div
                                                key={i}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 animate-slideRight transition-all ${rowColor}`}
                                                style={{ animationDelay: `${i * 60}ms` }}
                                            >
                                                {/* Rank badge */}
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${medalColors[i] || 'bg-indigo-50 text-indigo-600'}`}>
                                                    {i < 3 ? medalEmoji[i] : `#${entry.rank}`}
                                                </div>

                                                {/* Name */}
                                                <span className="font-black text-slate-800 flex-1 text-sm">{entry.name}</span>

                                                {/* Time badge */}
                                                {entry.timeTaken !== null && (
                                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                                                        ⚡ {entry.timeTaken}s
                                                    </span>
                                                )}

                                                {/* Correct tick */}
                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                                                    <span className="text-white text-xs font-black">✓</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bottom Controls */}
                    <div className="fixed bottom-12 left-0 right-0 p-8">
                        <div className="max-w-5xl mx-auto flex justify-between items-center">
                            <div className="bg-indigo-600 text-white px-8 py-4 rounded-3xl shadow-xl flex items-center gap-4">
                                <span className="text-3xl font-black">{liveData.totalResponses}</span>
                                <span className="text-xs font-bold uppercase tracking-widest leading-none">Students<br />Responded</span>
                            </div>

                            {!showResults ? (
                                <button
                                    onClick={handleRevealAnswer}
                                    className="bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black text-xl flex items-center gap-3 hover:bg-indigo-500 transition-all shadow-xl active:scale-95"
                                >
                                    Reveal Answer
                                </button>
                            ) : (
                                <button
                                    onClick={handleNextQuestion}
                                    className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-xl flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                                >
                                    {currentQuestionIndex === test.questions.length - 1 ? 'End Battle' : 'Next Question'} <FaChevronRight />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Response Log (Drawer style or Floating) */}
                <div className="fixed bottom-32 left-8 space-y-2 pointer-events-none">
                    {liveData.correctNames.slice(-3).map((name, i) => (
                        <div key={i} className="bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-black animate-slideRight flex items-center gap-2">
                            <FaBolt size={10} /> {name} answered correctly!
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (status === "final") {
        return (
            <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
                <div className="w-24 h-24 bg-teal-400 rounded-[2rem] flex items-center justify-center text-indigo-950 text-4xl mb-8 shadow-2xl shadow-teal-400/20 rotate-12">
                    🏆
                </div>
                <h1 className="text-6xl font-black text-white tracking-tighter mb-4">Battle Concluded!</h1>
                <p className="text-indigo-200 text-xl font-medium mb-12">Top performance metrics are being finalized.</p>

                <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 w-full max-w-2xl mb-12">
                    <h3 className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-6 text-left">Top Scorer</h3>
                    <div className="space-y-4">
                        {participants.sort((a, b) => b.score - a.score).slice(0, 3).map((p, i) => (
                            <div key={p.socketId} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <span className="text-teal-400 font-black text-2xl">{i + 1}</span>
                                    <span className="text-white font-bold">{p.name}</span>
                                </div>
                                <span className="text-indigo-300 font-black tracking-widest">{p.score} PTS</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Link to="/instructor/my-tests" className="bg-white text-indigo-950 px-12 py-5 rounded-3xl font-black text-xl hover:bg-slate-100 transition-all shadow-xl">
                    Return to Command Center
                </Link>
            </div>
        );
    }

    return null;
};

export default LiveSessionHost;
