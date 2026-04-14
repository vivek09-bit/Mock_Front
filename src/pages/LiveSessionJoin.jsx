import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { ThemeContext } from "../context/ThemeContext";
import { FaBolt, FaUser, FaLock, FaGamepad, FaChevronRight, FaChevronLeft, FaClipboardList, FaSpinner } from "react-icons/fa";
import LiveTest from "../components/tests/LiveTest";

const LiveSessionJoin = () => {
    const { testId: urlTestId } = useParams();
    const navigate = useNavigate();
    const { apiBase } = useContext(ThemeContext);

    // ── Core state ──────────────────────────────────────────────────────────
    const socketRef = useRef(null);
    const activeTestIdRef = useRef(urlTestId);  // keeps latest testId for socket emits

    const [joinStage, setJoinStage] = useState("pin");   // 'pin' → 'details' → done
    const [name, setName] = useState("");
    const [passcode, setPasscode] = useState("");
    const [studentDetails, setStudentDetails] = useState({});

    const [status, setStatus] = useState("entering");   // entering | waiting | playing | finished
    const [error, setError] = useState("");

    // Test metadata (fetched on mount)
    const [testInfo, setTestInfo] = useState(null);   // null = loading, false = failed, obj = data
    const [testFetched, setTestFetched] = useState(false);  // true once fetch settled

    // Game state
    const [gameState, setGameState] = useState({ currentQuestionIndex: -1, test: null });
    const [myAnswer, setMyAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // ── Fetch test metadata on mount ────────────────────────────────────────
    useEffect(() => {
        if (!urlTestId) { setTestFetched(true); return; }
        const fetchTest = async () => {
            try {
                const res = await fetch(`${apiBase}/api/instructor/public/test-info/${urlTestId}`);
                const data = await res.json();
                if (data.success) {
                    setTestInfo(data.test);
                    setGameState(prev => ({ ...prev, test: data.test }));
                } else {
                    setTestInfo(false);
                }
            } catch (err) {
                console.error("Error fetching live test info", err);
                setTestInfo(false);
            } finally {
                setTestFetched(true);
            }
        };
        fetchTest();
    }, [apiBase, urlTestId]);

    // ── Socket setup ────────────────────────────────────────────────────────
    useEffect(() => {
        const socketUrl = new URL(apiBase).origin;
        console.log(`[SOCKET_INIT] Creating Socket.io connection to: ${socketUrl}`);
        const socket = io(socketUrl, { transports: ["websocket", "polling"] });
        socketRef.current = socket;

        socket.on("connect", () => {
            console.log(`[SOCKET_CONNECTED] Socket ID: ${socket.id}, URL Test ID: ${urlTestId}`);
        });

        socket.on("connect_error", (error) => {
            console.error(`[SOCKET_ERROR] Connection failed:`, error);
        });

        socket.on("disconnect", (reason) => {
            console.warn(`[SOCKET_DISCONNECTED] Reason: ${reason}`);
        });

        socket.on("joined-success", ({ testId }) => {
            if (testId) activeTestIdRef.current = testId;
            setStatus("waiting");
            setError("");
        });

        socket.on("passcode-verified", ({ testId, testName, requiredFields }) => {
            activeTestIdRef.current = testId;
            setTestInfo({ name: testName, requiredStudentDetails: requiredFields });
            setTestFetched(true);

            if (requiredFields && requiredFields.length > 0) {
                setStudentDetails(prev => ({ ...prev, Name: name }));
                setJoinStage("details");
            } else {
                // If it was already triggered by handlePinSubmit, we emit join immediately!
                // Because state sets are async, we can just call emitJoin with the updated values.
                const finalName = name || "Guest";
                socketRef.current.emit("student-join-session", {
                    testId,
                    passcode: passcode.trim().toUpperCase(),
                    studentName: finalName,
                    studentDetails: { Name: finalName }
                });
            }
        });

        socket.on("test-started", ({ currentQuestionIndex }) => {
            setStatus("playing");
            setShowResult(false);
            setMyAnswer(null);
            setGameState(prev => ({ ...prev, currentQuestionIndex }));
        });

        socket.on("next-question", ({ currentQuestionIndex }) => {
            setShowResult(false);
            setMyAnswer(null);
            setGameState(prev => ({ ...prev, currentQuestionIndex }));
        });

        socket.on("answer-revealed", ({ responses, participants: updatedParticipants }) => {
            const myResponse = responses?.find(r => r.socketId === socket.id);
            setIsCorrect(!!myResponse?.isCorrect);
            const me = updatedParticipants?.find(p => p.socketId === socket.id);
            if (me) setGameState(prev => ({ ...prev, myScore: me.score }));
            setShowResult(true);
        });

        socket.on("session-ended", () => {
            setStatus("finished");
        });

        socket.on("kicked", () => {
            alert("You have been removed from the session by the host.");
            navigate("/dashboard");
        });

        socket.on("error", ({ message }) => {
            setError(message);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [apiBase, navigate]);

    // ── Derived ─────────────────────────────────────────────────────────────
    const requiredFields = testInfo?.requiredStudentDetails || [];

    // ── Emit join to socket ─────────────────────────────────────────────────
    const emitJoin = () => {
        // Security: Final validation before emit
        const sanitizedName = (studentDetails["Name"] || name || "Guest").trim().substring(0, 50);
        const sanitizedPasscode = passcode.trim().toUpperCase();

        if (!socketRef.current) {
            setError("⚠️ Connection error. Please refresh the page.");
            return;
        }

        if (!socketRef.current.connected) {
            setError("⚠️ Not connected to server. Please refresh and try again.");
            return;
        }

        const sanitizedDetails = {};
        for (const [key, value] of Object.entries(studentDetails)) {
            if (typeof value === 'string') {
                sanitizedDetails[key] = value.trim().substring(0, 100);
            }
        }

        socketRef.current.emit("student-join-session", {
            testId: activeTestIdRef.current,
            passcode: sanitizedPasscode,
            studentName: sanitizedName,
            studentDetails: { ...sanitizedDetails, Name: sanitizedName },
        });
    };

    // ── Stage 1: Validate Name + PIN ────────────────────────────────────────
    const handlePinSubmit = (e) => {
        e.preventDefault();
        setError("");

        // Security: Input validation
        const trimmedName = name.trim();
        const trimmedPasscode = passcode.trim().toUpperCase();

        // Validate name: alphanumeric + spaces only, length 2-50
        if (!trimmedName) {
            return setError("Please enter your display name.");
        }
        if (trimmedName.length < 2) {
            return setError("Name must be at least 2 characters long.");
        }
        if (trimmedName.length > 50) {
            return setError("Name must be less than 50 characters.");
        }
        if (!/^[a-zA-Z0-9\s\-']*$/.test(trimmedName)) {
            return setError("Name can only contain letters, numbers, spaces, hyphens, and apostrophes.");
        }

        // Validate passcode: alphanumeric only, length 4-6
        if (!trimmedPasscode) {
            return setError("Please enter the Game PIN.");
        }
        if (trimmedPasscode.length < 4 || trimmedPasscode.length > 6) {
            return setError("Game PIN must be 4-6 characters.");
        }
        if (!/^[A-Z0-9]*$/.test(trimmedPasscode)) {
            return setError("Game PIN can only contain letters and numbers.");
        }

        // If joined globally (no urlTestId), we verify passcode first
        if (!urlTestId) {
            setError("");
            setTestFetched(false); // trigger loading state
            if (socketRef.current) {
                socketRef.current.emit("verify-passcode", { passcode: trimmedPasscode });
            }
            return;
        }

        // Wait for fetch if still loading (for direct links)
        if (!testFetched) {
            setError("Loading session info... please try again in a moment.");
            return;
        }

        if (requiredFields.length > 0) {
            setStudentDetails(prev => ({ ...prev, Name: trimmedName }));
            setJoinStage("details");
        } else {
            emitJoin();
        }
    };

    // ── Stage 2: Validate required details ──────────────────────────────────
    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        setError("");

        // Security: Validate all required fields have content
        for (const field of requiredFields) {
            const value = studentDetails[field]?.trim();
            if (!value || value.length < 2) {
                return setError(`Please fill in a valid ${field} (at least 2 characters).`);
            }
            if (value.length > 100) {
                return setError(`${field} is too long (max 100 characters).`);
            }
        }

        emitJoin();
    };

    // ── Student answers a question ───────────────────────────────────────────
    const handleAnswer = (answer) => {
        if (myAnswer !== null) return;   // already answered
        setMyAnswer(answer);

        const socket = socketRef.current;
        const payload = { testId: activeTestIdRef.current, answer };

        console.log(`[STUDENT_ANSWER] Submitting answer`);
        console.log(`  - Answer: ${answer}`);
        console.log(`  - TestId: ${activeTestIdRef.current}`);
        console.log(`  - Socket connected: ${socket?.connected}`);
        console.log(`  - Socket ID: ${socket?.id}`);
        console.log(`  - Status: ${status}`);

        if (socket) {
            socket.emit("student-submit-answer", payload, (ackData) => {
                console.log(`[STUDENT_ANSWER] Server acknowledged:`, ackData);
            });
        } else {
            console.error(`[STUDENT_ERROR] Socket not available!`);
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // STATUS: entering (Stage 1 — PIN, Stage 2 — Details)
    // ════════════════════════════════════════════════════════════════════════
    if (status === "entering") {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#3730a3,#1e1b4b_60%,#0f172a)] flex items-center justify-center p-6">
                <div className="fixed bottom-10 left-10 w-64 h-64 bg-teal-400/10 rounded-full blur-[100px] -z-10 animate-pulse" />
                <div className="fixed top-20 right-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-[120px] -z-10" />

                <div className="max-w-md w-full bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 shadow-2xl">

                    {/* ── STAGE 1: Name + PIN ── */}
                    {joinStage === "pin" && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-teal-400 rounded-3xl mx-auto flex items-center justify-center text-indigo-950 text-3xl shadow-lg shadow-teal-400/30 mb-4">
                                    <FaGamepad />
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tight">Join Live Mock</h1>
                                <p className="text-indigo-200 font-medium text-sm mt-1">
                                    {testInfo?.name || (testFetched ? "Enter your name and the Game PIN" : "Loading session...")}
                                </p>
                                {/* Loading indicator */}
                                {!testFetched && (
                                    <div className="flex items-center justify-center gap-2 mt-2 text-indigo-300 text-xs">
                                        <FaSpinner className="animate-spin" /> Fetching session info...
                                    </div>
                                )}
                            </div>

                            {/* Progress dots — show when there are required fields */}
                            {testFetched && requiredFields.length > 0 && (
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <div className="w-8 h-2 rounded-full bg-teal-400" />
                                    <div className="w-8 h-2 rounded-full bg-white/20" />
                                </div>
                            )}

                            <form onSubmit={handlePinSubmit} className="space-y-4">
                                {/* Display Name */}
                                <div className="relative">
                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
                                    <input
                                        id="live-join-name"
                                        type="text"
                                        placeholder="Your Display Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoComplete="off"
                                        className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 pl-12 text-white placeholder-indigo-300 focus:ring-2 focus:ring-teal-400 outline-none transition-all font-bold"
                                    />
                                </div>

                                {/* Game PIN */}
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
                                    <input
                                        id="live-join-pin"
                                        type="text"
                                        placeholder="GAME PIN"
                                        value={passcode}
                                        onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                                        autoComplete="off"
                                        className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 pl-12 text-white placeholder-indigo-300 focus:ring-2 focus:ring-teal-400 outline-none transition-all font-black tracking-widest text-center uppercase"
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-2 px-4 rounded-xl border border-red-400/20">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-teal-400 text-indigo-950 py-4 rounded-2xl font-black text-lg hover:bg-teal-300 transition-all shadow-xl shadow-teal-900/40 flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {testFetched && requiredFields.length > 0 ? (
                                        <>Next <FaChevronRight /></>
                                    ) : (
                                        "Enter Arena"
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── STAGE 2: Required Student Details ── */}
                    {joinStage === "details" && (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-indigo-500 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl shadow-lg mb-3">
                                    <FaClipboardList />
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Student Details</h2>
                                <p className="text-indigo-200 text-sm mt-1">
                                    Your instructor needs a few more details.
                                </p>
                            </div>

                            {/* Progress dots */}
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <div className="w-8 h-2 rounded-full bg-white/30" />
                                <div className="w-8 h-2 rounded-full bg-teal-400" />
                            </div>

                            <form onSubmit={handleDetailsSubmit} className="space-y-4">
                                {requiredFields.map((field) => (
                                    <div key={field} className="relative">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
                                        <input
                                            id={`field-${field}`}
                                            type="text"
                                            placeholder={field}
                                            value={studentDetails[field] || ""}
                                            onChange={(e) =>
                                                setStudentDetails(prev => ({ ...prev, [field]: e.target.value }))
                                            }
                                            required
                                            className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 pl-12 text-white placeholder-indigo-300 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all text-sm font-bold"
                                        />
                                    </div>
                                ))}

                                {error && (
                                    <p className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-2 px-4 rounded-xl border border-red-400/20">
                                        {error}
                                    </p>
                                )}

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => { setJoinStage("pin"); setError(""); }}
                                        className="flex items-center gap-2 text-indigo-300 font-bold px-5 py-3 rounded-2xl hover:bg-white/10 transition-all text-sm"
                                    >
                                        <FaChevronLeft /> Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-teal-400 text-indigo-950 py-4 rounded-2xl font-black text-base hover:bg-teal-300 transition-all shadow-xl shadow-teal-900/40"
                                    >
                                        Enter Arena
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════════════
    // STATUS: waiting
    // ════════════════════════════════════════════════════════════════════════
    if (status === "waiting") {
        const displayName = studentDetails["Name"] || name;
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#3730a3,#1e1b4b_60%,#0f172a)] flex flex-col items-center justify-center p-6 space-y-8">
                <div className="relative">
                    <div className="w-32 h-32 border-4 border-teal-400/20 border-t-teal-400 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FaBolt className="text-4xl text-teal-400 animate-pulse" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black text-white tracking-tighter">You're In!</h2>
                    <p className="text-indigo-200 font-bold text-xl uppercase tracking-widest">{displayName}</p>
                </div>

                {gameState.test && (
                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 w-full max-w-sm">
                        <div className="flex flex-col items-center gap-2 mb-4">
                            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest bg-teal-400/10 px-3 py-1 rounded-full">
                                {gameState.test.category || "Live Test"}
                            </span>
                            <h3 className="text-2xl font-black text-white text-center">{gameState.test.name}</h3>
                        </div>
                        <div className="flex justify-around items-center border-t border-white/10 pt-4">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-indigo-300 uppercase">Duration</p>
                                <p className="text-white font-black">{gameState.test.duration || 30}m</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-indigo-300 uppercase">PIN</p>
                                <p className="text-teal-400 font-black tracking-widest">{passcode}</p>
                            </div>
                        </div>
                    </div>
                )}

                <p className="text-indigo-400 font-bold animate-pulse">Wait for the host to start the session…</p>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 max-w-sm text-center">
                    <p className="text-indigo-200 italic text-sm font-medium">
                        "Read the question carefully on the host's screen."
                    </p>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════════════
    // STATUS: playing
    // ════════════════════════════════════════════════════════════════════════
    if (status === "playing") {
        return (
            <div className="relative min-h-screen">
                <LiveTest
                    test={gameState.test}
                    currentQuestionIndex={gameState.currentQuestionIndex}
                    handleAnswerChange={handleAnswer}
                    answers={{}}
                    isHost={false}
                />

                {showResult && (
                    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-xl ${isCorrect ? "bg-green-600/90" : "bg-red-600/90"}`}>
                        <div className="bg-white p-12 rounded-[4rem] shadow-2xl flex flex-col items-center gap-8 transform rotate-3">
                            <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-6xl text-white shadow-xl ${isCorrect ? "bg-green-500 animate-bounce" : "bg-red-500"}`}>
                                {isCorrect ? "✓" : "✕"}
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className={`text-6xl font-black tracking-tighter ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                                    {isCorrect ? "Brilliant!" : "Not Quite!"}
                                </h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                                    {isCorrect ? "You got it right!" : "Better luck next question!"}
                                </p>
                            </div>
                            <div className="bg-slate-50 px-10 py-4 rounded-3xl border border-slate-100 flex flex-col items-center shadow-inner">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Score</span>
                                <span className="text-4xl font-black text-indigo-600 tracking-tight">{gameState.myScore || 0}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════════════
    // STATUS: finished
    // ════════════════════════════════════════════════════════════════════════
    if (status === "finished") {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#3730a3,#1e1b4b_60%,#0f172a)] flex flex-col items-center justify-center p-8 text-center">
                <div className="text-8xl mb-6">🏆</div>
                <h2 className="text-5xl font-black text-white tracking-tighter">Session Over!</h2>
                <p className="text-indigo-200 text-xl font-medium mt-4 mb-8">
                    Final Score: <span className="text-teal-400 font-black">{gameState.myScore || 0}</span> pts
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="bg-teal-400 text-indigo-950 px-10 py-4 rounded-2xl font-black text-lg hover:bg-teal-300 transition-all"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return null;
};

export default LiveSessionJoin;
