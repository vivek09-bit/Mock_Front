
// import React, { useState, useEffect, useRef } from "react";

// /* ────────────────────────────────
//    ❶  Large sentence pools
//    ──────────────────────────────── */
// const easyTexts = [
//   "the quick brown fox jumps over the lazy dog",
//   "practice makes perfect every day",
//   "typing is a skill you can master",
//   "focus on accuracy before speed",
//   "keep calm and type on",
//   "habit builds consistency over time",
//   "every key matters in fluent typing",
//   "small steps lead to big progress",
//   "steady fingers create steady words",
//   "patience and practice beat haste",
//   "slow and steady wins the typing race",
//   "accuracy first, speed will follow",
//   "repeat phrases to improve memory",
//   "smooth rhythm reduces mistakes",
//   "relax shoulders and breathe calmly",
//   "maintain posture for better endurance",
//   "eyes on screen, not on keyboard",
//   "comfort grows with familiarity",
//   "repetition engraves muscle memory",
//   "progress shows through persistence"
// ];

// const mediumTexts = [
//   "The quick brown fox jumps over the lazy dog.",
//   "Practice makes perfect every single day.",
//   "Typing is a skill you can always master with patience.",
//   "Focus on accuracy before speed and obvious mistakes fade.",
//   "Keep calm and type on, you will certainly improve.",
//   "Consistent rhythm creates dependable results over weeks.",
//   "Small improvements compound into remarkable progress.",
//   "Steady fingers translate thoughts into flowing sentences.",
//   "Mistakes teach better than effortless success ever will.",
//   "Deliberate practice molds raw effort into polished speed.",
//   "Proper posture preserves energy during extended sessions.",
//   "Reading aloud helps synchronize eyes, mind, and hands.",
//   "Counting errors clarifies where concentration must grow.",
//   "Breaking large goals into daily habits keeps motivation high.",
//   "Confidence rises each time a clean run appears on screen.",
//   "Chasing numbers blindly may hinder technique and comfort.",
//   "Balanced intervals of rest and effort prevent fatigue.",
//   "Good lighting reduces strain and maintains focus.",
//   "Celebrating milestones reinforces positive feedback loops.",
//   "Healthy shoulders and wrists sustain lifelong productivity."
// ];

// const hardTexts = [
//   "Perfect typing: achieve it, but don't rush—slowly build!",
//   "Keep calm, type on, and track your progress: 24/7 dedication!",
//   "Master accuracy before speed; errors grow if you hurry!",
//   "Endurance, focus, and routine—a coder's secret to success.",
//   "Typing tests? Be ready: numbers, symbols & fast fingers required.",
//   "Consistency beats intensity; five mindful minutes > frantic bursts.",
//   "Sustain momentum—avoid burnout—celebrate micro-improvements daily.",
//   "Keyboard shortcuts (Ctrl+Z, Cmd+Shift+K) refine digital fluency.",
//   "High-contrast themes reduce glare; dark-mode lovers rejoice!",
//   "Discipline equals freedom—track stats, adjust, iterate, repeat.",
//   "Latency, layout, and lamp-light subtly impact raw WPM stats.",
//   "Alternate fingers rhythmically: left-right-left to minimize strain.",
//   "In situ code snippets → `const sum = a + b;` train real-world speed.",
//   "Mindful breathing stabilizes cadence—inhale, exhale, keep typing.",
//   "120 seconds of focus > 1200 seconds of distracted drifting.",
//   "Healthy wrists: keep them level; avoid sharp dorsal flexion.",
//   "Errors × Reaction time ≈ frustration; shrink both via practice.",
//   "“Simplicity is the ultimate sophistication.” — Leonardo da Vinci",
//   "Unicode, emojis 😊, and accented é characters test true mastery.",
//   "Great writers rewrite—great typists refine posture & precision."
// ];

// /* ────────────────────────────────
//    ❷  Utility helpers
//    ──────────────────────────────── */
// const randomSample = (arr) => arr[Math.floor(Math.random() * arr.length)];

// function generateTestText(level) {
//   const pool = level === "medium" ? mediumTexts : level === "hard" ? hardTexts : easyTexts;
//   const count = 3 + Math.floor(Math.random() * 2); // 3-4 sentences
//   return Array.from({ length: count }, () => randomSample(pool)).join(" ");
// }

