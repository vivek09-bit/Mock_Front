import React, { useState } from "react";
import { FaShieldAlt, FaLightbulb, FaUserLock, FaDatabase, FaArrowRight, FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router-dom";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: <FaLightbulb />, desc: "Our mission to revolutionize education" },
  { id: "data", label: "Student Data", icon: <FaDatabase />, desc: "How we handle performance analytics" },
  { id: "security", label: "Proctoring Security", icon: <FaUserLock />, desc: "Ensuring exam integrity" },
];

const OverviewContent = () => (
  <div className="space-y-10">
    <div>
      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
        Edutech Policy <span className="text-indigo-600">v1.0</span>
      </h2>
      <p className="text-base text-slate-500 font-medium leading-relaxed max-w-xl">
        IgniteVerse is a next-generation platform engineered to redefine assessment and learning through intelligent analytics and rigid security.
      </p>
    </div>

    {/* Section 1 */}
    <div className="group bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-3xl border border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/60 hover:-translate-y-1 transition-all duration-300">
      <h3 className="flex items-center gap-3 text-xl font-black text-slate-900 mb-3">
        <FaLightbulb className="text-indigo-500 shrink-0" /> Empowering Institutions
      </h3>
      <p className="text-slate-600 leading-relaxed">
        Our core mandate is to provide educators with tools that offer deep insights into student performance. We believe in data-driven education where every assessment helps tailor the learning journey to individual needs.
      </p>
    </div>

    {/* Section 2 (Not Released Notice) */}
    <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-[40px]" />
        
        <div className="flex items-center gap-3 mb-4 relative z-10">
            <FaExclamationTriangle className="text-2xl text-amber-500 animate-pulse" />
            <h3 className="text-xl font-black text-amber-900 tracking-tight">Beta Phase Notice</h3>
        </div>
        
        <p className="text-amber-800 font-medium leading-relaxed relative z-10">
            <strong>Please Note:</strong> IgniteVerse is currently in an advanced beta phase and has <span className="underline decoration-amber-400 decoration-2 font-bold">not been officially released</span> to the general public. Features, policies, and platform stability are subject to rapid iteration as we onboard early-access partner institutions.
        </p>
    </div>
  </div>
);

const DataContent = () => (
  <div className="space-y-10">
    <div>
      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Student Data Analytics</h2>
      <p className="text-base text-slate-500 font-medium leading-relaxed max-w-xl">
        We rely on granular data collection to power our performance dashboards. Here is what you need to know.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 gap-6">
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-md hover:-translate-y-1 transition-transform">
        <h4 className="font-black text-slate-900 text-lg mb-3">Real-time Telemetry</h4>
        <p className="text-slate-500 text-sm leading-relaxed">
          During assessments, we track time-to-answer, option switching, and completion velocity to provide educators with a comprehensive cognitive profile of the student.
        </p>
      </div>

      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-md hover:-translate-y-1 transition-transform">
        <h4 className="font-black text-slate-900 text-lg mb-3">Anonymization Protocol</h4>
        <p className="text-slate-500 text-sm leading-relaxed">
          While educators see identified data for their specific cohorts, our internal AI training models rely exclusively on scrubbed, anonymized datasets to improve generative question creation.
        </p>
      </div>
    </div>
  </div>
);

const SecurityContent = () => (
  <div className="space-y-10">
    <div>
      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Proctoring Security</h2>
      <p className="text-base text-slate-500 font-medium leading-relaxed max-w-xl">
        Integrity is the foundation of digital assessment. Our "Full Mock" environment enforces strict operational boundaries.
      </p>
    </div>

    <div className="space-y-4">
        {[
          { title: "Browser Lockdown",  line: "Tests run in a mandatory fullscreen mode. Exiting fullscreen is logged as a security violation." },
          { title: "Tab Monitoring", line: "Switching focus away from the test tab triggers immediate warnings and eventual auto-submission." },
          { title: "Hardware Access",line: "Advanced tests require active webcam feeds. We do not permanently store video recordings; footage is analyzed in real-time." }
        ].map((box, i) => (
          <div key={i} className="flex gap-5 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm shrink-0">0{i+1}</div>
            <div>
              <h5 className="font-black text-slate-800 text-lg mb-2">{box.title}</h5>
              <p className="text-slate-500 text-sm leading-relaxed">{box.line}</p>
            </div>
          </div>
        ))}
    </div>
  </div>
);

const CONTENT_MAP = { overview: <OverviewContent />, data: <DataContent />, security: <SecurityContent /> };

export default function PolicyPage() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-16 relative overflow-x-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-60 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">

        {/* ── Sidebar ─────────────────────────────── */}
        <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-6 lg:sticky lg:top-10 lg:h-fit">

          {/* Branding card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl -z-10" />
            <span className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest mb-5">
              <FaShieldAlt /> Edutech Standards
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 leading-tight">
              Platform Platform Platform Policy
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">IgniteVerse Framework</p>

            {/* Nav */}
            <nav className="flex flex-col gap-2 mt-8">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`group flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-left transition-all duration-200 active:scale-[.98] ${
                    activeSection === sec.id
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className={`text-lg shrink-0 transition-colors ${activeSection === sec.id ? "text-indigo-200" : "text-slate-300 group-hover:text-slate-500"}`}>
                    {sec.icon}
                  </span>
                  <div className="min-w-0">
                    <div className={`text-sm font-black truncate ${activeSection === sec.id ? "text-white" : ""}`}>{sec.label}</div>
                    <div className={`text-xs font-medium truncate mt-0.5 ${activeSection === sec.id ? "text-indigo-200" : "text-slate-400"}`}>{sec.desc}</div>
                  </div>
                  {activeSection === sec.id && <FaArrowRight className="ml-auto text-xs text-white shrink-0" />}
                </button>
              ))}
            </nav>
          </div>

          <Link to="/" className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:text-indigo-600 hover:bg-slate-50 transition-all duration-200 shadow-sm">
            <FaArrowRight className="rotate-180" /> Back to Home
          </Link>
        </aside>

        {/* ── Main content ─────────────────────────── */}
        <main className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-12 lg:p-16 min-h-[70vh]">
          {CONTENT_MAP[activeSection]}

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center sm:justify-between gap-4 text-xs text-slate-400 font-bold">
            <span>&copy; 2026 IgniteVerse Edutech. All Rights Reserved.</span>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center text-slate-300"><FaUserLock /></div>
              <div className="w-8 h-8 flex items-center justify-center text-slate-300"><FaDatabase /></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
