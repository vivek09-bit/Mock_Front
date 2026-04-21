import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { ThemeContext } from "../context/ThemeContext";
import { FaBolt, FaUser, FaLock, FaGamepad, FaPlay, FaChevronLeft, FaSpinner } from "react-icons/fa";
import LiveTest from "../components/tests/LiveTest";

const GlobalLiveJoin = () => {
    const navigate = useNavigate();
    const { apiBase } = useContext(ThemeContext);

    // ── Core State ──────────────────────────────────────────────────────────
    const socketRef = useRef(null);

    const [joinStage, setJoinStage] = useState("pin"); // 'pin' → 'details'
    const [passcode, setPasscode] = useState("");
    const [name, setName] = useState("");
    const [studentDetails, setStudentDetails] = useState({});

    const [status, setStatus] = useState("entering"); // entering, waiting, playing
    const [error, setError] = useState("");
    const [testId, setTestId] = useState(null);
    const [testInfo, setTestInfo] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const requiredFields = testInfo?.requiredStudentDetails || [];

    // Game State
    const [gameState, setGameState] = useState({
        currentQuestionIndex: -1,
        test: null,
        myScore: 0
    });
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");

    const nameRef = useRef(name);
    const passcodeRef = useRef(passcode);

    // Fullscreen and Security Logic
    const enterFullScreen = () => {
        const docElm = document.documentElement;
        if (docElm.requestFullscreen) docElm.requestFullscreen().catch((err) => console.error(err));
        else if (docElm.mozRequestFullScreen) docElm.mozRequestFullScreen();
        else if (docElm.webkitRequestFullScreen) docElm.webkitRequestFullScreen();
        else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();
    };

    const exitFullScreen = () => {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    };

    useEffect(() => {
        if (status !== "playing") return;

        enterFullScreen();
        setIsFullscreen(true);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitchCount((prev) => {
                    const newCount = prev + 1;
                    if (newCount > 2) {
                        alert("DISQUALIFIED: Excessive tab switching detected.");
                        localStorage.removeItem(`live_rejoin_${testId}`);
                        window.location.reload();
                    } else {
                        setWarningMessage(`BATTLE ALERT: Tab switch detected! [${newCount}/2] violations.`);
                    }
                    return newCount;
                });
            }
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        const handleContextMenu = (e) => e.preventDefault();

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [status, testId]);

    useEffect(() => {
        nameRef.current = name;
        passcodeRef.current = passcode;
    }, [name, passcode]);

    useEffect(() => {
        const socketUrl = new URL(apiBase).origin;
        const socket = io(socketUrl, { transports: ["websocket", "polling"] });
        socketRef.current = socket;

        socket.on('passcode-verified', ({ testId, testName, requiredFields }) => {
            setTestId(testId);
            setTestInfo({ name: testName, requiredStudentDetails: requiredFields });
            setIsVerifying(false);

            if (requiredFields && requiredFields.length > 0) {
                setStudentDetails(prev => ({ ...prev, Name: nameRef.current }));
                setJoinStage("details");
            } else {
                emitJoin(testId, nameRef.current, passcodeRef.current);
            }
        });

        socket.on('joined-success', ({ testId, rejoinKey }) => {
            setTestId(testId);
            setStatus("waiting");
            setError("");

            // Store for rejoin
            if (rejoinKey) {
                localStorage.setItem(`live_rejoin_${testId}`, JSON.stringify({
                    testId,
                    rejoinKey,
                    passcode: passcodeRef.current,
                    name: nameRef.current
                }));
            }

            // Fetch test data once we know the testId
            fetch(`${apiBase}/api/instructor/public/test-info/${testId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setGameState(prev => ({ ...prev, test: data.test }));
                    }
                });
        });

        socket.on('test-started', ({ currentQuestionIndex }) => {
            setStatus("playing");
            setShowResult(false);
            setGameState(prev => ({ ...prev, currentQuestionIndex }));
        });

        socket.on('next-question', ({ currentQuestionIndex }) => {
            setShowResult(false);
            setGameState(prev => ({ ...prev, currentQuestionIndex }));
        });

        socket.on('answer-revealed', ({ responses, participants }) => {
            const myResponse = responses?.find(r => r.socketId === socket.id);
            setIsCorrect(!!myResponse?.isCorrect);
            const me = participants?.find(p => p.socketId === socket.id);
            if (me) setGameState(prev => ({ ...prev, myScore: me.score }));
            setShowResult(true);
        });

        socket.on('session-ended', () => {
            setStatus("finished");
            localStorage.removeItem(`live_rejoin_${testId}`); // Cleanup
        });

        socket.on('rejoin-state', ({ status, currentQuestionIndex, myScore, test }) => {
            console.log("[STUDENT_REJOIN] Restoring state:", { status, myScore });
            setStatus(status);
            setGameState(prev => ({
                ...prev,
                currentQuestionIndex,
                myScore,
                test: test || prev.test
            }));
        });

        socket.on('kicked', () => {
            alert("Removed from session by host.");
            localStorage.removeItem(`live_rejoin_${testId}`);
            window.location.reload();
        });

        socket.on('error', ({ message }) => {
            setError(message);
            setIsVerifying(false);
        });

        // Auto-rejoin logic
        const tryRejoin = () => {
            // Since we don't know the exact testId yet, we scan localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('live_rejoin_')) {
                    try {
                        const saved = JSON.parse(localStorage.getItem(key));
                        console.log("[STUDENT] Found saved session, attempting rejoin...", saved);
                        setName(saved.name);
                        setPasscode(saved.passcode);
                        socket.emit('student-rejoin-session', {
                            testId: saved.testId,
                            rejoinKey: saved.rejoinKey
                        });
                        break;
                    } catch (e) {
                        console.error("Failed to parse saved session", e);
                    }
                }
            }
        };

        if (socket.connected) tryRejoin();
        else socket.once('connect', tryRejoin);

        return () => {
            if (socket) socket.disconnect();
        };
    }, [apiBase]);

    const emitJoin = (tid, sName, sPasscode) => {
        const finalName = studentDetails["Name"] || studentDetails["Full Name"] || sName || "Guest";
        const merged = { ...studentDetails, Name: finalName };
        if (socketRef.current) {
            socketRef.current.emit('student-join-session', {
                testId: tid,
                passcode: sPasscode.trim().toUpperCase(),
                studentName: finalName,
                studentDetails: merged
            });
        }
    };

    const handlePinSubmit = (e) => {
        e.preventDefault();
        setError("");
        if (!name.trim() || !passcode.trim()) return setError("Enter Name and Game PIN.");

        setIsVerifying(true);
        if (socketRef.current) {
            socketRef.current.emit("verify-passcode", { passcode: passcode.trim().toUpperCase() });
        }
    };

    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        setError("");
        for (const field of requiredFields) {
            if (!studentDetails[field]?.trim()) return setError(`Required: ${field}`);
        }
        emitJoin(testId, name, passcode);
    };

    const handleAnswer = (answer) => {
        if (!testId) return console.error("Missing testId for submission");
        console.log(`[SUBMIT_ANSWER] TestID: ${testId}, Answer: ${answer}`);
        if (socketRef.current) {
            socketRef.current.emit('student-submit-answer', { testId, answer });
        }
    };

    if (status === "entering") {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="max-w-md w-full relative z-10">
                    <div className="text-center mb-10 space-y-4">
                        <div className="w-24 h-24 bg-amber-500 rounded-[2.5rem] mx-auto flex items-center justify-center text-slate-950 text-4xl shadow-2xl shadow-amber-500/20 rotate-12 transition-transform hover:rotate-0 cursor-pointer">
                            <FaGamepad />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">BATTLE ARENA</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Enter Your Access PIN</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-3xl p-1 w-full rounded-[3.5rem] border border-white/10 shadow-2xl shadow-black">
                        {joinStage === "pin" ? (
                            <form onSubmit={handlePinSubmit} className="p-8 space-y-4 flex flex-col">
                                <div className="relative group">
                                    <FaUser className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="NICKNAME"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-[2rem] p-5 pl-14 text-white placeholder-slate-600 focus:border-amber-500 outline-none transition-all font-black text-lg uppercase"
                                    />
                                </div>
                                <div className="relative group">
                                    <FaLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="GAME PIN"
                                        maxLength={4}
                                        value={passcode}
                                        onChange={(e) => setPasscode(e.target.value)}
                                        className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-[2rem] p-5 pl-14 text-white placeholder-slate-600 focus:border-amber-500 outline-none transition-all font-black text-2xl tracking-[0.5em] uppercase text-center"
                                    />
                                </div>

                                {error && (
                                    <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center animate-shake mt-2">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isVerifying}
                                    className="w-full bg-amber-500 text-slate-950 py-5 rounded-[2rem] font-black text-2xl hover:bg-amber-400 disabled:bg-amber-500/50 transition-all shadow-xl shadow-amber-900/20 flex items-center justify-center gap-3 transform active:scale-95 mt-4"
                                >
                                    {isVerifying ? <FaSpinner className="animate-spin text-sm" /> : <FaPlay className="text-sm" />}
                                    {isVerifying ? "CONNECTING..." : "READY!"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleDetailsSubmit} className="p-8 space-y-4">
                                <button type="button" onClick={() => setJoinStage("pin")} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4">
                                    <FaChevronLeft /> Back
                                </button>

                                <p className="text-white font-black text-xl mb-6">REQUIRED INFO</p>

                                {requiredFields.map(field => (
                                    <div key={field} className="relative">
                                        <input
                                            type="text"
                                            placeholder={field.toUpperCase()}
                                            value={studentDetails[field] || ""}
                                            onChange={e => setStudentDetails({ ...studentDetails, [field]: e.target.value })}
                                            disabled={field.toLowerCase() === "name" || field.toLowerCase() === "full name"}
                                            className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-[1.5rem] p-4 text-white placeholder-slate-600 focus:border-amber-500 outline-none transition-all font-bold disabled:opacity-50"
                                        />
                                    </div>
                                ))}

                                {error && (
                                    <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center animate-shake mt-2">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-500 text-white py-5 rounded-[2rem] font-black text-2xl hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 transform active:scale-95 mt-4"
                                >
                                    <FaBolt className="text-sm" /> ENTER ARENA
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping shadow-[0_0_10px_2px_rgba(251,191,36,0.3)]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-ping delay-700 shadow-[0_0_10px_2px_rgba(251,191,36,0.3)]"></div>
            </div>
        );
    }

    if (status === "waiting") {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-10">
                <div className="relative">
                    <div className="w-40 h-40 border-8 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FaBolt className="text-5xl text-amber-500 animate-bounce" />
                    </div>
                </div>
                <div className="text-center space-y-4">
                    <p className="text-amber-500 font-extrabold text-sm uppercase tracking-[0.5em]">Warrior Locked In</p>
                    <h2 className="text-6xl font-black text-white tracking-tighter uppercase">{name}</h2>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-slate-400 font-bold animate-pulse text-sm">
                        Waiting for host to signal...
                    </div>
                </div>

                <div className="max-w-md bg-amber-500/5 p-8 rounded-[3rem] border border-amber-500/10 text-center backdrop-blur-sm">
                    <p className="text-amber-200/60 italic text-sm font-medium leading-relaxed">
                        "Speed is your ally. The faster you respond correctly, the higher you climb the ranks!"
                    </p>
                </div>
            </div>
        );
    }

    if (status === "playing") {
        if (!isFullscreen) {
            return (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
                    <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-5xl mb-8 animate-pulse shadow-[0_0_50px_rgba(239,68,68,0.4)]">
                        ⚠️
                    </div>
                    <h2 className="text-4xl font-black mb-4 tracking-tighter">ARENA INTERRUPTED</h2>
                    <p className="text-slate-400 max-w-md mb-10 font-medium">
                        Full-screen mode is mandatory to ensure a fair battle. Please return to the arena.
                    </p>
                    <button
                        onClick={() => {
                            enterFullScreen();
                            setIsFullscreen(true);
                            setWarningMessage("");
                        }}
                        className="bg-amber-500 text-slate-950 px-12 py-5 rounded-3xl font-black text-xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-900/20 active:scale-95"
                    >
                        RETURN TO BATTLE
                    </button>
                </div>
            );
        }

        return (
            <div className="relative min-h-screen">
                <LiveTest
                    test={gameState.test}
                    currentQuestionIndex={gameState.currentQuestionIndex}
                    handleAnswerChange={handleAnswer}
                    answers={{}}
                    isHost={false}
                />

                {warningMessage && (
                    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] animate-bounce">
                        <div className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl border-4 border-red-400 flex items-center gap-4">
                            <span>{warningMessage}</span>
                            <button
                                onClick={() => setWarningMessage("")}
                                className="bg-white/20 hover:bg-white/40 px-3 py-1 rounded-lg text-xs"
                            >
                                GOT IT
                            </button>
                        </div>
                    </div>
                )}

                {showResult && (
                    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-xl p-4 ${isCorrect ? "bg-green-600/90" : "bg-red-600/90"}`}>
                        <div className="bg-white p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] shadow-2xl flex flex-col items-center gap-6 md:gap-8 transform rotate-3 w-full max-w-sm">
                            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-5xl md:text-6xl text-white shadow-xl ${isCorrect ? "bg-green-500 animate-bounce" : "bg-red-500"}`}>
                                {isCorrect ? "✓" : "✕"}
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className={`text-5xl md:text-6xl font-black tracking-tighter ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                                    {isCorrect ? "Brilliant!" : "Not Quite!"}
                                </h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs md:text-sm">
                                    {isCorrect ? "You got it right!" : "Better luck next question!"}
                                </p>
                            </div>
                            <div className="bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100 flex flex-col items-center shadow-inner w-full">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Score</span>
                                <span className="text-4xl font-black text-indigo-600 tracking-tight">{gameState.myScore || 0}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (status === "finished") {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="text-8xl mb-6 z-10">🏆</div>
                <h2 className="text-5xl font-black text-white tracking-tighter z-10">Session Over!</h2>
                <p className="text-amber-200 text-xl font-medium mt-4 mb-8 z-10">
                    Final Score: <span className="text-amber-500 font-black">{gameState.myScore || 0}</span> pts
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="bg-amber-500 text-slate-950 px-10 py-4 rounded-2xl font-black text-lg hover:bg-amber-400 transition-all z-10"
                >
                    Return Home
                </button>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
            </div>
        );
    }

    return null;
};

export default GlobalLiveJoin;