// /* ────────────────────────────────
//    ❸  Main component
//    ──────────────────────────────── */
// export default function TypingTest() {
//   /* State */
//   const [difficulty, setDifficulty] = useState("easy");
//   const [duration, setDuration] = useState(1);
//   const [targetText, setTargetText] = useState("");
//   const [input, setInput] = useState("");
//   const [timeLeft, setTimeLeft] = useState(duration * 60);
//   const [started, setStarted] = useState(false);
//   const [finished, setFinished] = useState(false);
//   const [wpm, setWpm] = useState(0);
//   const [errors, setErrors] = useState(0);
//   const [accuracy, setAccuracy] = useState(100);
//   const [resultDate, setResultDate] = useState(null);

//   /* Refs */
//   const startTimeRef = useRef(null);
//   const timerId = useRef(null);
//   const inputRef = useRef(null);

//   /* Generate new paragraph when settings change */
//   useEffect(() => { resetTest(); }, [difficulty, duration]);

//  /* ───────────── TIMER + AUTO-FINISH ───────────── */
// useEffect(() => {
//   if (started && !finished) {
//     timerId.current = setInterval(() => {
//       setTimeLeft(t => {
//         // if this tick brings the clock to 0, finish immediately
//         if (t - 1 === 0) {
//           clearInterval(timerId.current);
//           finishTest();                                    // ① mark done
//           setResultDate(
//             new Date().toLocaleString("en-IN", {
//               weekday: "long",
//               year: "numeric",
//               month: "long",
//               day: "numeric",
//               hour: "2-digit",
//               minute: "2-digit",
//               second: "2-digit",
//               hour12: true,
//               timeZoneName: "short",
//             })
//           );
//         }
//         return Math.max(t - 1, 0);
//       });
//     }, 1000);
//   } else {
//     clearInterval(timerId.current);                       // stop when paused/finished
//   }

//   // clean-up on unmount
//   return () => clearInterval(timerId.current);
// }, [started, finished]);

// /* ───────────── LIVE STATS + EARLY FINISH ───────────── */
// useEffect(() => {
//   if (!started || finished) return;

//   // running keystroke stats
//   calculateStats(input, targetText);

//   // user finished typing before timer: auto-submit
//   if (
//     input.trimEnd().length >= targetText.trimEnd().length
//   ) {
//     clearInterval(timerId.current);                       // stop ticking
//     finishTest();                                         // mark done
//     setResultDate(
//       new Date().toLocaleString("en-IN", {
//         weekday: "long",
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: true,
//         timeZoneName: "short",
//       })
//     );
//   }
// }, [input, started, finished, targetText]);


//   /* Stats helpers */
//   function calculateStats(userInput, target) {
//     const tWords = target.trim().split(/\s+/);
//     const iWords = userInput.trim().split(/\s+/);
//     let err = 0;
//     for (let i = 0; i < iWords.length; i++) if (iWords[i] !== tWords[i]) err++;
//     const correct = iWords.length - err;
//     const acc = iWords.length === 0 ? 100 : Math.round((correct / iWords.length) * 100);
//     const elapsed = (Date.now() - startTimeRef.current) / 60000 || 1; // minutes
//     setErrors(err);
//     setAccuracy(acc);
//     setWpm(Math.round(correct / elapsed));
//   }

//   /* Handlers */
//   const handleInputChange = (e) => {
//     if (!started) {
//       setStarted(true);
//       startTimeRef.current = Date.now();
//     }
//     if (e.target.value.length > targetText.length + 10) return;
//     setInput(e.target.value);
//   };

//   const startTest = () => {
//     resetTest();
//     setStarted(true);
//     startTimeRef.current = Date.now();
//     setTimeLeft(duration * 60);
//     inputRef.current?.focus();
//   };

//   const finishTest = () => {
//     setStarted(false);
//     setFinished(true);
//     clearInterval(timerId.current);
//   };

//   const resetTest = () => {
//     clearInterval(timerId.current);
//     setTargetText(generateTestText(difficulty));
//     setInput("");
//     setStarted(false);
//     setFinished(false);
//     setTimeLeft(duration * 60);
//     setWpm(0);
//     setAccuracy(100);
//     setErrors(0);
//     setResultDate(null);
//   };

//   const formatTime = (sec) =>
//     `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

//   const renderColoredText = () => {
//     const tWords = targetText.trim().split(/\s+/);
//     const iWords = input.trim().split(/\s+/);
//     return tWords.map((word, i) => {
//       const style = i < iWords.length
//         ? iWords[i] === word ? "text-green-400" : "text-red-400"
//         : "text-gray-400";
//       return <span key={i} className={`${style} mr-2`}>{word}</span>;
//     });
//   };

