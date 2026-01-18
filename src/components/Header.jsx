import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsSliderOpen(false);
    navigate("/login/");
  };

  const toggleSlider = () => {
    setIsSliderOpen(!isSliderOpen);
  };

  const closeSlider = () => {
    setIsSliderOpen(false);
  };

  return (
    <>
      <header className="bg-teal-700 text-white shadow-md">
        <nav className="container mx-auto flex justify-between items-center p-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            TeamIgnite
          </Link>

          {/* Navigation Links */}
          <ul className="hidden md:flex space-x-6">
            <li>
              <Link to="/tests" className="hover:text-gray-200">
                Mock Tests
              </Link>
            </li>
            <li>
              <Link to="/typing" className="hover:text-gray-200">
                Typing
              </Link>
            </li>
            
            <li>
              <Link to="/faq" className="hover:text-gray-200">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gray-200">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gray-200">
                Contact
              </Link>
            </li>
          </ul>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <>
                {user && user.username ? (
                  <Link
                    to={`/profile/${user.username}`}
                    className="bg-white text-teal-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Profile
                  </Link>
                ) : (
                  <p>Loading...</p>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-white text-teal-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-500 px-4 py-2 rounded-lg hover:bg-teal-600"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleSlider}
            className="md:hidden text-white text-3xl focus:outline-none"
          >
            ☰
          </button>
        </nav>
      </header>

      {/* Mobile Navigation Slider */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-teal-800 text-white shadow-lg transform transition-transform duration-300 z-50 ${
          isSliderOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={closeSlider}
          className="absolute top-4 right-4 text-3xl focus:outline-none"
        >
          ✕
        </button>

        {/* Slider Navigation Links */}
        <ul className="flex flex-col space-y-4 pt-16 px-6">
          <li>
            <Link
              to="/tests"
              className="block hover:text-teal-200"
              onClick={closeSlider}
            >
              Mock Tests
            </Link>
          </li>
          <li>
            <Link
              to="/typing"
              className="block hover:text-teal-200"
              onClick={closeSlider}
            >
              Typing
            </Link>
          </li>
          <li>
            <Link
              to="/faq"
              className="block hover:text-teal-200"
              onClick={closeSlider}
            >
              FAQ
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="block hover:text-teal-200"
              onClick={closeSlider}
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="block hover:text-teal-200"
              onClick={closeSlider}
            >
              Contact
            </Link>
          </li>

          {/* Slider Auth Buttons */}
          <div className="border-t border-teal-600 pt-4 mt-4">
            {token ? (
              <>
                {user && user.username ? (
                  <Link
                    to={`/profile/${user.username}`}
                    className="block bg-white text-teal-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-center mb-3"
                    onClick={closeSlider}
                  >
                    Profile
                  </Link>
                ) : (
                  <p className="text-center mb-3">Loading...</p>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block bg-white text-teal-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-center mb-3"
                  onClick={closeSlider}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="block bg-teal-500 px-4 py-2 rounded-lg hover:bg-teal-600 text-center"
                  onClick={closeSlider}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </ul>
      </div>

      {/* Overlay */}
      {isSliderOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSlider}
        ></div>
      )}
    </>
  );
}

export default Header;
