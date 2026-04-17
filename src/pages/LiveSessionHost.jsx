import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import io from "socket.io-client";
import { ThemeContext } from "../context/ThemeContext";
import { FaUserCircle, FaTachometerAlt, FaBolt, FaQuestionCircle, FaChevronRight, FaPlay, FaBan, FaArrowLeft, FaUsers, FaGamepad } from "react-icons/fa";
import axios from "axios";

const LiveSessionHost = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { apiBase } = useContext(ThemeContext);

    // Using ref for socket instead of global variable to prevent reconnect bugs on re-renders
    const socketRef = useRef(null);

    // UI State
    const [test, setTest] = useState(null);
    const [status, setStatus] = useState("lobby");
    const [loading, setLoading] = useState(true);

    // Live State
    const [passcode, setPasscode] = useState("");
    const [participants, setParticipants] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [liveData, setLiveData] = useState({
        totalResponses: 0,
        correctNames: []
    });
    const [rankedCorrect, setRankedCorrect] = useState([]);
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
        const socketUrl = new URL(apiBase).origin;

        const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
        socketRef.current = socket;
        console.log(`[HOST_SOCKET_INIT] Creating connection to: ${socketUrl}`);

        // Connection logging
        socket.on('connect', () => {
            console.log(`[HOST_CONNECTED] Socket ID: ${socket.id}, Test ID: ${testId}`);
        });

        socket.on('connect_error', (error) => {
            console.error(`[HOST_SOCKET_ERROR] Connection failed:`, error);
        });

        // 2. Register ALL incoming listeners right away
        socket.on('session-update', (data) => {
            setParticipants(data.participants || []);
        });

        socket.on('new-response', (data) => {
            setLiveData(data);
        });

        socket.on('answer-revealed', (data) => {
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
                    socket.emit('host-create-session', {
                        testId,
                        passcode: generatedPasscode,
                        questions: testData.questions,
                    });
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
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [apiBase, testId]);

    const handleStartTest = () => {
        if (participants.length === 0) return alert("Wait for at least one student to join.");
        setStatus("question");
        setCurrentQuestionIndex(0);
        setTimer(30);
        setShowResults(false);
        socketRef.current?.emit('host-start-test', { testId });
    };

    const handleRevealAnswer = () => {
        setShowResults(true);
        socketRef.current?.emit('host-reveal-answer', { testId });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex === test.questions.length - 1) {
            socketRef.current?.emit('host-end-session', { testId });
            setStatus("final");
            return;
        }
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setLiveData({ totalResponses: 0, correctNames: [] });
        setRankedCorrect([]);
        setTimer(30);
        setShowResults(false);
        socketRef.current?.emit('host-next-question', { testId });
    };

    const handleKick = (socketId) => {
        socketRef.current?.emit('host-kick-student', { testId, studentSocketId: socketId });
    };

    if (loading) return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#3730a3,#1e1b4b_60%,#0f172a)] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
        </div>
    );

    if (status === "lobby") {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#3730a3,#1e1b4b_60%,#0f172a)] p-4 md:p-8 flex flex-col gap-6 md:gap-8 animate-fadeIn relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <header className="flex flex-col md:flex-row justify-between items-center bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl relative z-10 gap-6">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link to="/instructor/my-tests" className="p-3 bg-white/10 rounded-xl text-white hover:text-amber-400 hover:bg-white/20 transition-all shadow-md flex-shrink-0">
                            <FaArrowLeft />
                        </Link>
                        <div className="overflow-hidden">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Command Center</span>
                            <h1 className="text-xl md:text-3xl font-black text-white tracking-tight truncate w-full">{test.name}</h1>
                        </div>
                    </div>
                    <div className="w-full md:w-auto bg-amber-500 text-slate-950 px-8 py-4 rounded-2xl flex flex-col items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                        <span className="text-[12px] md:text-[14px] font-black uppercase tracking-widest text-center opacity-80 mb-1">
                            Game Pin
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-[0.5rem] leading-none ml-2">{passcode}</h2>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 flex-1 relative z-10">
                    <div className="lg:col-span-3 flex flex-col space-y-6">
                        <div className="bg-white/5 backdrop-blur-md p-6 md:p-8 rounded-[3rem] border border-white/10 flex-1 min-h-[400px] shadow-2xl">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                                <h3 className="text-sm font-black text-indigo-200 uppercase tracking-widest flex items-center gap-3">
                                    <FaUsers className="text-amber-500" /> Joined Warriors
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-white">{participants.length}</span>
                                </h3>
                                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/20">
                                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div> Live Sync
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {participants.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                                        <FaUserCircle className="text-6xl text-white/10" />
                                        <p className="font-bold text-sm tracking-widest uppercase opacity-70">Awaiting Challengers...</p>
                                    </div>
                                ) : (
                                    participants.map((p) => (
                                        <div key={p.socketId} className="group relative flex flex-col items-center gap-3 animate-zoomIn">
                                            <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-white font-black text-2xl shadow-xl transition-all group-hover:scale-110 group-hover:bg-amber-500/20 group-hover:border-amber-500/50 group-hover:text-amber-400">
                                                {p.name.charAt(0).toUpperCase()}
                                            </div>
                                            <p className="text-xs font-black text-indigo-100 truncate w-full text-center tracking-tight transition-colors group-hover:text-amber-400">{p.name}</p>
                                            <button
                                                onClick={() => handleKick(p.socketId)}
                                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-75 hover:scale-100"
                                                title="Kick Student"
                                            >
                                                <FaBan size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6 flex flex-col">
                        <div className="bg-indigo-600/80 backdrop-blur-xl p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-900/50 border border-indigo-400/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            <h3 className="text-xl font-black mb-4 relative z-10">Start the Attack</h3>
                            <p className="text-indigo-200 text-sm mb-8 leading-relaxed font-medium relative z-10">
                                Once initiated, students' apps will lock into response mode. You control the pace from this command center.
                            </p>
                            <button
                                onClick={handleStartTest}
                                className="w-full bg-white text-indigo-950 py-4 rounded-2xl font-black text-xl hover:bg-amber-400 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 active:scale-95 group relative z-10"
                            >
                                <FaPlay className="text-sm group-hover:text-slate-900" /> Start Battle
                            </button>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
                            <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-4">Proctoring Controls</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm font-bold text-white bg-white/5 p-3 rounded-xl border border-white/10">
                                    <FaTachometerAlt className="text-teal-400" /> Auto-Lock Active
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-white/50 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <FaGamepad className="text-indigo-400" /> Randomize (Coming Soon)
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
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#3730a3,#1e1b4b_60%,#0f172a)] flex flex-col animate-slideUp text-white pb-32">
                {/* Progress Header */}
                <div className="h-2 w-full bg-white/10 overflow-hidden flex relative z-20">
                    <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-1000" style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}></div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 gap-8 md:gap-12 max-w-6xl mx-auto w-full relative z-10">
                    {/* Meta & Timer */}
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-indigo-200 text-xs font-black uppercase tracking-widest shadow-lg">
                            <FaQuestionCircle className="text-amber-500" /> Question {currentQuestionIndex + 1} of {test.questions.length}
                        </div>
                        <div className={`px-8 py-3 rounded-2xl text-2xl font-black shadow-lg transition-colors border border-white/10 ${timer <= 5 ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-white/10 backdrop-blur-md text-white'}`}>
                            {timer}s
                        </div>
                    </div>

                    {/* Question Text */}
                    <div
                        className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight text-center tracking-tight bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.3)] w-full relative"
                        dangerouslySetInnerHTML={{ __html: currentQuestion?.question?.text }}
                    ></div>

                    {/* Options Grid for Master Screen */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
                        {currentQuestion?.options?.map((opt) => {
                            const isCorrect = currentQuestion.correctAnswer.includes(opt.key);

                            // Rich colors corresponding to the student device buttons
                            const colors = {
                                A: "bg-red-500/20 border-red-500/50 text-white hover:bg-red-500/30",
                                B: "bg-blue-500/20 border-blue-500/50 text-white hover:bg-blue-500/30",
                                C: "bg-amber-500/20 border-amber-500/50 text-white hover:bg-amber-500/30",
                                D: "bg-teal-500/20 border-teal-500/50 text-white hover:bg-teal-500/30"
                            };

                            let displayStyle = colors[opt.key] || 'bg-white/10 border-white/20 text-white';
                            if (showResults) {
                                displayStyle = isCorrect ? 'bg-green-500 border-green-400 text-white scale-105 shadow-[0_0_40px_rgba(34,197,94,0.4)] z-10' : 'bg-white/5 text-white/30 border-white/5 grayscale saturate-0';
                            }

                            return (
                                <div key={opt.key} className={`flex items-center gap-6 p-6 md:p-8 rounded-[2.5rem] border-2 shadow-lg backdrop-blur-md transition-all duration-500 ${displayStyle}`}>
                                    <span className="text-4xl md:text-5xl font-black opacity-50 drop-shadow-md border-r border-white/20 pr-6">{opt.key}</span>
                                    <div
                                        className="text-xl md:text-2xl font-bold leading-tight"
                                        dangerouslySetInnerHTML={{ __html: opt.text }}
                                    />
                                    {showResults && isCorrect && <FaBolt className="ml-auto text-yellow-300 animate-bounce filter drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]" size={36} />}
                                </div>
                            )
                        })}
                    </div>

                    {/* Reveal Phase: Ranked Correct-Answer Leaderboard */}
                    {showResults && (
                        <div className="w-full bg-slate-900/60 backdrop-blur-2xl p-6 md:p-8 rounded-[3rem] border border-indigo-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-slideUp">
                            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                                <h3 className="text-sm font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2 text-center md:text-left">
                                    <span className="bg-amber-500 p-2 rounded-xl text-slate-900"><FaBolt /></span>
                                    Speed Leaderboard — Correct Warriors ({rankedCorrect.length})
                                </h3>
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10">Ranked by response time</span>
                            </div>

                            {rankedCorrect.length === 0 ? (
                                <div className="p-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/20">
                                    <p className="text-white/50 font-bold italic text-lg">Nobody got it right this round. The battle is fierce!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {rankedCorrect.map((entry, i) => {
                                        const isTop3 = i < 3;
                                        const medalColors = ['bg-yellow-400 text-yellow-950 border-yellow-200', 'bg-slate-300 text-slate-800 border-white', 'bg-amber-700 text-amber-50 border-amber-600'];
                                        const medalEmoji = ['🥇', '🥈', '🥉'];
                                        const rowStyle = i === 0 ? 'border-yellow-400/50 bg-yellow-500/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                                            : i === 1 ? 'border-slate-300/30 bg-slate-400/10'
                                                : i === 2 ? 'border-amber-600/30 bg-amber-700/10'
                                                    : 'border-white/10 bg-white/5';

                                        return (
                                            <div
                                                key={i}
                                                className={`flex items-center gap-4 p-3 md:p-4 rounded-2xl border transition-all ${rowStyle}`}
                                                style={{ animation: `slideRight 0.5s ease-out forwards`, animationDelay: `${i * 100}ms`, opacity: 0 }}
                                            >
                                                {/* Rank badge */}
                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border flex items-center justify-center font-black text-lg shrink-0 shadow-lg ${isTop3 ? medalColors[i] : 'bg-indigo-900/50 text-indigo-300 border-indigo-500/30'}`}>
                                                    {isTop3 ? medalEmoji[i] : `#${entry.rank}`}
                                                </div>

                                                {/* Name */}
                                                <span className="font-black text-white flex-1 text-base md:text-lg tracking-tight">{entry.name}</span>

                                                {/* Time badge */}
                                                {entry.timeTaken !== null && (
                                                    <span className="bg-slate-950/50 text-amber-400 border border-amber-400/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-black tracking-widest shadow-inner">
                                                        ⚡ {entry.timeTaken}s
                                                    </span>
                                                )}

                                                {/* Correct tick */}
                                                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                                    <span className="text-green-400 text-sm font-black">✓</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom Controls */}
                <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-[#0f172a] to-transparent z-50">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="bg-indigo-900/80 backdrop-blur-xl border border-indigo-500/30 text-white px-6 md:px-8 py-3 md:py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 w-full md:w-auto justify-center">
                            <span className="text-3xl md:text-4xl font-black text-amber-400">{liveData.totalResponses}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest leading-none opacity-80 border-l border-white/20 pl-4 py-2">Responses<br />Collected</span>
                        </div>

                        <div className="flex-1 w-full md:w-auto flex justify-end">
                            {!showResults ? (
                                <button
                                    onClick={handleRevealAnswer}
                                    className="w-full md:w-auto bg-amber-500 text-slate-950 border border-amber-400 px-8 md:px-12 py-4 md:py-5 rounded-[2rem] font-black text-lg md:text-xl flex items-center justify-center gap-3 hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95"
                                >
                                    Reveal Correct Answer
                                </button>
                            ) : (
                                <button
                                    onClick={handleNextQuestion}
                                    className="w-full md:w-auto bg-white text-indigo-950 px-8 md:px-12 py-4 md:py-5 rounded-[2rem] font-black text-lg md:text-xl flex items-center justify-center gap-3 hover:bg-slate-100 hover:scale-105 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] active:scale-95"
                                >
                                    {currentQuestionIndex === test.questions.length - 1 ? 'Conclude Battle' : 'Next Question'} <FaChevronRight />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Floating Response Log (Top Right Desktop, Hidden Mobile) */}
                <div className="hidden md:flex fixed top-24 right-8 flex-col space-y-3 pointer-events-none z-40 items-end">
                    {liveData.correctNames.slice(-4).map((name, i) => (
                        <div key={i} className="bg-green-500/20 backdrop-blur-md border border-green-500/50 text-green-100 px-4 py-2.5 rounded-2xl text-xs font-black animate-slideLeft flex items-center gap-2 shadow-lg">
                            <FaBolt className="text-green-400" size={12} /> {name} answered instantly!
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (status === "final") {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#3730a3,#1e1b4b_60%,#0f172a)] flex flex-col items-center justify-center p-8 text-center animate-fadeIn relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none"></div>

                <div className="w-24 h-24 bg-amber-500 rounded-[2rem] flex items-center justify-center text-slate-900 text-5xl mb-8 shadow-[0_0_40px_rgba(245,158,11,0.5)] rotate-12 animate-bounce cursor-default relative z-10">
                    🏆
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 relative z-10 drop-shadow-2xl">Battle Concluded!</h1>
                <p className="text-indigo-200 text-xl font-medium mb-12 relative z-10 max-w-lg mx-auto">The final metrics have been synchronized. The warriors have fought well.</p>

                <div className="bg-white/10 backdrop-blur-2xl p-8 md:p-10 rounded-[3rem] border border-white/20 w-full max-w-2xl mb-12 relative z-10 shadow-2xl">
                    <h3 className="text-amber-500 font-black uppercase text-xs tracking-widest mb-8 text-center">Final Podium</h3>
                    <div className="space-y-4">
                        {participants.length === 0 ? (
                            <p className="text-white/50 italic text-center">No participants finished the battle.</p>
                        ) : (
                            participants.sort((a, b) => b.score - a.score).slice(0, 5).map((p, i) => {
                                const isWinner = i === 0;
                                return (
                                    <div key={p.socketId} className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all ${isWinner ? 'bg-amber-500/20 border-amber-500/50 scale-105 shadow-xl my-6' : 'bg-white/5 border-white/10'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${isWinner ? 'bg-amber-500 text-slate-900' : 'bg-white/10 text-white'}`}>
                                                {i + 1}
                                            </div>
                                            <span className={`font-black tracking-tight ${isWinner ? 'text-white text-xl' : 'text-indigo-100 text-lg'}`}>{p.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaBolt className={isWinner ? 'text-amber-400' : 'text-indigo-400'} />
                                            <span className={`font-black tracking-widest ${isWinner ? 'text-amber-400 text-xl' : 'text-indigo-300 text-lg'}`}>{p.score} PTS</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <Link to="/instructor/my-tests" className="bg-white text-indigo-950 px-12 py-5 rounded-full font-black text-xl hover:bg-amber-400 transition-all shadow-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] relative z-10 active:scale-95">
                    Return to Command Center
                </Link>
            </div>
        );
    }

    return null;
};

export default LiveSessionHost;