//   /* Render */
//   return (
//     <div className="w-screen min-h-screen bg-gray-900 flex items-center justify-center p-6">
//       <div className="w-full max-w-3xl bg-gray-900 text-white p-6 rounded-lg shadow-lg flex flex-col gap-6">
//         <h1 className="text-4xl font-bold text-teal-400 text-center">Typing Test</h1>

//         {/* Controls */}
//         <div className="flex flex-wrap justify-center gap-6">
//           <div>
//             <label className="block font-semibold mb-1">Difficulty</label>
//             <select
//               value={difficulty}
//               onChange={(e) => setDifficulty(e.target.value)}
//               disabled={started}
//               className="w-32 px-3 py-2 rounded bg-gray-800 border border-gray-700"
//             >
//               <option value="easy">Easy</option>
//               <option value="medium">Medium</option>
//               <option value="hard">Hard</option>
//             </select>
//           </div>
//           <div>
//             <label className="block font-semibold mb-1">Duration</label>
//             <select
//               value={duration}
//               onChange={(e) => setDuration(Number(e.target.value))}
//               disabled={started}
//               className="w-24 px-3 py-2 rounded bg-gray-800 border border-gray-700"
//             >
//               {[1, 2, 3, 4, 5].map((m) => <option key={m} value={m}>{m} min</option>)}
//             </select>
//           </div>
//         </div>

//         {/* Target text */}
//         <div className="bg-gray-800 font-mono text-lg p-5 rounded-lg min-h-[140px] max-h-44 overflow-y-auto break-words whitespace-pre-wrap">
//           {renderColoredText()}
//         </div>

//         {/* Input */}
//         <textarea
//           ref={inputRef}
//           rows={5}
//           className="w-full bg-gray-900 p-4 rounded border border-gray-700 font-mono resize-none focus:ring-2 focus:ring-teal-400"
//           placeholder={started ? "Start typing..." : "Click Start Test..."}
//           value={input}
//           onChange={handleInputChange}
//           disabled={finished}
//           spellCheck={false}
//         />

//         {/* Progress bar */}
//         <div className="h-3 bg-gray-700 rounded overflow-hidden">
//           <div
//             className="h-3 bg-teal-400"
//             style={{ width: `${((duration * 60 - timeLeft) / (duration * 60)) * 100}%` }}
//           />
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-4 gap-4 text-center uppercase tracking-wide text-gray-400 text-xs font-semibold">
//           {[
//             ["Time", formatTime(timeLeft)],
//             ["WPM", wpm],
//             ["Accuracy", `${accuracy}%`],
//             ["Mistakes", errors]
//           ].map(([label, value]) => (
//             <div key={label}>
//               <div>{label}</div>
//               <div className="text-2xl font-bold text-white">{value}</div>
//             </div>
//           ))}
//         </div>

//         {/* Result or Start */}
//         {finished ? (
//           <div className="text-center p-6 bg-teal-900 border border-teal-600 rounded">
//             <h2 className="text-2xl font-semibold mb-3">Test Complete!</h2>
//             <p>Your typing speed: <strong>{wpm}</strong> WPM</p>
//             <p>Accuracy: <strong>{accuracy}%</strong> with <strong>{errors}</strong> mistake{errors !== 1 ? "s" : ""}</p>
//             {resultDate && <p className="mt-3 text-gray-200">Completed on: <strong>{resultDate}</strong></p>}
//             <button
//               onClick={resetTest}
//               className="mt-4 px-8 py-3 bg-teal-600 rounded hover:bg-teal-700 font-semibold"
//             >
//               Restart Test
//             </button>
//           </div>
//         ) : (
//           <div className="text-center">
//             <button
//               onClick={startTest}
//               disabled={started}
//               className={`px-8 py-3 bg-teal-600 rounded hover:bg-teal-700 font-semibold ${
//                 started ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             >
//               Start Test
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// second comment
import React, { useState, useEffect, useRef } from "react";

/* ──────────────────────────────
   ❶ English & Hindi sentence pools
   ────────────────────────────── */
const easyTextsEN = [
  "the quick brown fox jumps over the lazy dog",
  "practice makes perfect every day",
  // ... rest
];
const easyTextsHI = [
  "जल्दी में की गई चीजें ठीक नहीं होतीं।",
  "अभ्यास से ही सफलता मिलती है।",
  // ... rest
];
// Add similar pools for medium/hard for Hindi.
const mediumTextsEN = [
  "The quick brown fox jumps over the lazy dog.",
  "Practice makes perfect every single day.",
  // ...
];
const mediumTextsHI = [
  "अब वह शांत और तेजी से टाइप कर सकती है।",
  "सही मुद्रा से टाइपिंग आसान होती है।",
  // ...
];
const hardTextsEN = [
  "Perfect typing: achieve it, but don't rush—slowly build!",
  "...",
];
const hardTextsHI = [
  "संयम और निरंतरता से टाइपिंग में सुधार आता है।",
  "प्रैक्टिस ही सफलता की कुंजी है।",
  // ...etc
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
];


