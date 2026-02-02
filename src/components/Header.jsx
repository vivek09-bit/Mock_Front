import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { label: "Mock Tests", path: "/dashboard" },
  { label: "Typing", path: "/typing" },
  { label: "FAQ", path: "/faqspage" },
  { label: "About Us", path: "/about" },
  { label: "Contact", path: "/contact" },
];

function Header() {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsSliderOpen(false);
    navigate("/login");
  };

  const toggleSlider = () => setIsSliderOpen((prev) => !prev);
  const closeSlider = () => setIsSliderOpen(false);

  const AuthSection = ({ isMobile = false }) => {
    const containerClasses = isMobile 
      ? "flex flex-col space-y-4 pt-4 border-t border-teal-600 mt-4" 
      : "flex items-center space-x-4";
    
    const linkClasses = isMobile
      ? "block bg-white text-teal-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-center"
      : "bg-white text-teal-700 px-4 py-2 rounded-lg hover:bg-gray-200";

    if (token) {
      return (
        <div className={containerClasses}>
          {user?.username ? (
            <Link to={`/profile/${user.username}`} className={linkClasses} onClick={closeSlider}>
              Profile
            </Link>
          ) : (
            <span className="text-gray-300">Loading profile...</span>
          )}
          <button
            onClick={handleLogout}
            className={`bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 ${isMobile ? "w-full" : ""}`}
          >
            Logout
          </button>
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <Link to="/login" className={linkClasses} onClick={closeSlider}>
          Log In
        </Link>
        <Link
          to="/register"
          className={`bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 text-center ${isMobile ? "w-full" : ""}`}
          onClick={closeSlider}
        >
          Sign Up
        </Link>
      </div>
    );
  };

  return (
    <>
      <header className="bg-teal-700 text-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto flex justify-between items-center p-4">
          <Link to="/" className="text-2xl font-bold">
            TeamIgnite
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex space-x-6">
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="hover:text-gray-200 transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Auth */}
          <div className="hidden md:block">
            <AuthSection />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleSlider}
            aria-label="Toggle navigation"
            className="md:hidden text-white text-3xl focus:outline-none hover:text-teal-200"
          >
            {isSliderOpen ? "✕" : "☰"}
          </button>
        </nav>
      </header>

      {/* Mobile Navigation Slider */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-teal-800 text-white shadow-lg transform transition-transform duration-300 z-50 ${
          isSliderOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={closeSlider}
          className="absolute top-4 right-4 text-3xl focus:outline-none hover:text-teal-200"
        >
          ✕
        </button>

        <nav className="flex flex-col h-full pt-16 px-6">
          <ul className="flex flex-col space-y-4">
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="block text-lg hover:text-teal-200 transition-colors"
                  onClick={closeSlider}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <AuthSection isMobile />
        </nav>
      </aside>

      {/* Overlay */}
      {isSliderOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm transition-opacity"
          onClick={closeSlider}
        ></div>
      )}
    </>
  );
}

export default Header;
