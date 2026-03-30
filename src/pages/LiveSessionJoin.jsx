import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { ThemeContext } from "../context/ThemeContext";
import { FaBolt, FaUser, FaLock, FaGamepad } from "react-icons/fa";
import LiveTest from "../components/tests/LiveTest";

let socket;

const LiveSessionJoin = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { apiBase } = useContext(ThemeContext);
    
    const [passcode, setPasscode] = useState("");
    const [name, setName] = useState("");
    const [status, setStatus] = useState("entering"); // entering, waiting, playing, finished
    const [error, setError] = useState("");
    
    // Game State
    const [gameState, setGameState] = useState({
        currentQuestionIndex: -1,
        test: null
    });

    useEffect(() => {
        socket = io(apiBase.replace('/api', '')); // Connect to root for sockets

        socket.on('joined-success', () => {
            setStatus("waiting");
            setError("");
        });

        socket.on('test-started', ({ currentQuestionIndex }) => {
            setStatus("playing");
            setGameState(prev => ({ ...prev, currentQuestionIndex }));
        });

        socket.on('next-question', ({ currentQuestionIndex }) => {
            setGameState(prev => ({ ...prev, currentQuestionIndex }));
        });

        socket.on('kicked', () => {
            alert("You have been removed from the session by the host.");
            navigate('/dashboard');
        });

        socket.on('error', ({ message }) => {
            setError(message);
        });

        return () => socket.disconnect();
    }, [apiBase, navigate]);

    useEffect(() => {
        // Fetch test data (metadata + questions)
        const fetchTest = async () => {
            try {
                const res = await fetch(`${apiBase}/api/instructor/public/test-info/${testId}`);
                const data = await res.json();
                if (data.success) {
                    setGameState(prev => ({ ...prev, test: data.test }));
                }
            } catch (err) {
                console.error("Error fetching live test info", err);
            }
        };
        fetchTest();
    }, [apiBase, testId]);

    const handleJoin = (e) => {
        e.preventDefault();
        if (!name || !passcode) return setError("Please enter your name and the session passcode.");
        socket.emit('student-join-session', { testId, passcode, studentName: name });
    };

    const handleAnswer = (answer) => {
        const currentQuestion = gameState.test?.questions[gameState.currentQuestionIndex];
        const isCorrect = currentQuestion?.correctAnswer?.includes(answer);
        socket.emit('student-submit-answer', { testId, answer, isCorrect });
    };

    if (status === "entering") {
        return (
            <div className="min-h-screen bg-indigo-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-800 via-indigo-900 to-slate-950">
                <div className="max-w-md w-full bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 shadow-2xl animate-fadeIn">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-teal-400 rounded-3xl mx-auto flex items-center justify-center text-indigo-950 text-3xl shadow-lg shadow-teal-400/20 mb-4">
                            <FaGamepad />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Join Live Mock</h1>
                        <p className="text-indigo-200 font-medium">Enter the passcode provided by your instructor</p>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-6">
                        <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" />
                            <input 
                                type="text"
                                placeholder="Your Display Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/10 border-transparent rounded-2xl p-4 pl-12 text-white placeholder-indigo-300 focus:ring-2 focus:ring-teal-400 outline-none transition-all font-bold"
                            />
                        </div>
                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" />
                            <input 
                                type="text"
                                placeholder="Session Passcode"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                className="w-full bg-white/10 border-transparent rounded-2xl p-4 pl-12 text-white placeholder-indigo-300 focus:ring-2 focus:ring-teal-400 outline-none transition-all font-bold tracking-widest uppercase text-center"
                            />
                        </div>

                        {error && <p className="text-red-400 text-xs font-bold text-center animate-pulse">{error}</p>}

                        <button 
                            type="submit"
                            className="w-full bg-teal-400 text-indigo-950 py-4 rounded-2xl font-black text-xl hover:bg-teal-300 transition-all shadow-xl shadow-teal-900/40 transform active:scale-[0.98]"
                        >
                            Enter Arena
                        </button>
                    </form>
                </div>
                <div className="fixed bottom-10 left-10 w-64 h-64 bg-teal-400/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
                <div className="fixed top-20 right-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-[120px] -z-10"></div>
            </div>
        );
    }

    if (status === "waiting") {
        return (
            <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center p-6 space-y-8 animate-fadeIn">
                <div className="relative">
                    <div className="w-32 h-32 border-4 border-teal-400/20 border-t-teal-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FaBolt className="text-4xl text-teal-400 animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black text-white tracking-tighter">You're In!</h2>
                    <p className="text-indigo-200 font-bold text-xl uppercase tracking-widest">{name}</p>
                </div>
                <p className="text-indigo-400 font-bold animate-pulse">Wait for the Host to start the battle...</p>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 max-w-sm text-center">
                    <p className="text-indigo-200 italic text-sm font-medium">"Top performers are those who read the question text carefully on the host's screen."</p>
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
                answers={{}} // Not used in live mode as we emit via handleAnswer
                isHost={false}
            />
        );
    }

    return null;
};

export default LiveSessionJoin;
