import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { ThemeContext } from "../context/ThemeContext";
import { FaBolt, FaUser, FaLock, FaGamepad, FaPlay } from "react-icons/fa";
import LiveTest from "../components/tests/LiveTest";

let socket;

const GlobalLiveJoin = () => {
    const navigate = useNavigate();
    const { apiBase } = useContext(ThemeContext);
    
    const [passcode, setPasscode] = useState("");
    const [name, setName] = useState("");
    const [status, setStatus] = useState("entering"); // entering, waiting, playing
    const [error, setError] = useState("");
    const [testId, setTestId] = useState(null);
    
    // Game State
    const [gameState, setGameState] = useState({
        currentQuestionIndex: -1,
        test: null
    });

    useEffect(() => {
        socket = io(apiBase.replace('/api', ''));

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
        });

        return () => socket.disconnect();
    }, [apiBase]);

    const handleJoin = (e) => {
        e.preventDefault();
        if (!name || !passcode) return setError("Enter credentials.");
        socket.emit('student-join-session', { passcode: passcode.toUpperCase(), studentName: name });
    };

    const handleAnswer = (answer) => {
        if (!testId) return console.error("Missing testId for submission");
        const currentQuestion = gameState.test?.questions[gameState.currentQuestionIndex];
        const isCorrect = currentQuestion?.correctAnswer?.includes(answer);
        console.log(`[SUBMIT_ANSWER] TestID: ${testId}, Answer: ${answer}`);
        socket.emit('student-submit-answer', { testId, answer, isCorrect });
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
                        <form onSubmit={handleJoin} className="p-8 space-y-4">
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
                                <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center animate-shake">
                                    {error}
                                </div>
                            )}

                            <button 
                                type="submit"
                                className="w-full bg-amber-500 text-slate-950 py-5 rounded-[2rem] font-black text-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-900/20 flex items-center justify-center gap-3 transform active:scale-95 mt-4"
                            >
                                <FaPlay className="text-sm" /> READY!
                            </button>
                        </form>
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
