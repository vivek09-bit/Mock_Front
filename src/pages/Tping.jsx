// second comment
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Globe } from "lucide-react"; 
import femaleTyping from "../assets/Female typing.png";
import maleTyping from "../assets/Male typing.png";

/* ──────────────────────────────
   ❶ English & Hindi sentence pools
   ────────────────────────────── */
const easyTextsEN = [
  "the quick brown fox jumps over the lazy dog",
  "practice makes perfect every day",
  "a simple sentence for beginners",
  "typing is a valuable skill",
  "keep your fingers on the home row"
];
const easyTextsHI = [
  "जल्दी में की गई चीजें ठीक नहीं होतीं।",
  "अभ्यास से ही सफलता मिलती है।",
  "टाइपिंग एक कला है।",
  "हर दिन अभ्यास करें।",
  "मेहनत का फल मीठा होता है।"
];

const mediumTextsEN = [
  "The quick brown fox jumps over the lazy dog.",
  "Practice makes perfect every single day.",
  "Modern web development requires constant learning.",
  "Efficiency is doing things right; effectiveness is doing the right things.",
  "Technology is best when it brings people together."
];
const mediumTextsHI = [
  "अब वह शांत और तेजी से टाइप कर सकती है।",
  "सही मुद्रा से टाइपिंग आसान होती है।",
  "सफलता की कुंजी निरंतरता में है।",
  "ईमानदारी सबसे अच्छी नीति है।",
  "समय का सदुपयोग करना सीखें।"
];
const hardTextsEN = [
  "Perfect typing: achieve it, but don't rush—slowly build!",
  "Complexity is the enemy of execution; simplicity is the ultimate sophistication.",
  "Algorithm design requires deep analytical thinking and precision.",
  "Quantifying performance in distributed systems is extremely challenging.",
  "Resilience is not just about bouncing back, but about leaping forward."
];
const hardTextsHI = [
  "संयम और निरंतरता से टाइपिंग में सुधार आता है।",
  "प्रैक्टिस ही सफलता की कुंजी है।",
  "जीवन में चुनौतियों का सामना करना सीखें।",
  "कठिन परिश्रम का कोई विकल्प नहीं है।",
  "लक्ष्य प्राप्ति के लिए एकाग्रता जरूरी है।"
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
];

const DURATIONS = [
  { label: "30 Seconds Test", value: 0.5 },
  { label: "1 Minute Test", value: 1 },
  { label: "2 Minutes Test", value: 2 },
  { label: "3 Minutes Test", value: 3 },
  { label: "5 Minutes Test", value: 5 },
  { label: "10 Minutes Test", value: 10 },
];

const TEXT_TYPES = [
  { label: "Easy Text", value: "easy" },
  { label: "Medium Text", value: "medium" },
  { label: "Hard Text", value: "hard" },
  { type: "divider" },
  { label: "Benchmark (2 min)", value: "benchmark" },
  { label: "Certificate", value: "certificate" },
  { type: "divider" },
  { label: "Tricky Spelling", value: "tricky" },
  { label: "Blind Typing", value: "blind" },
  { label: "Story Typing...", value: "story" },
  { label: "Themed...", value: "themed" },
  { type: "divider" },
  { label: "Professional...", value: "professional" },
];

/* ──────────────────────────────
   ❷ Utility helpers
   ────────────────────────────── */
const randomSample = (arr) => arr[Math.floor(Math.random() * arr.length)];

function getPool(level, lang) {
  if (lang === "hi") {
    if (level === "medium") return mediumTextsHI;
    if (level === "hard") return hardTextsHI;
    return easyTextsHI;
  }
  if (level === "medium") return mediumTextsEN;
  if (level === "hard") return hardTextsEN;
  return easyTextsEN;
}

function generateTestText(level, lang) {
  const pool = getPool(level, lang);
  const count = 3 + Math.floor(Math.random() * 2); 
  return Array.from({ length: count }, () => randomSample(pool)).join(" ");
}

/* ──────────────────────────────
   ❸ Components
   ────────────────────────────── */

