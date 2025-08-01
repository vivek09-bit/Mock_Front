import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login/");
  };

  return (
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
            <Link to="/study-material" className="hover:text-gray-200">
              Study Material
            </Link>
          </li>
          <li>
            <Link to="/FAQsPage" className="hover:text-gray-200">
              FAQs
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
        <div className="flex items-center space-x-4">
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
      </nav>
    </header>
  );
}

export default Header;
