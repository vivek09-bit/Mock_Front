import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import {
  FaPlus, FaTrash, FaMagic, FaCheckCircle, FaExclamationCircle,
  FaShieldAlt, FaTachometerAlt, FaGamepad, FaLock, FaChevronRight,
  FaChevronLeft, FaCalendarAlt, FaUserCheck, FaInfoCircle, FaEye
} from "react-icons/fa";

// ─── Helper ──────────────────────────────────────────────────────────────────
const getSections = (model) =>
  model === "live"
    ? ["Basic Information", "Required Student Info"]
    : ["Basic Information", "Scheduling", "Security"];

const SECTION_ICONS = {
  "Basic Information":   <FaInfoCircle />,
  "Scheduling":          <FaCalendarAlt />,
  "Security":            <FaLock />,
  "Required Student Info": <FaUserCheck />,
};

const PRESET_FIELDS = ["Name", "Email", "Roll No", "Batch", "Phone", "Class"];

// ─── Component ───────────────────────────────────────────────────────────────
const CreateTest = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab]       = useState(searchParams.get("tab") === "ai" ? "ai" : "manual");
  const [currentStep, setCurrentStep]   = useState(1);          // 1 = Config, 2 = Questions
  const [activeSection, setActiveSection] = useState("Basic Information");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const { apiBase } = useContext(ThemeContext);
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [testMetadata, setTestMetadata] = useState({
    name: "",
    category: "",
    examTarget: "",
    stage: "Practice",
    duration: 30,
    passingScore: 40,
    testType: "static",
    testModel: "premock",
    startTime: "",
    endTime: "",
    accessPasscode: "",
    requiredStudentDetails: [],
    tokenCostAttempt: 0,
    tokenCostPermanent: 0,
  });

  const [questions, setQuestions] = useState([{
    subject: "", topic: "",
    question: { text: "" },
    options: [{ key: "A", text: "" }, { key: "B", text: "" }, { key: "C", text: "" }, { key: "D", text: "" }],
    correctAnswer: ["A"], marks: 1, negativeMarks: 0,
  }]);

  const [aiPrompt, setAiPrompt]       = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [newDetailName, setNewDetailName] = useState("");

  // ── Derived ────────────────────────────────────────────────────────────────
  const sections = getSections(testMetadata.testModel);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleModelChange = (modelId) => {
    const firstSection = getSections(modelId)[0];
    setTestMetadata({ ...testMetadata, testModel: modelId });
    setActiveSection(firstSection);
  };

  const handleMetadataChange = (e) =>
    setTestMetadata({ ...testMetadata, [e.target.name]: e.target.value });

  const toggleStudentDetail = (detail) => {
    const list = testMetadata.requiredStudentDetails;
    setTestMetadata({
      ...testMetadata,
      requiredStudentDetails: list.includes(detail)
        ? list.filter((d) => d !== detail)
        : [...list, detail],
    });
  };

  const handleAddCustomDetail = () => {
    const trimmed = newDetailName.trim();
    if (!trimmed) return;
    if (testMetadata.requiredStudentDetails.includes(trimmed)) {
      alert("Field already added.");
      return;
    }
    setTestMetadata({
      ...testMetadata,
      requiredStudentDetails: [...testMetadata.requiredStudentDetails, trimmed],
    });
    setNewDetailName("");
  };

  const handleAddQuestion = () =>
    setQuestions([...questions, {
      subject: testMetadata.examTarget || "General",
      topic: testMetadata.category || "General",
      question: { text: "" },
      options: [{ key: "A", text: "" }, { key: "B", text: "" }, { key: "C", text: "" }, { key: "D", text: "" }],
      correctAnswer: ["A"], marks: 1, negativeMarks: 0,
    }]);

  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    if (field === "text") updated[idx].question.text = value;
    else if (field === "correctAnswer") updated[idx].correctAnswer = [value];
    else updated[idx][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx].text = value;
    setQuestions(updated);
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const formattedQuestions = questions.map((q) => ({
        ...q,
        subject: q.subject || testMetadata.examTarget || "General",
        topic: q.topic || testMetadata.category || "General",
        category: testMetadata.category ? [testMetadata.category] : ["General"],
        examTarget: testMetadata.examTarget ? [testMetadata.examTarget] : ["General"],
        correctAnswer: q.correctAnswer || ["A"],
      }));
      await axios.post(
        `${apiBase}/api/instructor/create-test`,
        { testData: testMetadata, questions: activeTab === "manual" ? formattedQuestions : [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Test created successfully! Redirecting...");
      setTimeout(() => navigate("/instructor/my-tests"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create test.");
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = () => {
    if (!aiPrompt) return alert("Please describe what you want to generate.");
    setIsGenerating(true);
    setTimeout(() => { setIsGenerating(false); alert("AI simulation complete!"); }, 3000);
  };

  const nextSection = () => {
    const idx = sections.indexOf(activeSection);
    if (idx < sections.length - 1) setActiveSection(sections[idx + 1]);
  };

  const prevSection = () => {
    const idx = sections.indexOf(activeSection);
    if (idx > 0) setActiveSection(sections[idx - 1]);
  };

  const goToQuestions = () => {
    if (!testMetadata.name || !testMetadata.category || !testMetadata.duration)
      return setError("Please fill in: Test Name, Grade/Domain, and Duration.");
    setError("");
    setCurrentStep(2);
  };

  const testModels = [
    { id: "live",     name: "Live (Kahoot)", icon: <FaGamepad />,    desc: "Real-time interactive Kahoot-style session." },
    { id: "premock",  name: "Premock",       icon: <FaShieldAlt />,  desc: "Scheduled test with basic protection." },
    { id: "fullmock", name: "Full Mock",     icon: <FaLock />,       desc: "Strict proctoring with full-screen lock." },
  ];

  const sectionIdx = sections.indexOf(activeSection);
  const isLastSection = sectionIdx === sections.length - 1;
  const isFirstSection = sectionIdx === 0;

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-20">

      {/* ── Global Header ── */}
      <header className="flex justify-between items-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {currentStep === 1 ? "Configure Assessment" : "Add Questions"}
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {currentStep === 1
              ? "Step 1 of 2 — Define your test settings"
              : "Step 2 of 2 — Add questions manually or via AI"}
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {["Settings", "Questions"].map((label, i) => (
            <div key={label} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${currentStep === i + 1 ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"}`}>
              {i + 1}. {label}
            </div>
          ))}
        </div>
      </header>

      {/* ── Alerts ── */}
      {success && (
        <div className="p-4 bg-teal-50 border border-teal-400/40 rounded-xl text-teal-700 flex items-center gap-3">
          <FaCheckCircle className="text-xl text-teal-500" /> {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-400/40 rounded-xl text-red-700 flex items-center gap-3">
          <FaExclamationCircle className="text-xl text-red-500" /> {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 1 — CONFIGURATION
      ══════════════════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="space-y-6">

          {/* Model Selector */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
              <FaTachometerAlt className="text-indigo-500" /> Select Test Model
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {testModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelChange(model.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all group ${
                    testMetadata.testModel === model.id
                      ? "border-indigo-500 bg-indigo-50/60 shadow-sm shadow-indigo-100"
                      : "border-slate-100 bg-slate-50/60 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-base ${
                      testMetadata.testModel === model.id
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-400 group-hover:text-indigo-400"
                    }`}>
                      {model.icon}
                    </div>
                    <span className={`font-bold text-sm ${testMetadata.testModel === model.id ? "text-indigo-900" : "text-slate-700"}`}>
                      {model.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{model.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section Tabs Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

            {/* Tab Bar */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              {sections.map((section, idx) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 flex-1 justify-center ${
                    activeSection === section
                      ? "border-indigo-600 text-indigo-600 bg-white"
                      : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-white/60"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    activeSection === section ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="hidden sm:inline">{SECTION_ICONS[section]}</span>
                  <span>{section}</span>
                </button>
              ))}
            </div>

            {/* Section Content */}
            <div className="p-8">

              {/* ── BASIC INFORMATION ── */}
              {activeSection === "Basic Information" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Test Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" name="name" value={testMetadata.name}
                      onChange={handleMetadataChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Modern History Prelims 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Grade / Domain <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" name="category" value={testMetadata.category}
                      onChange={handleMetadataChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Class 10, UPSC, Engineering"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Subject / Exam</label>
                    <input
                      type="text" name="examTarget" value={testMetadata.examTarget}
                      onChange={handleMetadataChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Physics, Mathematics, GK"
                    />
                  </div>
                  {testMetadata.testModel !== "live" && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Duration (minutes) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number" name="duration" value={testMetadata.duration}
                          onChange={handleMetadataChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Passing Grade (%)</label>
                        <input
                          type="number" name="passingScore" value={testMetadata.passingScore}
                          onChange={handleMetadataChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cost Per Attempt (Tokens)</label>
                        <input
                          type="number" min="0" name="tokenCostAttempt" value={testMetadata.tokenCostAttempt}
                          onChange={handleMetadataChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cost For Permanent Unlock (Tokens)</label>
                        <input
                          type="number" min="0" name="tokenCostPermanent" value={testMetadata.tokenCostPermanent}
                          onChange={handleMetadataChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── SCHEDULING (premock / fullmock) ── */}
              {activeSection === "Scheduling" && (
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs text-amber-700 font-semibold">
                      📅 Set a window during which students can access and start the test. Leave empty for open access.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Start Window</label>
                      <input
                        type="datetime-local" name="startTime" value={testMetadata.startTime}
                        onChange={handleMetadataChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <p className="text-[11px] text-slate-400 mt-2">When students can start.</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">End Window</label>
                      <input
                        type="datetime-local" name="endTime" value={testMetadata.endTime}
                        onChange={handleMetadataChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <p className="text-[11px] text-slate-400 mt-2">After this, the test locks automatically.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SECURITY (premock / fullmock) ── */}
              {activeSection === "Security" && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Access Passcode</label>
                    <input
                      type="text" name="accessPasscode" value={testMetadata.accessPasscode}
                      onChange={handleMetadataChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none max-w-sm"
                      placeholder="Optional — leave blank for public access"
                    />
                    <p className="text-[11px] text-slate-400 mt-2">Students will need to enter this before starting.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Required Student Info</label>
                    <p className="text-xs text-slate-500 mb-4">Fields students must fill before taking the test.</p>

                    {/* Preset toggles */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {PRESET_FIELDS.map((field) => (
                        <button
                          key={field}
                          onClick={() => toggleStudentDetail(field)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            testMetadata.requiredStudentDetails.includes(field)
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
                          }`}
                        >
                          {field}
                        </button>
                      ))}
                    </div>

                    {/* Custom add */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text" value={newDetailName}
                        onChange={(e) => setNewDetailName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomDetail())}
                        placeholder="Add custom field (e.g. Batch)"
                        className="flex-1 max-w-xs bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button onClick={handleAddCustomDetail} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all">
                        <FaPlus size={10} /> Add
                      </button>
                    </div>

                    {testMetadata.requiredStudentDetails.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Selected Fields:</p>
                        <div className="flex flex-wrap gap-2">
                          {testMetadata.requiredStudentDetails.map((detail) => (
                            <div key={detail} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100">
                              {detail}
                              <button onClick={() => toggleStudentDetail(detail)} className="hover:text-red-500 transition-colors">
                                <FaTrash size={8} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── REQUIRED STUDENT INFO (live only) ── */}
              {activeSection === "Required Student Info" && (
                <div className="space-y-6">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3">
                    <FaGamepad className="text-indigo-500 text-lg mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-indigo-800">Live Session Flow</p>
                      <p className="text-xs text-indigo-600 mt-1">
                        Students will first enter their <strong>Name + Game PIN</strong>. 
                        If you add fields below, they'll see a second form to fill before entering the lobby.
                        All data is stored in the database when the session ends.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Additional Required Fields</label>
                    <p className="text-xs text-slate-500 mb-4">Select what extra information students must provide beyond Name + PIN.</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {PRESET_FIELDS.map((field) => (
                        <button
                          key={field}
                          onClick={() => toggleStudentDetail(field)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            testMetadata.requiredStudentDetails.includes(field)
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
                          }`}
                        >
                          {field}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 mb-6">
                      <input
                        type="text" value={newDetailName}
                        onChange={(e) => setNewDetailName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomDetail())}
                        placeholder="Custom field (e.g. Roll No)"
                        className="flex-1 max-w-xs bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button onClick={handleAddCustomDetail} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all">
                        <FaPlus size={10} /> Add
                      </button>
                    </div>

                    {/* Live Preview */}
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FaEye /> Student Join Screen Preview
                      </p>
                      <div className="bg-slate-900 rounded-2xl p-6 space-y-3 max-w-sm">
                        <div className="text-center mb-4">
                          <div className="w-10 h-10 bg-teal-400 rounded-xl mx-auto flex items-center justify-center text-indigo-950 text-lg mb-2">
                            <FaGamepad />
                          </div>
                          <p className="text-white font-black text-sm">Join Live Mock</p>
                        </div>
                        {/* Always-present fields */}
                        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
                          <span className="text-indigo-300 text-xs">👤</span>
                          <span className="text-white/60 text-xs">Display Name</span>
                          <span className="ml-auto text-teal-400 text-[10px] font-bold">REQUIRED</span>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
                          <span className="text-indigo-300 text-xs">🔑</span>
                          <span className="text-white/60 text-xs">Game PIN</span>
                          <span className="ml-auto text-teal-400 text-[10px] font-bold">REQUIRED</span>
                        </div>
                        {testMetadata.requiredStudentDetails.length > 0 && (
                          <>
                            <div className="border-t border-white/10 pt-3">
                              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest text-center mb-3">Step 2 — Student Details</p>
                            </div>
                            {testMetadata.requiredStudentDetails.map((detail) => (
                              <div key={detail} className="bg-teal-400/20 rounded-lg p-3 flex items-center justify-between border border-teal-400/20">
                                <span className="text-teal-300 text-xs font-semibold">{detail}</span>
                                <button onClick={() => toggleStudentDetail(detail)} className="text-white/30 hover:text-red-400 transition-colors">
                                  <FaTrash size={8} />
                                </button>
                              </div>
                            ))}
                          </>
                        )}
                        {testMetadata.requiredStudentDetails.length === 0 && (
                          <div className="border-t border-white/10 pt-3 text-center">
                            <p className="text-white/30 text-[11px]">No extra fields — students join with just Name + PIN</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevSection}
              disabled={isFirstSection}
              className="flex items-center gap-2 text-slate-500 font-bold px-4 py-2 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FaChevronLeft /> Previous
            </button>

            {isLastSection ? (
              <button
                onClick={goToQuestions}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Next: Add Questions <FaChevronRight />
              </button>
            ) : (
              <button
                onClick={nextSection}
                className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all"
              >
                Next <FaChevronRight />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 2 — QUESTIONS
      ══════════════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="space-y-8">
          {/* Top Bar */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <button onClick={() => setCurrentStep(1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors text-sm">
              <FaChevronLeft /> Back to Settings
            </button>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("manual")}
                className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === "manual" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === "ai" ? "bg-indigo-600 shadow-sm text-white" : "text-slate-500"}`}
              >
                <FaMagic className="inline mr-2" /> AI Generator
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — Question Editor */}
            <div className="lg:col-span-2">
              {activeTab === "manual" ? (
                <div className="space-y-6">
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex justify-between items-center mb-6">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Question {qIdx + 1}
                        </span>
                        <button
                          onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <textarea
                          value={q.question.text}
                          onChange={(e) => handleQuestionChange(qIdx, "text", e.target.value)}
                          className="w-full bg-slate-50 border-transparent rounded-xl p-4 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] text-sm"
                          placeholder="Enter your question here..."
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={opt.key}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                q.correctAnswer?.includes(opt.key)
                                  ? "border-teal-500 bg-teal-50/30"
                                  : "border-slate-100 bg-slate-50/50"
                              }`}
                            >
                              <button
                                onClick={() => handleQuestionChange(qIdx, "correctAnswer", opt.key)}
                                className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                  q.correctAnswer?.includes(opt.key)
                                    ? "bg-teal-500 text-white"
                                    : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                                }`}
                              >
                                {opt.key}
                              </button>
                              <input
                                type="text" value={opt.text}
                                onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                className="bg-transparent text-sm outline-none flex-1 font-medium text-slate-700"
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
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-400 hover:text-indigo-500 transition-all flex items-center justify-center gap-3 bg-white"
                  >
                    <FaPlus /> Add Question
                  </button>
                </div>
              ) : (
                <div className="bg-indigo-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-8">
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4 ${isGenerating ? "animate-pulse" : ""}`}>
                        <FaMagic className="text-2xl text-teal-400" />
                      </div>
                      <h3 className="text-2xl font-bold">AI Question Generator</h3>
                      <p className="text-indigo-200 text-sm mt-2">Describe what you need and we'll craft it.</p>
                    </div>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl p-6 text-white placeholder-indigo-300 focus:ring-2 focus:ring-teal-400 outline-none min-h-[150px] text-sm"
                      placeholder="e.g. Generate 10 MCQs on Industrial Revolution for Class 10..."
                    />
                    <button
                      onClick={handleAiGenerate}
                      disabled={isGenerating}
                      className="w-full bg-teal-400 text-indigo-950 py-4 rounded-xl font-bold hover:bg-teal-300 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                    >
                      {isGenerating ? "Generating..." : "Generate Questions"}
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-[80px]" />
                </div>
              )}
            </div>

            {/* Right — Summary & Submit */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-8 space-y-6">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <FaCheckCircle className="text-teal-500" /> Ready to Launch?
                </h3>
                <div className="space-y-3 bg-slate-50 rounded-xl p-4">
                  {[
                    ["Model", testMetadata.testModel.toUpperCase()],
                    ["Questions", questions.length],
                    ["Duration", `${testMetadata.duration} min`],
                    ["Passing", `${testMetadata.passingScore}%`],
                    testMetadata.requiredStudentDetails.length > 0
                      ? ["Student Fields", testMetadata.requiredStudentDetails.length]
                      : null,
                  ].filter(Boolean).map(([label, val]) => (
                    <div key={label} className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400">{label}:</span>
                      <span className="text-slate-700 font-bold">{val}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleCreateTest}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {loading ? "Saving Draft..." : "Finalize & Save"}
                </button>
                <p className="text-[10px] text-slate-400 text-center">Tests are saved as private drafts. Publish from My Tests.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTest;
