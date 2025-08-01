import React from "react";
// Import your image
import aboutUsImage from '../assets/file_000000001f1c61f8aad746aa9e98a5b3.png';

const AboutUs = () => (
  <section className="bg-gray-50 py-14 px-4 md:px-0">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center bg-white shadow-lg rounded-xl overflow-hidden">
      {/* Left: Textual Content */}
      <div className="flex-1 px-8 py-10 md:p-14">
        <h3 className="uppercase text-xs text-gray-500 tracking-widest mb-3 font-semibold">
          About Us
        </h3>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
          Helping you <span className="text-green-700">succeed</span> through <br className="hidden md:block" />
          accessible resources.
        </h2>
        <p className="text-gray-700 text-lg mb-7">
          TeamIgnite is dedicated to empowering <span className="font-semibold text-green-800">students</span>, <span className="font-semibold text-green-800">aspirants</span>, and <span className="font-semibold text-green-800">working professionals</span> to achieve their goals. Our resources—from <span className="font-semibold">study material</span>, <span className="font-semibold">typing tests</span>, <span className="font-semibold">mock tests</span> and more—support everyone, whether you're pursuing a tech/non-tech path or preparing for government exams.
        </p>
        <a
          href="/signup"
          className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg shadow font-bold hover:bg-green-800 transition"
        >
          Sign Up For Free
        </a>
      </div>
      
      {/* Right: Your Image */}
      <div className="flex-1 bg-gradient-to-br from-green-50 via-white to-white flex items-center justify-center p-8 md:p-10">
        <img 
          src={aboutUsImage} 
          alt="TeamIgnite About Us Illustration" 
          className="w-60 h-60 object-contain rounded-lg shadow-sm"
        />
      </div>
    </div>
  </section>
);

export default AboutUs;
