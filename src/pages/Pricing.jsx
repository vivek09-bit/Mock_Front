import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle, FaRocket, FaGem, FaBolt,
  FaUserGraduate, FaChalkboardTeacher, FaArrowRight,
  FaQuestionCircle, FaShieldAlt
} from "react-icons/fa";

/* ── Data ────────────────────────────────────────────────── */
const studentPlans = [
  {
    name: "Starter Pack",
    price: "₹199",
    credits: "10 Credits",
    description: "Perfect for a quick practice session before your exam.",
    features: ["Unlock 10 Premium Tests", "Basic Performance Analytics", "7-Day Validity", "Standard Support"],
    icon: <FaBolt className="text-yellow-500" />,
    popular: false,
  },
  {
    name: "Pro Pack",
    price: "₹499",
    credits: "50 Credits",
    description: "Most popular choice for dedicated aspirants.",
    features: ["Unlock 50 Premium Tests", "Advanced AI Analytics", "Personalized Goal Tracking", "Priority Support", "30-Day Validity"],
    icon: <FaGem className="text-indigo-500" />,
    popular: true,
  },
  {
    name: "Elite Pack",
    price: "₹899",
    credits: "Unlimited*",
    description: "Complete mastery with unlimited access to everything.",
    features: ["Unlimited Test Unlocks", "AI Mentorship Insights", "Live Battle Pass", "All Future Updates", "90-Day Validity"],
    icon: <FaRocket className="text-purple-500" />,
    popular: false,
  },
];

const instructorPlans = [
  {
    name: "Beta Early Access",
    price: "Free",
    limit: "Unlimited Students",
    description: "Grow your presence with IgniteVerse's core tools at no cost.",
    features: ["Create Unlimited Mock Tests", "Host Live Battles", "Student Performance Dashboard", "Private Test Hosting", "Early Adopter Badge"],
    icon: <FaBolt className="text-teal-500" />,
    status: "Live",
  },
  {
    name: "Educator Pro",
    price: "Coming Soon",
    limit: "Advanced Tools",
    description: "Powerful insights and custom branding for full-time tutors.",
    features: ["Custom Branding & Logos", "CSV Student Data Exports", "Sub-accounts for Staff", "Priority AI Support", "Advanced Proctoring"],
    icon: <FaChalkboardTeacher className="text-slate-400" />,
    status: "Waitlist",
  },
];

const faqs = [
  { q: "When do instructors start paying?", a: "Early adopters join Beta for free. Pricing for advanced tools will be announced in Late 2026." },
  { q: "Do credits ever expire?",           a: "No. Purchased credits stay in your account forever until you use them to unlock mock tests." },
  { q: "Can I get a refund?",               a: "Yes — 7-day full refund if you haven't unlocked any premium test. See our Refund Policy for details." },
];

