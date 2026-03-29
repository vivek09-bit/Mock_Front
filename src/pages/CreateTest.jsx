import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { FaPlus, FaTrash, FaMagic, FaCheckCircle, FaExclamationCircle, FaShieldAlt, FaTachometerAlt, FaGamepad, FaLock, FaChevronRight, FaChevronLeft } from "react-icons/fa";

const CreateTest = () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "ai" ? "ai" : "manual");
    const [currentStep, setCurrentStep] = useState(1); // 1: Settings, 2: Questions
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { apiBase } = useContext(ThemeContext);
    const navigate = useNavigate();

    // Test Metadata State
    const [testMetadata, setTestMetadata] = useState({
        name: "",
        category: "",
        examTarget: "",
        stage: "Practice",
        duration: 30,
        passingScore: 40,
        testType: "static",
        testModel: "premock", // Default to Premock (Half Protected)
        startTime: "",
        endTime: "",
        accessPasscode: "",
        requiredStudentDetails: []
    });

    // Manual Questions State
    const [questions, setQuestions] = useState([
        { subject: "", topic: "", question: { text: "" }, options: [{ key: "A", text: "" }, { key: "B", text: "" }, { key: "C", text: "" }, { key: "D", text: "" }], correctKey: "A", marks: 1, negativeMarks: 0 }
    ]);

    // AI Generation State
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [newDetailName, setNewDetailName] = useState(""); // State for dynamic student requirements

    const handleMetadataChange = (e) => setTestMetadata({ ...testMetadata, [e.target.name]: e.target.value });

    const handleAddQuestion = () => setQuestions([...questions, { 
        subject: testMetadata.examTarget || "General", 
        topic: testMetadata.category || "General", 
        question: { text: "" }, 
        options: [{ key: "A", text: "" }, { key: "B", text: "" }, { key: "C", text: "" }, { key: "D", text: "" }], 
        correctAnswer: ["A"], // Changed from correctKey to match backend
        marks: 1, 
        negativeMarks: 0 
    }]);

    const handleQuestionChange = (index, field, value) => {
        const updated = [...questions];
        if (field === 'text') {
            updated[index].question.text = value;
        } else if (field === 'correctAnswer') {
            updated[index].correctAnswer = [value]; // Ensure it stay as array
        } else {
            updated[index][field] = value;
        }
        setQuestions(updated);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex].text = value;
        setQuestions(updated);
    };

    const toggleStudentDetail = (detail) => {
        const current = [...testMetadata.requiredStudentDetails];
        if (current.includes(detail)) {
            setTestMetadata({ ...testMetadata, requiredStudentDetails: current.filter(d => d !== detail) });
        } else {
            setTestMetadata({ ...testMetadata, requiredStudentDetails: [...current, detail] });
        }
    };

    const handleAddCustomDetail = () => {
        if (!newDetailName.trim()) return;
        if (testMetadata.requiredStudentDetails.includes(newDetailName.trim())) {
            alert("This field is already added.");
            return;
        }
        setTestMetadata({ 
            ...testMetadata, 
            requiredStudentDetails: [...testMetadata.requiredStudentDetails, newDetailName.trim()] 
        });
        setNewDetailName("");
    };

    const handleCreateTest = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            const token = localStorage.getItem("authToken");
            
            // Map subject and topic to each question if they are missing
            const formattedQuestions = questions.map(q => ({
                ...q,
                subject: q.subject || testMetadata.examTarget || "General",
                topic: q.topic || testMetadata.category || "General",
                category: testMetadata.category ? [testMetadata.category] : ["General"], // Backend expects [String]
                examTarget: testMetadata.examTarget ? [testMetadata.examTarget] : ["General"], // Backend expects [String]
                correctAnswer: q.correctAnswer || ["A"] // Ensure array format
            }));

            await axios.post(`${apiBase}/api/instructor/create-test`, 
                { 
                    testData: testMetadata, 
                    questions: activeTab === 'manual' ? formattedQuestions : [] 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess("Test created successfully!");
            setTimeout(() => navigate("/instructor/my-tests"), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create test.");
        } finally {
            setLoading(false);
        }
    };

    const handleAiGenerate = () => {
        if (!aiPrompt) return alert("Please specify what topics or difficulty you want to generate.");
        setIsGenerating(true);
        // Simulate AI process
        setTimeout(() => {
            setIsGenerating(false);
            alert("AI Generation mock completed! We've simulated 5 questions for you.");
            // In a real implementation, we'd fill the 'questions' state with AI response
        }, 3000);
    };

    const nextStep = () => {
        if (!testMetadata.name || !testMetadata.category || !testMetadata.duration) {
            return setError("Please fill in basic test details (Name, Grade, Duration) before proceeding.");
        }
        setError("");
        setCurrentStep(2);
    };

    const prevStep = () => setCurrentStep(1);

    const testModels = [
        { id: 'live', name: 'Live (Kahoot)', icon: <FaGamepad />, desc: 'Real-time interactive assessment.' },
        { id: 'premock', name: 'Premock (Half)', icon: <FaShieldAlt />, desc: 'Basic protection and anti-cheat.' },
        { id: 'fullmock', name: 'Full Mock', icon: <FaLock />, desc: 'Strict proctoring (Camera, Full Screen).' }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-20">
            <header className="flex justify-between items-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {currentStep === 1 ? "Configure Assessment" : "Insertion Phase"}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {currentStep === 1 ? "Step 1: Define settings and security" : "Step 2: Add your questions or use AI"}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <div className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${currentStep === 1 ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>1. Settings</div>
                        <div className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${currentStep === 2 ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>2. Questions</div>
                    </div>
                </div>
            </header>

            {success && (
                <div className="p-4 bg-teal-50 border border-teal-500/50 rounded-xl text-teal-700 flex items-center gap-3 animate-slideDown">
                    <FaCheckCircle className="text-xl" /> {success}
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 border border-red-500/50 rounded-xl text-red-700 flex items-center gap-3 animate-slideDown">
                    <FaExclamationCircle className="text-xl" /> {error}
                </div>
            )}

            {currentStep === 1 ? (
                /* STEP 1: CONFIGURATION */
                <div className="space-y-8 animate-slideRight">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* TEST MODELS */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <FaTachometerAlt className="text-indigo-500" /> Select Test Model
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {testModels.map(model => (
                                        <button 
                                            key={model.id}
                                            onClick={() => setTestMetadata({...testMetadata, testModel: model.id})}
                                            className={`p-4 rounded-xl border-2 text-left transition-all group ${testMetadata.testModel === model.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${testMetadata.testModel === model.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 group-hover:text-indigo-500'}`}>
                                                    {model.icon}
                                                </div>
                                                <span className={`font-bold ${testMetadata.testModel === model.id ? 'text-indigo-900' : 'text-slate-700'}`}>{model.name}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{model.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* BASIC INFO */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                                <h3 className="font-bold text-slate-800 mb-2">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 text-field">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Test Name</label>
                                        <input type="text" name="name" value={testMetadata.name} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Modern History Prelims" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Grade / Domain</label>
                                        <input type="text" name="category" value={testMetadata.category} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Class 10, UPSC" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject / Exam</label>
                                        <input type="text" name="examTarget" value={testMetadata.examTarget} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Physics, Law" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration (min)</label>
                                        <input type="number" name="duration" value={testMetadata.duration} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Passing Grade (%)</label>
                                        <input type="number" name="passingScore" value={testMetadata.passingScore} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* TIMING */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                                <h3 className="font-bold text-slate-800 text-sm">Scheduling</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Window</label>
                                        <input type="datetime-local" name="startTime" value={testMetadata.startTime} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Window</label>
                                        <input type="datetime-local" name="endTime" value={testMetadata.endTime} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* ACCESS & SECURITY */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                                <h3 className="font-bold text-slate-800 text-sm">Security</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Access Passcode</label>
                                        <input type="text" name="accessPasscode" value={testMetadata.accessPasscode} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Optional password" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Student Info</label>
                                        <div className="space-y-3 pt-2">
                                            <div className="flex flex-wrap gap-2">
                                                {testMetadata.requiredStudentDetails.map(detail => (
                                                    <div key={detail} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-[10px] font-bold border border-indigo-100">
                                                        {detail}
                                                        <button onClick={() => toggleStudentDetail(detail)} className="hover:text-red-500"><FaTrash size={8} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input type="text" value={newDetailName} onChange={(e) => setNewDetailName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomDetail())} placeholder="e.g. Roll No" className="flex-1 bg-slate-50 border-transparent rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
                                                <button onClick={handleAddCustomDetail} className="bg-indigo-600 text-white p-2 rounded-lg"><FaPlus size={10} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={nextStep}
                            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                        >
                            Next: Add Questions <FaChevronRight />
                        </button>
                    </div>
                </div>
            ) : (
                /* STEP 2: QUESTIONS (CONTENT) */
                <div className="space-y-8 animate-slideLeft">
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <button onClick={prevStep} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors">
                            <FaChevronLeft /> Back to Settings
                        </button>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button onClick={() => setActiveTab('manual')} className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'manual' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Manual Entry</button>
                            <button onClick={() => setActiveTab('ai')} className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'ai' ? 'bg-indigo-600 shadow-sm text-white' : 'text-slate-500'}`}><FaMagic className="inline mr-2" /> AI Generator</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            {activeTab === 'manual' ? (
                                <div className="space-y-6">
                                    {questions.map((q, qIdx) => (
                                        <div key={qIdx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative group animate-slideRight">
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase">Question {qIdx + 1}</span>
                                                <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))} className="text-slate-300 hover:text-red-500 transition-colors"><FaTrash /></button>
                                            </div>
                                            <div className="space-y-4">
                                                <textarea value={q.question.text} onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)} className="w-full bg-slate-50 border-transparent rounded-xl p-4 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]" placeholder="Enter question..." />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={opt.key} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${q.correctKey === opt.key ? 'border-teal-500 bg-teal-50/30' : 'border-slate-50 bg-slate-50/50'}`}>
                                                            <button onClick={() => handleQuestionChange(qIdx, 'correctAnswer', opt.key)} className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${q.correctAnswer?.includes(opt.key) ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{opt.key}</button>
                                                            <input type="text" value={opt.text} onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)} className="bg-transparent border-none text-sm outline-none flex-1 font-medium text-slate-700" placeholder={`Option ${opt.key}`} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={handleAddQuestion} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-400 hover:text-indigo-400 transition-all flex items-center justify-center gap-3 bg-white"><FaPlus /> Add Question</button>
                                </div>
                            ) : (
                                <div className="bg-indigo-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                                     <div className="relative z-10 space-y-8">
                                        <div className="text-center">
                                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4 ${isGenerating ? 'animate-pulse' : ''}`}><FaMagic className="text-2xl text-teal-400" /></div>
                                            <h3 className="text-2xl font-bold">Autonomous Generation</h3>
                                            <p className="text-indigo-200 text-sm mt-2">Our AI crafts balanced mocks based on your prompts.</p>
                                        </div>
                                        <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-2xl p-6 text-white placeholder-indigo-300 focus:ring-2 focus:ring-teal-400 outline-none min-h-[150px] text-sm" placeholder="e.g. Generate 5 history questions on Industrial Revolution..." />
                                        <button onClick={handleAiGenerate} disabled={isGenerating} className="w-full bg-teal-400 text-indigo-950 py-4 rounded-xl font-bold hover:bg-teal-300 transition-all shadow-xl shadow-teal-900/40 flex items-center justify-center gap-3">
                                            {isGenerating ? "Synthesizing content..." : "Generate Professional Test"}
                                        </button>
                                    </div>
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-[80px]"></div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-8 space-y-6">
                                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <FaCheckCircle className="text-teal-500" /> Ready to Launch?
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-slate-400">Model:</span>
                                        <span className="text-indigo-600 font-bold uppercase">{testMetadata.testModel}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-slate-400">Questions:</span>
                                        <span className="text-slate-700 font-bold">{questions.length}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-slate-400">Duration:</span>
                                        <span className="text-slate-700 font-bold">{testMetadata.duration} min</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleCreateTest}
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                                >
                                    {loading ? "Constructing..." : "Finalize & Publish"}
                                </button>
                                <p className="text-[10px] text-slate-400 text-center font-medium">Tests are private drafts until you share the public link.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateTest;
