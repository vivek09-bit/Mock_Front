import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { FaPlus, FaTrash, FaMagic, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const CreateTest = () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "ai" ? "ai" : "manual");
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
        startTime: "",
        endTime: "",
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

    const handleAddQuestion = () => setQuestions([...questions, { subject: "", topic: "", question: { text: "" }, options: [{ key: "A", text: "" }, { key: "B", text: "" }, { key: "C", text: "" }, { key: "D", text: "" }], correctKey: "A", marks: 1, negativeMarks: 0 }]);

    const handleQuestionChange = (index, field, value) => {
        const updated = [...questions];
        if (field === 'text') updated[index].question.text = value;
        else updated[index][field] = value;
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
            await axios.post(`${apiBase}/api/instructor/create-test`, 
                { testData: testMetadata, questions: activeTab === 'manual' ? questions : [] },
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

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-20">
            <header className="flex justify-between items-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Assessment</h1>
                    <p className="text-slate-500 font-medium">Define your test structure and question set</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('manual')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'manual' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Manual Entry
                    </button>
                    <button 
                        onClick={() => setActiveTab('ai')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'ai' ? 'bg-indigo-600 shadow-sm text-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FaMagic className="inline mr-2" /> AI Generator
                    </button>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SETTINGS SIDEBAR */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <h2 className="font-bold text-slate-800 border-b pb-4">Test Settings</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Test Name</label>
                                <input type="text" name="name" value={testMetadata.name} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Modern History Prelims" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Grade / Domain</label>
                                <input type="text" name="category" value={testMetadata.category} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Class 10, UPSC, Personal" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject / Exam</label>
                                <input type="text" name="examTarget" value={testMetadata.examTarget} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Physics, History, Mental Ability" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration (min)</label>
                                    <input type="number" name="duration" value={testMetadata.duration} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Passing Grade</label>
                                    <input type="number" name="passingScore" value={testMetadata.passingScore} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <h2 className="font-bold text-slate-800 border-b pb-4 text-sm">Schedule & Entry</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Time (Optional)</label>
                                <input type="datetime-local" name="startTime" value={testMetadata.startTime} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Time (Optional)</label>
                                <input type="datetime-local" name="endTime" value={testMetadata.endTime} onChange={handleMetadataChange} className="w-full bg-slate-50 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Student Info</label>
                                
                                <div className="space-y-4 pt-2">
                                    {/* Selected Fields as Chips */}
                                    <div className="flex flex-wrap gap-2">
                                        {testMetadata.requiredStudentDetails.map(detail => (
                                            <div key={detail} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100 animate-scaleIn">
                                                {detail}
                                                <button onClick={() => toggleStudentDetail(detail)} className="text-indigo-400 hover:text-red-500 transition-colors">
                                                    <FaTrash size={10} />
                                                </button>
                                            </div>
                                        ))}
                                        {testMetadata.requiredStudentDetails.length === 0 && (
                                            <p className="text-slate-400 text-xs italic">No requirements added yet</p>
                                        )}
                                    </div>

                                    {/* Add New Input similar to Google Forms */}
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={newDetailName}
                                            onChange={(e) => setNewDetailName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomDetail())}
                                            placeholder="Add custom field (e.g. Roll No)"
                                            className="flex-1 bg-slate-50 border-transparent rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                        <button 
                                            onClick={handleAddCustomDetail}
                                            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>

                                    {/* Suggestions */}
                                    <div className="pt-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Suggested</p>
                                        <div className="flex flex-wrap gap-2">
                                            {["Full Name", "Roll Number", "Batch", "Email", "Phone"].map(s => (
                                                !testMetadata.requiredStudentDetails.includes(s) && (
                                                    <button 
                                                        key={s} 
                                                        onClick={() => toggleStudentDetail(s)}
                                                        className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded hover:bg-indigo-100 hover:text-indigo-600 transition-all"
                                                    >
                                                        + {s}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN EDITOR AREA */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'manual' ? (
                        <div className="space-y-6">
                             {questions.map((q, qIdx) => (
                                <div key={qIdx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative group animate-slideRight">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase">Question {qIdx + 1}</span>
                                        <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))} className="text-slate-300 hover:text-red-500 transition-colors"><FaTrash /></button>
                                    </div>
                                    <div className="space-y-4">
                                        <textarea 
                                            value={q.question.text} 
                                            onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)}
                                            className="w-full bg-slate-50 border-transparent rounded-xl p-4 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] transition-all"
                                            placeholder="Enter your question here..."
                                        />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={opt.key} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${q.correctKey === opt.key ? 'border-teal-500 bg-teal-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                                                    <button 
                                                        onClick={() => handleQuestionChange(qIdx, 'correctKey', opt.key)}
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${q.correctKey === opt.key ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-500'}`}
                                                    >
                                                        {opt.key}
                                                    </button>
                                                    <input 
                                                        type="text" 
                                                        value={opt.text} 
                                                        onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                                        className="bg-transparent border-none p-1 text-sm outline-none flex-1 font-medium text-slate-700"
                                                        placeholder={`Option ${opt.key}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                             ))}
                             
                             <button 
                                onClick={handleAddQuestion}
                                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-400 hover:text-indigo-400 transition-all flex items-center justify-center gap-3 bg-white"
                             >
                                <FaPlus /> Add Another Question
                             </button>

                             <div className="pt-6">
                                <button 
                                    onClick={handleCreateTest}
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                                >
                                    {loading ? "Publishing Assessment..." : "Publish Test Now"}
                                </button>
                             </div>
                        </div>
                    ) : (
                        <div className="bg-indigo-900 rounded-2xl p-10 text-white shadow-2xl relative overflow-hidden animate-slideUp">
                            <div className="relative z-10 max-w-xl mx-auto text-center space-y-8">
                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-4 ${isGenerating ? 'animate-pulse' : ''}`}>
                                    <FaMagic className="text-3xl" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold mb-4">Autonomous Generation</h2>
                                    <p className="text-indigo-200 font-medium leading-relaxed">
                                        Describe what you need: the subjects, topics, difficulty levels, and number of questions. Our AI engine will craft a balanced mock test for you.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <textarea 
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder-indigo-300 focus:ring-2 focus:ring-teal-400 outline-none min-h-[160px] text-lg leading-relaxed shadow-inner"
                                        placeholder="Generate a UPSC mock test centered on 18th-century Indian history, easy difficulty, 10 questions..."
                                    />
                                    <button 
                                        onClick={handleAiGenerate}
                                        disabled={isGenerating}
                                        className="w-full bg-teal-400 text-indigo-950 py-5 rounded-2xl font-bold text-lg hover:bg-teal-300 transition-all shadow-xl shadow-teal-900/40 flex items-center justify-center gap-3"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="w-5 h-5 border-4 border-indigo-950/30 border-t-indigo-950 rounded-full animate-spin"></div>
                                                Synthesizing Data...
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus /> Generate Professional Test
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Decorative background for AI tab */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateTest;