const CustomDropdown = ({ options, value, onChange, disabled, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div 
      className="relative w-full max-w-xs" 
      ref={dropdownRef}
      onMouseEnter={() => !disabled && setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white text-gray-700 px-6 py-3 rounded-full shadow-md flex items-center justify-between border border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
      >
        <span className="text-lg font-medium">{selectedOption.label}</span>
        {isOpen ? <ChevronUp size={24} className="text-gray-400" /> : <ChevronDown size={24} className="text-gray-400" />}
      </button>

      {isOpen && (
        <div 
          className="absolute z-[100] mt-2 w-full bg-white rounded-2xl shadow-2xl py-2 border border-gray-100 animate-in fade-in zoom-in duration-200 max-h-[500px] overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#085f6333 transparent'
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            .absolute::-webkit-scrollbar { width: 6px; }
            .absolute::-webkit-scrollbar-track { background: transparent; }
            .absolute::-webkit-scrollbar-thumb { background: #085f6333; border-radius: 10px; }
            .absolute::-webkit-scrollbar-thumb:hover { background: #085f6366; }
          `}} />
          {options.map((opt, idx) => {
            if (opt.type === "divider") {
              return <div key={`div-${idx}`} className="border-t border-gray-100 my-1 mx-4" />;
            }
            return (
              <button
                key={opt.value + idx}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-6 py-2.5 text-lg hover:bg-gray-50 transition-colors ${value === opt.value ? 'text-teal-600 font-semibold bg-teal-50/30' : 'text-gray-600'}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────────
   ❹ Main component
   ────────────────────────────── */
export default function TypingTest() {
  // State
  const [language, setLanguage] = useState("en");
  const [difficulty, setDifficulty] = useState("medium");
  const [duration, setDuration] = useState(1); // min
  const [targetText, setTargetText] = useState("");
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Stats
  const [wpm, setWpm] = useState(0);
  const [errors, setErrors] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [netSpeed, setNetSpeed] = useState(0);
  const [resultDate, setResultDate] = useState(null);
  const [consistency, setConsistency] = useState(100);

  // Advanced Analytics State
  const [backspaces, setBackspaces] = useState(0);
  const [mistakesMap, setMistakesMap] = useState({});
  const [wpmSegments, setWpmSegments] = useState([]);
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [errorStreak, setErrorStreak] = useState(0);
  const [maxErrorStreak, setMaxErrorStreak] = useState(0);
  const [isSuspicious, setIsSuspicious] = useState(false);
  const [suspiciousReason, setSuspiciousReason] = useState("");
  const [extraChars, setExtraChars] = useState(0);

  // Refs
  const startTimeRef = useRef(null);
  const timerId = useRef(null);
  const inputRef = useRef(null);
  const lastSegmentCharsRef = useRef(0);
  const inputLengthRef = useRef(0);

  // Sync ref for access in setInterval
  useEffect(() => {
    inputLengthRef.current = input.length;
  }, [input]);

  // Timer resets on lang, difficulty, duration change
  useEffect(() => { 
    if (!started) {
      resetTest(); 
    }
  }, [difficulty, duration, language]);

  // TIMER
  useEffect(() => {
    if (started && !finished) {
      timerId.current = setInterval(() => {
        setTimeLeft(t => {
          const newTime = t - 1;
          
          // Every 10 seconds, record a WPM segment for consistency calculation
          const elapsedSec = (duration * 60) - newTime;
          if (elapsedSec > 0 && elapsedSec % 10 === 0) {
            const currentChars = inputLengthRef.current;
            const deltaChars = currentChars - lastSegmentCharsRef.current;
            const segmentWpm = (deltaChars / 5) * 6;
            setWpmSegments(prev => [...prev, segmentWpm]);
            lastSegmentCharsRef.current = currentChars;
          }

          if (newTime <= 0) {
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(timerId.current);
    }
    return () => clearInterval(timerId.current);
  }, [started, finished, duration]);

  useEffect(() => {
    if (timeLeft === 0 && started && !finished) {
      finishTest();
      setResultDate(
        new Date().toLocaleString("en-IN", { hour12: true, timeZoneName: "short" })
      );
    }
  }, [timeLeft, started, finished]);

  // LIVE accuracy/calculation.
  useEffect(() => {
    if (!started || finished) return;
    calculateStats(input, targetText);
    if (input.trimEnd().length >= targetText.trimEnd().length) {
      clearInterval(timerId.current);
      finishTest();
      setResultDate(
        new Date().toLocaleString("en-IN", { hour12: true, timeZoneName: "short" })
      );
    }
  }, [input, started, finished, targetText]);

  function calculateStats(userInput, target) {
    const tChars = [...target];
    const iChars = [...userInput];
    let correct = 0;
    let localMistakes = { ...mistakesMap };
    let currentErrors = 0;
    let streak = 0;
    let maxStreak = maxErrorStreak;

    for (let i = 0; i < iChars.length; i++) {
      if (tChars[i] !== undefined) {
        if (iChars[i] === tChars[i]) {
          correct++;
          streak = 0;
        } else {
          currentErrors++;
          streak++;
          if (streak > maxStreak) maxStreak = streak;
          
          // Track mistyped character frequency
          const expectedChar = tChars[i];
          localMistakes[expectedChar] = (localMistakes[expectedChar] || 0) + 1;
        }
      } else {
        // Extra characters typed beyond target length
        currentErrors++;
      }
    }

    const elapsedMs = Date.now() - (startTimeRef.current || Date.now());
    const elapsedMinutes = Math.max(elapsedMs / 60000, 0.01);
    
    // 1️⃣ Gross WPM = (Total Typed / 5) / Time
    const grossWpm = Math.round((iChars.length / 5) / elapsedMinutes);
    
    // 2️⃣ Accuracy = (Correct / Total Typed) * 100
    const acc = iChars.length === 0 ? 100 : Math.round((correct / iChars.length) * 100);
    
    // 3️⃣ Net WPM = Gross WPM - (Errors / Time)
    const netWPM = Math.max(0, Math.round(grossWpm - (currentErrors / elapsedMinutes)));

    // 4️⃣ Consistency = 100 - standard deviation of segment WPMs
    let consistencyPercent = 100;
    if (wpmSegments.length > 1) {
      const mean = wpmSegments.reduce((a, b) => a + b, 0) / wpmSegments.length;
      const variance = wpmSegments.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpmSegments.length;
      const stdDev = Math.sqrt(variance);
      consistencyPercent = Math.max(0, Math.min(100, Math.round(100 - stdDev)));
    }

    setConsistency(consistencyPercent);
    setWpm(grossWpm);
    setNetSpeed(netWPM);
    setAccuracy(acc);
    setErrors(currentErrors);
    setMistakesMap(localMistakes);
    setMaxErrorStreak(maxStreak);
    
    // Anti-cheat flag
    if (keystrokeCount > 0 && keystrokeCount / Math.max(userInput.length, 1) > 1.2) {
      setIsSuspicious(true);
      setSuspiciousReason("Unnatural typing pattern (keystroke ratio)");
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    // Anti-Cheat: Detect Paste
    if (newValue.length - input.length > 1) {
      setIsSuspicious(true);
      setSuspiciousReason("Paste detected");
      return; // Ignore pasted input
    }

    if (!started) {
      setStarted(true);
      startTimeRef.current = Date.now();
    }
    
    if (newValue.length > targetText.length + 10) {
      setExtraChars(prev => prev + (newValue.length - targetText.length));
      return;
    }
    
    setKeystrokeCount(prev => prev + 1);
    setInput(newValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      setBackspaces(prev => prev + 1);
    }
  };

  const startTest = () => {
    resetTest();
    setStarted(true);
    startTimeRef.current = Date.now();
    setTimeLeft(duration * 60);
    // Focus after dynamic render
    setTimeout(() => {
        inputRef.current?.focus();
    }, 100);
  };

  function finishTest() {
    setStarted(false);
    setFinished(true);
    clearInterval(timerId.current);
    calculateStats(input, targetText);
  }

  const resetTest = () => {
    clearInterval(timerId.current);
    setTargetText(generateTestText(difficulty, language));
    setInput("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(duration * 60);
    setWpm(0);
    setNetSpeed(0);
    setAccuracy(100);
    setErrors(0);
    setResultDate(null);
    setBackspaces(0);
    setMistakesMap({});
    setWpmSegments([]);
    setKeystrokeCount(0);
    setErrorStreak(0);
    setMaxErrorStreak(0);
    setIsSuspicious(false);
    setSuspiciousReason("");
    setExtraChars(0);
    lastSegmentCharsRef.current = 0;
  };

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  function renderColoredText() {
    const tArr = [...targetText];
    const iArr = [...input];

    return tArr.map((char, i) => {
      let className = "";
      if (i < iArr.length) {
        if (iArr[i] === char) {
          className = "text-green-500 opacity-100";
        } else {
          className = "text-red-500 opacity-100 underline decoration-2 underline-offset-4";
        }
      } else {
        className = "text-gray-400 opacity-60";
      }

      return (
        <span key={i} className={`${className} transition-colors duration-200`}>
          {char}
        </span>
      );
    });
  }

  return (
    <div 
      className={`w-full min-h-screen font-sans transition-colors duration-500 flex flex-col items-center justify-center p-4 relative overflow-x-hidden overflow-y-auto ${darkMode ? 'bg-[#006967] text-white' : 'bg-[#d9fffb] text-[#444]'}`}
      style={{ scrollbarWidth: 'thin', scrollbarColor: darkMode ? '#ffffff33 transparent' : '#00000022 transparent' }}
    >
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${darkMode ? '#fff' : '#000'} 1px, transparent 0)`, backgroundSize: '40px 40px' }} />

      {/* Main Container */}
      <div className="w-full max-w-5xl z-10 flex flex-col items-center">
        
        {/* Header Section (Only if not started) */}
        {!started && !finished && (
          <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-extrabold italic mb-2 tracking-tight">
              Check your typing skills in a minute
            </h1>
            <p className="text-xl md:text-2xl font-light opacity-90">
              Type away to join 50k test takers!
            </p>
          </div>
        )}

        {/* Content Box */}
        <div className="w-full relative flex flex-col items-center justify-center">
          
          {/* Side Illustrations */}
          {!started && !finished && (
            <>
              <div className="hidden lg:block absolute -left-48 bottom-0 w-64 h-auto animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
                <img src={femaleTyping} alt="Female typing" className="w-full opacity-90 hover:opacity-100 transition-all cursor-pointer" />
                <button className={`mt-4 px-6 py-2 border-2 rounded-full text-sm font-bold uppercase tracking-widest transition-colors block mx-auto ${darkMode ? 'border-white/40 hover:bg-white/10' : 'border-slate-800/40 text-slate-800 hover:bg-slate-800/10'}`}>
                  Typing Games
                </button>
              </div>
              <div className="hidden lg:block absolute -right-48 bottom-0 w-64 h-auto animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                <img src={maleTyping} alt="Male typing" className="w-full opacity-90 hover:opacity-100 transition-all cursor-pointer" />
                <button className={`mt-4 px-6 py-2 border-2 rounded-full text-sm font-bold uppercase tracking-widest transition-colors block mx-auto ${darkMode ? 'border-white/40 hover:bg-white/10' : 'border-slate-800/40 text-slate-800 hover:bg-slate-800/10'}`}>
                  Typing Lessons
                </button>
              </div>
            </>
          )}

          {/* Setup Panel */}
          {!started && !finished ? (
            <div className="w-full max-w-2xl bg-white/15 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center gap-8 animate-in zoom-in duration-500">
              <span className="text-sm font-bold uppercase tracking-widest opacity-70">SELECT YOUR TEST</span>
              
              <div className="w-full flex flex-col gap-4">
                <CustomDropdown 
                  options={DURATIONS} 
                  value={duration} 
                  onChange={setDuration} 
                  label="Duration"
                />
                
                <CustomDropdown 
                  options={TEXT_TYPES} 
                  value={difficulty} 
                  onChange={setDifficulty} 
                  label="Text Type"
                />

                <CustomDropdown 
                  options={LANGUAGES.map(l => ({ label: l.label, value: l.value }))} 
                  value={language} 
                  onChange={setLanguage} 
                  label="Language"
                />
              </div>

              <button
                onClick={startTest}
                className="group relative overflow-hidden px-12 py-4 bg-[#085f63] hover:bg-[#0a7a7e] text-white rounded-full font-bold text-xl shadow-[0_10px_30px_rgba(8,95,99,0.3)] hover:shadow-[0_15px_40px_rgba(8,95,99,0.5)] transform hover:-translate-y-1 transition-all"
              >
                <span className="relative z-10 uppercase tracking-widest">Start Test</span>
              </button>

              <div className="flex items-center gap-3">
                <div 
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${darkMode ? 'bg-blue-500' : 'bg-gray-400'}`}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <span className="text-lg opacity-80">Dark Mode</span>
              </div>
            </div>
          ) : finished ? (
            /* Results Panel */
            <div className="w-full max-w-4xl bg-slate-900 text-white p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col items-center gap-8 animate-in zoom-in duration-500 border border-white/10">
              <div className="flex flex-col items-center mb-4">
                <h2 className="text-5xl font-black text-teal-400 tracking-tighter uppercase italic">Test Result</h2>
                {isSuspicious && (
                  <div className="mt-2 px-4 py-1 bg-red-500/20 border border-red-500/50 rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest leading-none">Suspicious: {suspiciousReason}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-teal-500/30 transition-all">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1">Net Speed</span>
                    <span className="text-5xl font-black text-teal-400">{netSpeed} <span className="text-sm font-light text-white opacity-40">WPM</span></span>
                </div>
                <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-teal-500/30 transition-all">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1">Accuracy</span>
                    <span className="text-5xl font-black text-teal-400">{accuracy}<span className="text-sm font-light text-white opacity-40">%</span></span>
                </div>
                <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-teal-500/30 transition-all">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1">Consistency</span>
                    <span className="text-5xl font-black text-teal-400">{consistency}<span className="text-sm font-light text-white opacity-40">%</span></span>
                </div>
                <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-teal-500/30 transition-all">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1">Gross WPM</span>
                    <span className="text-5xl font-black text-white/80">{wpm}</span>
                </div>
              </div>

              {/* Extended Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4 border-b border-white/5 pb-2">Error Breakdown</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center group">
                      <span className="text-sm opacity-60">Total Mistakes</span>
                      <span className="text-lg font-bold text-red-400">{errors}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-sm opacity-60">Backspaces</span>
                      <span className="text-lg font-bold text-yellow-400">{backspaces}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-sm opacity-60">Max Error Streak</span>
                      <span className="text-lg font-bold text-orange-400">{maxErrorStreak}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-sm opacity-60">Extra Typing</span>
                      <span className="text-lg font-bold text-blue-400">{extraChars}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4 border-b border-white/5 pb-2">Mistake Analytics</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(mistakesMap).length > 0 ? (
                      Object.entries(mistakesMap)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([char, count], i) => (
                          <div key={i} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <span className="text-sm font-mono text-teal-400">{char === " " ? "SPC" : char}</span>
                            <span className="text-[10px] opacity-40">×</span>
                            <span className="text-sm font-bold">{count}</span>
                          </div>
                        ))
                    ) : (
                      <span className="text-sm italic opacity-40">Perfect! No mistakes recorded.</span>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs opacity-60">Level</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      netSpeed > 100 ? 'bg-purple-500/20 text-purple-400' :
                      netSpeed > 80 ? 'bg-teal-500/20 text-teal-400' :
                      netSpeed > 50 ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {netSpeed > 100 ? 'LEGENDARY' : netSpeed > 80 ? 'FAST' : netSpeed > 50 ? 'FLUENT' : 'AVERAGE'}
                    </span>
                  </div>
                </div>
              </div>

              {resultDate && (
                <p className="text-white/20 italic text-[10px] uppercase tracking-widest">Recorded on {resultDate}</p>
              )}

              <button
                onClick={resetTest}
                className="group relative px-16 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-black text-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] overflow-hidden"
              >
                <span className="relative z-10 uppercase tracking-widest">Restart Test</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          ) : (
            /* Active Typing Area */
            <div className="w-full max-w-4xl flex flex-col gap-6 animate-in fade-in duration-500">
              {/* Stats Bar */}
              <div className="flex justify-between items-end px-4">
                <div className="flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-xs uppercase opacity-60">Timer</span>
                        <span className="text-3xl font-mono font-bold text-teal-400">{formatTime(timeLeft)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase opacity-60">WPM</span>
                        <span className="text-3xl font-mono font-bold text-teal-400">{wpm}</span>
                    </div>
                </div>
                <button 
                  onClick={finishTest}
                  className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors"
                >
                  Stop Test
                </button>
              </div>

              {/* Text Display */}
              <div className="relative p-10 bg-white shadow-2xl rounded-3xl overflow-hidden min-h-[250px] flex items-center justify-center">
                 {/* Progress Indicator */}
                <div 
                  className="absolute top-0 left-0 h-1.5 bg-teal-500 transition-all duration-300" 
                  style={{ width: `${((duration * 60 - timeLeft) / (duration * 60)) * 100}%` }}
                />

                <p className={`text-3xl leading-relaxed text-center select-none font-mono ${language === "hi" ? "font-devanagari" : ""}`}>
                  {renderColoredText()}
                </p>

                {/* Invisible Input */}
                <textarea
                  ref={inputRef}
                  className="absolute inset-0 opacity-0 cursor-default resize-none"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onPaste={(e) => {
                    e.preventDefault();
                    setIsSuspicious(true);
                    setSuspiciousReason("Paste blocked");
                  }}
                  autoFocus
                  spellCheck={false}
                />
              </div>

              <div className="text-center opacity-60 italic text-sm">
                Hint: Start typing to begin the timer. Accuracy matters!
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}



