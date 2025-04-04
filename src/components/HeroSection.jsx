import React from "react";
import { FaChalkboardTeacher, FaUsers, FaBook, FaStar, FaRocket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 text-gray-200">
      {/* 🌟 Hero Section */}
      <header className="relative bg-gradient-to-r from-teal-700 to-teal-900 text-white py-24 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-5xl font-extrabold md:text-6xl leading-tight">
            Unlock Your Future with <span className="text-teal-300">Next-Gen Learning</span>
          </h1>
          <p className="mt-4 text-lg text-teal-100">
            Learn in-demand skills with top educators, AI-powered insights, and real-world projects.
          </p>
          <button
            className="mt-6 bg-teal-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-teal-500 transition"
            onClick={() => navigate("/signup")}
          >
            Get Started Now
          </button>
        </div>
      </header>

      {/* 💡 Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Why Choose Our Platform?</h2>
          <p className="text-teal-400 mt-2">Personalized, AI-driven, and career-oriented learning.</p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<FaChalkboardTeacher className="text-teal-400 text-5xl" />}
              title="Top-Tier Instructors"
              description="Learn from industry-leading professionals with real experience."
            />
            <FeatureCard
              icon={<FaUsers className="text-green-400 text-5xl" />}
              title="Community & Mentorship"
              description="Join a thriving network of learners and mentors."
            />
            <FeatureCard
              icon={<FaBook className="text-yellow-400 text-5xl" />}
              title="AI-Powered Learning"
              description="Smart, adaptive courses tailored for success."
            />
          </div>
        </div>
      </section>

      {/* 🌟 Testimonials */}
      <section className="bg-teal-800 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">What Our Learners Say</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            <Testimonial name="Samantha Lee" feedback="This platform helped me land my dream job with confidence!" />
            <Testimonial name="Ryan Carter" feedback="Interactive lessons and AI-driven insights made learning fun and effective!" />
          </div>
        </div>
      </section>

      {/* 🚀 Call-to-Action Section */}
      <section className="py-20 text-center bg-gray-900">
        <h2 className="text-3xl font-bold text-white">Your Journey Starts Here</h2>
        <p className="text-teal-400 mt-2">Join thousands of learners mastering future-ready skills.</p>
        <button
          className="mt-6 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
          onClick={() => navigate("/signup")}
        >
          Start Learning Today
        </button>
      </section>

      {/* 🌍 Footer */}
      <footer className="bg-gray-800 text-white py-8 text-center">
        <p className="text-teal-300">&copy; 2024 NextGen Learning. All rights reserved.</p>
      </footer>
    </div>
  );
};

// 📌 Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-gray-900 shadow-md p-6 rounded-lg text-center transition transform hover:scale-105">
    {icon}
    <h3 className="text-xl font-bold mt-4 text-white">{title}</h3>
    <p className="text-gray-400 mt-2">{description}</p>
  </div>
);

// 📌 Testimonial Component
const Testimonial = ({ name, feedback }) => (
  <div className="bg-gray-900 text-white p-6 rounded-lg shadow-md max-w-xs transition transform hover:scale-105">
    <p className="text-lg italic">"{feedback}"</p>
    <h4 className="mt-4 font-bold text-teal-400">{name}</h4>
  </div>
);

export default HeroSection;