/* ──────────────────────────────
   ❷ Utility helpers
   ────────────────────────────── */
const randomSample = (arr) => arr[Math.floor(Math.random() * arr.length)];

function getPool(level, lang) {
  // Add Hindi support!
  if (lang === "hi") {
    if (level === "medium") return mediumTextsHI;
    if (level === "hard") return hardTextsHI;
    return easyTextsHI;
  }
  // English (default)
  if (level === "medium") return mediumTextsEN;
  if (level === "hard") return hardTextsEN;
  return easyTextsEN;
}

function generateTestText(level, lang) {
  const pool = getPool(level, lang);
  const count = 3 + Math.floor(Math.random() * 2); // 3-4
  return Array.from({ length: count }, () => randomSample(pool)).join(" ");
}


/* ──────────────────────────────
   ❸ Main component
   ────────────────────────────── */
export default function TypingTest() {
  // State
  const [language, setLanguage] = useState("en");
  const [difficulty, setDifficulty] = useState("easy");
  const [duration, setDuration] = useState(1); // min
  const [targetText, setTargetText] = useState("");
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  // Stats
  const [wpm, setWpm] = useState(0);
  const [errors, setErrors] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [netSpeed, setNetSpeed] = useState(0);
  const [resultDate, setResultDate] = useState(null);
 const [consistency, setConsistency] = useState(100);
  // Refs
  const startTimeRef = useRef(null);
  const timerId = useRef(null);
  const inputRef = useRef(null);

  // Timer resets on lang, difficulty, duration change
  useEffect(() => { resetTest(); }, [difficulty, duration, language]);

  // TIMER
  useEffect(() => {
    if (started && !finished) {
      timerId.current = setInterval(() => {
        setTimeLeft(t => {
          if (t - 1 === 0) {
            clearInterval(timerId.current);
            finishTest();
            setResultDate(
              new Date().toLocaleString("en-IN", { hour12: true, timeZoneName: "short" })
            );
          }
          return Math.max(t - 1, 0);
        });
      }, 1000);
    } else {
      clearInterval(timerId.current);
    }
    return () => clearInterval(timerId.current);
  }, [started, finished]);

  // LIVE accuracy/calculation. Finish early if all typed
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

  // Calculate stats: WPM, errors, accuracy, net speed (English & Hindi safe)
  function calculateStats(userInput, target) {
  const tChars = [...target];
  const iChars = [...userInput];
  let correct = 0;

  for (let i = 0; i < iChars.length; i++) {
    if (tChars[i] !== undefined && iChars[i] === tChars[i]) {
      correct++;
    }
  }

  // Calculate elapsed time in minutes (minimum 0.01 minutes to avoid division by zero)
  const elapsedMs = Date.now() - (startTimeRef.current || Date.now());
  const elapsedMinutes = Math.max(elapsedMs / 60000, 0.01);

  // Gross WPM (words per minute) — every 5 chars = 1 word
  const grossWpm = Math.round(iChars.length / 5 / elapsedMinutes);

  // Accuracy = (correct chars / typed chars) percentage
  const acc = iChars.length === 0 ? 100 : Math.round((correct / iChars.length) * 100);

  // Consistency = same as accuracy here — correct chars out of typed chars
  const consistencyPercent = iChars.length === 0 ? 100 : Math.round((correct / iChars.length) * 100);

  // Net speed just use gross WPM (or modify as you prefer)
  const netWPM = grossWpm;

  setConsistency(consistencyPercent);
  setWpm(grossWpm);
  setNetSpeed(netWPM);
  setAccuracy(acc);
}


  const handleInputChange = (e) => {
    if (!started) {
      setStarted(true);
      startTimeRef.current = Date.now();
    }
    if (e.target.value.length > targetText.length + 10) return;
    setInput(e.target.value);
  };

  const startTest = () => {
    resetTest();
    setStarted(true);
    startTimeRef.current = Date.now();
    setTimeLeft(duration * 60);
    inputRef.current?.focus();
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
  };

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  /* Color highlighter at the CHARACTER level for both languages */
  function renderColoredText() {
  const tArr = [...targetText];
  const iArr = [...input];

  return tArr.map((char, i) => {
    let className = "";
    if (i < iArr.length) {
      if (iArr[i] === char) {
        className = "text-green-400"; // Correct letter
      } else if (char !== ' ' && iArr[i] !== char) {
        className = "text-red-500"; // Just color, no box (no bg)
      }
    } else {
      className = "text-gray-400"; // Not yet typed
    }

    return (
      <span key={i} className={className}>
        {char}
      </span>
    );
  });
}


  // UI
  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-teal-50 to-teal-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-teal-800 text-white p-6 rounded-lg shadow-lg flex flex-col gap-6">
        <h1 className="text-4xl font-bold text-teal-300 text-center">Typing Test</h1>
        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-6">
          {/* Language Picker */}
          <div>
            <label className="block font-semibold mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={started}
              className="w-32 px-3 py-2 rounded bg-gray-800 border border-gray-700"
            >
              {LANGUAGES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* Difficulty */}
          <div>
            <label className="block font-semibold mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              disabled={started}
              className="w-32 px-3 py-2 rounded bg-gray-800 border border-gray-700"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          {/* Duration */}
          <div>
            <label className="block font-semibold mb-1">Duration</label>
            <select
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              disabled={started}
              className="w-24 px-3 py-2 rounded bg-gray-800 border border-gray-700"
            >
              {[1, 3, 5, 10].map(m => <option key={m} value={m}>{m} min</option>)}
            </select>
          </div>
        </div>
        {/* Passage display */}
        <div className={`bg-gray-800 font-mono text-lg p-5 rounded-lg min-h-[140px] max-h-44 overflow-y-auto break-words whitespace-pre-wrap ${language === "hi" ? "font-devanagari" : ""}`}>
          {renderColoredText()}
        </div>
        {/* Input */}
        <textarea
          ref={inputRef}
          rows={5}
          className={`w-full bg-gray-900 p-4 rounded border border-gray-700 font-mono resize-none focus:ring-2 focus:ring-teal-400 ${language === "hi" ? "font-devanagari" : ""}`}
          placeholder={started ? (language === "hi" ? "यहाँ टाइप करें..." : "Start typing...") : (language === "hi" ? "शुरू करने के लिए Start दबाएँ..." : "Click Start Test...")}
          value={input}
          onChange={handleInputChange}
          disabled={finished}
          spellCheck={false}
        />
        {/* Progress bar */}
        <div className="h-3 bg-gray-700 rounded overflow-hidden">
          <div
            className="h-3 bg-teal-400"
            style={{ width: `${((duration * 60 - timeLeft) / (duration * 60)) * 100}%` }}
          />
        </div>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 text-center uppercase tracking-wide text-gray-400 text-xs font-semibold">
  {[
    ["Time", formatTime(timeLeft)],
    ["WPM", wpm],
    ["Accuracy", `${accuracy}%`],
    ["Consistency", `${consistency}%`]
  ].map(([label, value]) => (
    <div key={label}>
      <div>{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  ))}
</div>

        {/* Result or Start */}
        {finished ? (
  // After test: show Restart
  <div className="text-center p-6 bg-teal-900 border border-teal-600 rounded">
    <h2 className="text-2xl font-semibold mb-3">Test Complete!</h2>
    <p>WPM: <strong>{wpm}</strong></p>
    <p>Accuracy: <strong>{accuracy}%</strong></p>
    <p>Net Speed: <strong>{netSpeed}</strong> WPM</p>
    {/* <p>Mistakes: <strong>{errors}</strong></p> */}
    <p>Consistency: <strong>{consistency}%</strong></p>

    {resultDate && <p className="mt-2 text-gray-200">Completed on: <strong>{resultDate}</strong></p>}
    <button
      onClick={resetTest}
      className="mt-4 px-8 py-3 bg-teal-600 rounded hover:bg-teal-700 font-semibold"
    >
      Restart Test
    </button>
  </div>
) : (
  <div className="text-center">
    {/* Only show START if test is NOT running */}
    {!started && (
      <button
        onClick={startTest}
        className="px-8 py-3 bg-teal-600 rounded hover:bg-teal-700 font-semibold"
      >
        Start Test
      </button>
    )}
    {/* Only show STOP if test IS running */}
    {started && !finished && (
      <button
        onClick={finishTest}
        className="px-8 py-3 bg-red-600 rounded hover:bg-red-700 font-semibold"
      >
        Stop Test
      </button>
    )}
  </div>
)}

      </div>
    </div>
  );
}


