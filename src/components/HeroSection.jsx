import React from "react";
import { FaChalkboardTeacher, FaUsers, FaBook, FaStar, FaRocket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="text-gray-200">
      {/* 🌟 Hero Section */}
      <header className="relative text-slate-800 py-24 text-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <h1 className="text-5xl font-extrabold md:text-7xl leading-tight">
            Unlock Your Future with <span className="text-yellow-300">Next-Gen Learning</span>
          </h1>
          <p className="mt-4 text-xl text-blue-500 max-w-3xl mx-auto">
            Learn in-demand skills with top educators, AI-powered insights, and real-world projects.
          </p>
          <button
            className="mt-8 bg-gradient-to-r from-blue-400 to-purple-400 text-slate-900 px-8 py-3 rounded-full font-bold hover:shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-105"
            onClick={() => navigate("/dashboard")}
          >
            Get Started Now
          </button>
        </div>
      </header>

      {/* 💡 Features Section */}
      <section className="py-20 bg-gradient-to-b from-blue-700 to-blue-700">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Why Choose Our Platform?</h2>
          <p className="text-purple-300 mt-2 text-lg">Personalized, AI-driven, and career-oriented learning.</p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<FaChalkboardTeacher className="text-blue-400 text-5xl" />}
              title="Top-Tier Instructors"
              description="Learn from industry-leading professionals with real experience."
            />
            <FeatureCard
              icon={<FaUsers className="text-purple-400 text-5xl" />}
              title="Community & Mentorship"
              description="Join a thriving network of learners and mentors."
            />
            <FeatureCard
              icon={<FaBook className="text-blue-300 text-5xl" />}
              title="AI-Powered Learning"
              description="Smart, adaptive courses tailored for success."
            />
          </div>
        </div>
      </section>

      {/* 🌟 Testimonials */}
      <section className="bg-gradient-to-b from-blue-700 to-purple-700 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">What Our Learners Say</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            <Testimonial name="Samantha Lee" feedback="This platform helped me land my dream job with confidence!" />
            <Testimonial name="Ryan Carter" feedback="Interactive lessons and AI-driven insights made learning fun and effective!" />
          </div>
        </div>
      </section>

      {/* 🚀 Call-to-Action Section */}
      <section className="py-20 text-center bg-gradient-to-b from-purple-700 to-purple-700">
        <h2 className="text-3xl font-bold text-white">Your Journey Starts Here</h2>
        <p className="text-purple-300 mt-2 text-lg">Join thousands of learners mastering future-ready skills.</p>
        <button
          className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105"
          onClick={() => navigate("/signup")}
        >
          Start Learning Today
        </button>
      </section>

      {/* 🌍 Footer */}
      <footer className="bg-slate-950 text-white py-8 text-center border-t border-blue-900/30">
        <p className="text-blue-300">&copy; 2026 NextGen Learning. All rights reserved.</p>
      </footer>
    </div>
  );
};

// 📌 Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 shadow-lg p-8 rounded-xl text-center transition transform hover:scale-105 hover:border-purple-500/50 hover:shadow-purple-500/20">
    <div className="flex justify-center">{icon}</div>
    <h3 className="text-xl font-bold mt-4 text-white">{title}</h3>
    <p className="text-gray-300 mt-2">{description}</p>
  </div>
);

// 📌 Testimonial Component
const Testimonial = ({ name, feedback }) => (
  <div className="bg-slate-700/50 backdrop-blur-sm border border-purple-500/20 text-white p-6 rounded-xl shadow-lg max-w-xs transition transform hover:scale-105 hover:border-blue-500/50 hover:shadow-blue-500/20">
    <p className="text-lg italic">"{feedback}"</p>
    <h4 className="mt-4 font-bold text-purple-300">{name}</h4>
  </div>
);

export default HeroSection;