/* ── Component ───────────────────────────────────────────── */
const Pricing = () => {
  const [view, setView] = useState("student");
  const plans = view === "student" ? studentPlans : instructorPlans;
  const accentStudent = "text-indigo-600";
  const accentInstr   = "text-teal-600";

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-14 sm:py-20 space-y-20">

        {/* ── Hero ──────────────────────────────── */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <span className="inline-block text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
            Ignite Your Potential
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Battle Path
            </span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Whether you're an aspiring student or a master educator, we have the tools to ignite your success.
          </p>
        </div>

        {/* ── Toggle ────────────────────────────── */}
        <div className="flex justify-center">
          <div className="p-1.5 bg-white rounded-2xl shadow-md border border-slate-100 flex gap-1">
            {[
              { id: "student",    label: "For Students",    icon: <FaUserGraduate /> },
              { id: "instructor", label: "For Instructors", icon: <FaChalkboardTeacher /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  view === tab.id
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className={view === tab.id ? (tab.id === "student" ? "text-blue-400" : "text-purple-400") : ""}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Plan Cards ────────────────────────── */}
        <div className={`grid gap-6 ${plans.length === 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2 max-w-4xl mx-auto"}`}>
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative bg-white rounded-3xl p-8 border flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                plan.popular
                  ? "border-indigo-400 ring-2 ring-indigo-200 shadow-xl shadow-indigo-100/60"
                  : "border-slate-100 shadow-md"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-5 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/30">
                  Most Popular
                </div>
              )}

              {/* Live / Waitlist badge */}
              {plan.status && (
                <div className={`absolute top-6 right-6 inline-flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full ${
                  plan.status === "Live"
                    ? "text-teal-700 bg-teal-50 border border-teal-100"
                    : "text-slate-400 bg-slate-50 border border-slate-100"
                }`}>
                  {plan.status === "Live" && <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />}
                  {plan.status}
                </div>
              )}

              {/* Icon */}
              <div className="text-4xl mb-5">{plan.icon}</div>

              {/* Name & desc */}
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{plan.name}</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-7 pb-7 border-b border-slate-100">
                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                {plan.credits && <span className="text-slate-400 font-semibold ml-2 text-sm">/ {plan.credits}</span>}
                {plan.limit   && <span className="text-slate-400 font-semibold ml-2 text-sm">/ {plan.limit}</span>}
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <FaCheckCircle className={view === "student" ? accentStudent : accentInstr} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                disabled={plan.status === "Waitlist"}
                className={`w-full py-4 rounded-2xl font-black text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group ${
                  plan.popular
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30"
                    : plan.status === "Waitlist"
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : view === "student"
                    ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    : "bg-teal-50 text-teal-600 hover:bg-teal-100"
                }`}
              >
                {plan.status === "Waitlist" ? "Join Waitlist" : "Get Started"}
                {plan.status !== "Waitlist" && <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm" />}
              </button>
            </div>
          ))}

          {/* Institutional CTA — student view only */}
          {view === "student" && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group border border-slate-700 flex flex-col">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Group Study?</h4>
              <h3 className="text-2xl font-black mb-4 tracking-tight">Institutional<br />Bulk License</h3>
              <p className="text-indigo-100/80 text-sm font-medium leading-relaxed mb-8 flex-1">
                Buying for a coaching center or student group? Get custom credit quotes and sub-account management.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-400 transition-all self-start"
              >
                Talk to Sales <FaArrowRight />
              </Link>
            </div>
          )}
        </div>

        {/* ── How It Works ──────────────────────── */}
        <section className="pt-16 border-t border-slate-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Simple as <span className="text-indigo-600">1-2-3</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            {[
              { n: "01", title: "Purchase Credits",  body: "Instant recharge using UPI, Card, or NetBanking once live." },
              { n: "02", title: "Choose Tests",       body: "Browse our premium library and unlock tests that matter to you." },
              { n: "03", title: "Battle Hard",        body: "Take the mock test or join a live session to ace your preparation." },
            ].map(step => (
              <div key={step.n} className="group space-y-4">
                <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center text-xl font-black text-slate-400 shadow-md border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all duration-200">
                  {step.n}
                </div>
                <h4 className="text-lg font-black text-slate-900">{step.title}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────── */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-md p-8 sm:p-12 relative overflow-hidden">
          <FaQuestionCircle className="absolute top-8 right-8 text-slate-50 text-8xl pointer-events-none" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8 relative z-10">Common Questions</h2>
          <div className="space-y-0 divide-y divide-slate-100 relative z-10">
            {faqs.map((faq, i) => (
              <div key={i} className="py-6 first:pt-0 last:pb-0">
                <h4 className="font-black text-slate-900 mb-2">{faq.q}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer link ────────────────────────── */}
        <div className="text-center pb-4 space-y-4">
          <div className="flex items-center justify-center gap-3 flex-wrap text-sm text-slate-400 font-medium">
            <FaShieldAlt className="text-slate-300" />
            <Link to="/page/terms-portal" className="hover:text-indigo-600 transition-colors underline">Terms & Conditions</Link>
            <span>·</span>
            <Link to="/page/terms-portal" className="hover:text-indigo-600 transition-colors underline">Privacy Policy</Link>
            <span>·</span>
            <Link to="/page/terms-portal" className="hover:text-indigo-600 transition-colors underline">Refund Policy</Link>
          </div>
          <Link
            to="/tests"
            className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-indigo-600 transition-colors uppercase text-xs tracking-widest"
          >
            Go back to test library <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
