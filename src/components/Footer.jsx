import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaShieldAlt, FaLock } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-blue-700 text-white border-t border-blue-600 mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Left – Brand */}
          <div className="text-center md:text-left">
            <p className="font-black text-base tracking-tight">IgniteVerse</p>
            <p className="text-xs text-blue-200 mt-0.5">&copy; 2026 Team Ignite. All Rights Reserved.</p>
            <div className="flex gap-4 mt-2.5 justify-center md:justify-start">
              <Link to="/page/terms-portal" className="text-xs text-blue-200 hover:text-white underline underline-offset-2 decoration-blue-400 transition-colors">Terms & Conditions</Link>
              <Link to="/page/terms-portal" className="text-xs text-blue-200 hover:text-white underline underline-offset-2 decoration-blue-400 transition-colors">Privacy Policy</Link>
              <Link to="/pricing" className="text-xs text-blue-200 hover:text-white underline underline-offset-2 decoration-blue-400 transition-colors">Pricing</Link>
            </div>
          </div>

          {/* Right – Credit */}
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <div className="flex items-center gap-2 opacity-60">
              <FaShieldAlt className="text-[10px]" />
              <FaLock className="text-[10px]" />
            </div>
            <span>Developer's</span>
            <a
              href="https://teamignite.in"
              className="text-white font-bold hover:text-blue-200 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Team Ignite
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
