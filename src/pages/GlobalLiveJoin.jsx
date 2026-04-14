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
        test: null
    });

    useEffect(() => {
        const socket = io(apiBase.replace(/\/api\/?$/, ''), { transports: ["websocket", "polling"] });
        socketRef.current = socket;

        socket.on('passcode-verified', ({ testId, testName, requiredFields }) => {
            setTestId(testId);
            setTestInfo({ name: testName, requiredStudentDetails: requiredFields });
            setIsVerifying(false);

            if (requiredFields && requiredFields.length > 0) {
                setStudentDetails(prev => ({ ...prev, Name: name }));
                setJoinStage("details");
            } else {
                emitJoin(testId, name, passcode);
            }
        });

        socket.on('joined-success', ({ testId }) => {
            setTestId(testId);
            setStatus("waiting");
            setError("");
            
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
            setGameState(prev => ({ ...prev, currentQuestionIndex }));
        });

        socket.on('next-question', ({ currentQuestionIndex }) => {
            setGameState(prev => ({ ...prev, currentQuestionIndex }));
        });

        socket.on('kicked', () => {
            alert("Removed from session by host.");
            window.location.reload();
        });

        socket.on('error', ({ message }) => {
            setError(message);
            setIsVerifying(false);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [apiBase, name, passcode]);

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
        const currentQuestion = gameState.test?.questions[gameState.currentQuestionIndex];
        const isCorrect = currentQuestion?.correctAnswer?.includes(answer);
        console.log(`[SUBMIT_ANSWER] TestID: ${testId}, Answer: ${answer}`);
        if (socketRef.current) {
            socketRef.current.emit('student-submit-answer', { testId, answer, isCorrect });
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
        return (
            <LiveTest 
                test={gameState.test}
                currentQuestionIndex={gameState.currentQuestionIndex}
                handleAnswerChange={handleAnswer}
                answers={{}} 
                isHost={false}
            />
        );
    }

    return null;
};

export default GlobalLiveJoin;
