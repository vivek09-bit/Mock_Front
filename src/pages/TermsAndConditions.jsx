import React, { useState } from "react";
import {
  FaShieldAlt, FaLock, FaCreditCard, FaUserGraduate,
  FaChalkboardTeacher, FaCheckCircle, FaArrowRight,
  FaBalanceScale, FaHistory, FaHandshake, FaGlobe, FaCubes, FaEnvelope
} from "react-icons/fa";
import { Link } from "react-router-dom";

const SECTIONS = [
  { id: "terms",   label: "Terms of Service", icon: <FaShieldAlt />,  desc: "Usage rules & conditions" },
  { id: "privacy", label: "Privacy Policy",   icon: <FaLock />,       desc: "How we protect your data" },
  { id: "credits", label: "Credit & Pricing", icon: <FaCreditCard />, desc: "Recharge, unlock & refunds" },
];

const TermsContent = () => (
  <div className="space-y-10">
    <div>
      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
        User Terms <span className="text-blue-600">v3.0</span>
      </h2>
      <p className="text-base text-slate-500 font-medium leading-relaxed max-w-xl">
        By entering IgniteVerse, you agree to these binding operational rules.
      </p>
    </div>

    {/* Section 1 */}
    <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 hover:shadow-xl hover:shadow-blue-100/60 hover:-translate-y-1 transition-all duration-300">
      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest mb-5 shadow-md shadow-blue-500/30">
        <FaGlobe className="text-[8px]" /> Section 01
      </span>
      <h3 className="flex items-center gap-3 text-xl font-black text-slate-900 mb-3">
        <FaUserGraduate className="text-blue-500 shrink-0" /> Account Integrity
      </h3>
      <p className="text-slate-600 leading-relaxed">
        Your account is your personal identity. Sharing credentials or using automated bots to
        simulate test attempts is strictly prohibited and results in an immediate permanent ban
        without credit refund.
      </p>
    </div>

    {/* Section 2 */}
    <div className="group bg-gradient-to-br from-purple-50 to-fuchsia-50 p-8 rounded-3xl border border-purple-100 hover:shadow-xl hover:shadow-purple-100/60 hover:-translate-y-1 transition-all duration-300">
      <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest mb-5 shadow-md shadow-purple-500/30">
        <FaCubes className="text-[8px]" /> Section 02
      </span>
      <h3 className="flex items-center gap-3 text-xl font-black text-slate-900 mb-3">
        <FaChalkboardTeacher className="text-purple-500 shrink-0" /> Instructor Beta Access
      </h3>
      <p className="text-slate-600 leading-relaxed">
        Early-access instructors enjoy free hosting and unlimited student management during Beta.
        Content rights remain with you; you grant IgniteVerse a non-exclusive license to host
        and serve your content to authorized students.
      </p>
    </div>

    {/* Governance dark box */}
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-10 rounded-3xl text-white overflow-hidden relative group shadow-xl">
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-8">Governance & Content</h3>
      <div className="grid sm:grid-cols-2 gap-6 relative z-10">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
          <h4 className="font-black text-slate-100 flex items-center gap-2 mb-2">
            <FaCheckCircle className="text-green-400 shrink-0" /> Intellectual Property
          </h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            IgniteVerse owns the software and data structures. Mock test content belongs to the respective creator.
          </p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
          <h4 className="font-black text-slate-100 flex items-center gap-2 mb-2">
            <FaCheckCircle className="text-green-400 shrink-0" /> Proctoring Rules
          </h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            Attempts to bypass session timers or response capture are documented and flagged for instructor review.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const PrivacyContent = () => (
  <div className="space-y-10">
    <div>
      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Privacy Policy</h2>
      <p className="text-base text-slate-500 font-medium leading-relaxed max-w-xl">
        We protect your intellectual growth and personal data with equal measures of encryption.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 gap-6">
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-md hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100/60 transition-all duration-300">
        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-xl mb-5">
          <FaLock />
        </div>
        <h4 className="font-black text-slate-900 text-lg mb-3">Data Collection</h4>
        <p className="text-slate-500 text-sm leading-relaxed">
          We store your name, email, payment history, and granular test performance (time per question, accuracy, and attempt count).
        </p>
      </div>

      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-md hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-100/60 transition-all duration-300">
        <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 text-xl mb-5">
          <FaHistory />
        </div>
        <h4 className="font-black text-slate-900 text-lg mb-3">Retention Policy</h4>
        <p className="text-slate-500 text-sm leading-relaxed">
          Attempt data is retained for 24 months. After 24 months of full account inactivity, we may anonymize or delete non-essential data.
        </p>
      </div>
    </div>

    <div className="p-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl relative overflow-hidden group shadow-xl shadow-indigo-500/20 border border-indigo-500/30">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      <FaHandshake className="text-5xl text-white/30 mb-5 relative z-10" />
      <h4 className="text-2xl font-black text-white mb-3 relative z-10">Zero Third-Party Sharing</h4>
      <p className="text-white/80 text-sm leading-relaxed relative z-10 max-w-lg">
        Your data exists only for your learning and your instructor's analysis. We never sell profile or performance data.
        All authentication uses industry-standard HTTPS and salt-based hashing.
      </p>
    </div>
  </div>
);

const CreditsContent = () => (
  <div className="space-y-10">
    <div>
      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Credit Policy</h2>
      <p className="text-base text-slate-500 font-medium leading-relaxed max-w-xl">
        The IgniteVerse Credit system is designed for maximum student flexibility and transparency.
      </p>
    </div>

    {/* Pricing Table */}
    <div className="overflow-hidden bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-xl hover:shadow-indigo-100/40 hover:-translate-y-1 transition-all duration-300">
      <div className="px-8 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Pricing Structure</h4>
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">No Expiry</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[440px]">
          <tbody className="text-sm divide-y divide-slate-50">
            {[
              { pack: "Basic Recharge",  desc: "For situational practice",   cost: "₹199 / 10 Cr" },
              { pack: "Power Recharge",  desc: "For full-exam prep cycle",   cost: "₹499 / 50 Cr"  },
              { pack: "Mastery Quest",   desc: "Unlimited premium portal",   cost: "₹899"           }
            ].map((row, i) => (
              <tr key={i} className="hover:bg-indigo-50/40 group transition-colors">
                <td className="px-8 py-5 font-black text-slate-900 group-hover:translate-x-1 transition-transform">{row.pack}</td>
                <td className="px-8 py-5 text-slate-500">{row.desc}</td>
                <td className="px-8 py-5 text-right font-black text-indigo-600">{row.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Refund Section */}
    <div className="p-8 bg-gradient-to-b from-white to-slate-50 rounded-3xl border border-slate-200 shadow-sm">
      <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Refund & Cancellation</h3>
      <div className="space-y-4">
        {[
          { title: "Unused Balances",    line: "Full 7-day refund on any recharge pack if no credits have been spent." },
          { title: "The 'Unlock' Point", line: "Once a premium test is unlocked using a credit, that credit is consumed and non-refundable." },
          { title: "Technical Assurance",line: "Platform failures during unlocked sessions automatically return credits to your balance." },
          { title: "No Expiry",          line: "Credits do not expire as long as your account remains in good standing." }
        ].map((box, i) => (
          <div key={i} className="flex gap-5 p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/40 transition-all duration-200 group">
            <div className="w-9 h-9 bg-slate-800 text-white rounded-xl flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-indigo-600 transition-colors">0{i+1}</div>
            <div>
              <h5 className="font-black text-slate-800 text-sm mb-1">{box.title}</h5>
              <p className="text-slate-500 text-sm leading-relaxed">{box.line}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CONTENT_MAP = { terms: <TermsContent />, privacy: <PrivacyContent />, credits: <CreditsContent /> };

const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState("terms");

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-16 relative overflow-x-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">

        {/* ── Sidebar ─────────────────────────────── */}
        <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-6 lg:sticky lg:top-10 lg:h-fit">

          {/* Branding card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <span className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest mb-5">
              <FaBalanceScale /> Compliance Centre
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1 leading-tight">
              IgniteVerse <span className="text-indigo-600">Legals</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform v3.4.1</p>

            {/* Nav */}
            <nav className="flex flex-col gap-2 mt-8">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`group flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-left transition-all duration-200 active:scale-[.98] ${
                    activeSection === sec.id
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className={`text-lg shrink-0 transition-colors ${activeSection === sec.id ? "text-indigo-300" : "text-slate-300 group-hover:text-slate-500"}`}>
                    {sec.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-black truncate">{sec.label}</div>
                    <div className={`text-xs font-medium truncate mt-0.5 ${activeSection === sec.id ? "text-slate-400" : "text-slate-400"}`}>{sec.desc}</div>
                  </div>
                  {activeSection === sec.id && <FaArrowRight className="ml-auto text-xs text-indigo-300 shrink-0" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Contact card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden group border border-indigo-500/30 shadow-xl shadow-indigo-500/20">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-3">Have a question?</p>
            <h3 className="text-xl font-black leading-tight mb-6">Our legal team<br/>is ready to help.</h3>
            <a
              href="mailto:support@igniteverse.in"
              className="relative z-10 inline-flex items-center gap-3 bg-white text-indigo-700 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-900 hover:text-white transition-all duration-200 shadow-md active:scale-95"
            >
              <FaEnvelope /> Email Support
            </a>
          </div>

          {/* Back link */}
          <Link to="/pricing" className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all duration-200">
            <FaArrowRight className="rotate-180" /> Back to Pricing
          </Link>
        </aside>

        {/* ── Main content ─────────────────────────── */}
        <main className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-12 lg:p-16 min-h-[70vh]">
          {CONTENT_MAP[activeSection]}

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center sm:justify-between gap-4 text-xs text-slate-400 font-bold">
            <span>&copy; 2026 Team Ignite Universe. All Rights Reserved.</span>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300"><FaShieldAlt /></div>
              <div className="w-8 h-8 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300"><FaLock /></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TermsAndConditions;