import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { apiBase } = useContext(ThemeContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    
    if (!token) {
      // User is not logged in
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    // User is logged in, fetch tests
    setIsLoggedIn(true);
    axios
      .get(`${apiBase}/api/test`)
      .then((response) => {
        setTests(response.data);
        setLoading(false);
      })
      .catch((err) => {
        // Handle fetch errors silently
        setLoading(false);
      });
  }, [apiBase]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600 animate-pulse">Loading tests...</p>
      </div>
    );

  // If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-teal-50 to-teal-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Please log in to view and take tests.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-teal-600 hover:bg-teal-900 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Available Tests
        </h2>
        {(() => {
          try {
            const userStr = localStorage.getItem("user");
            const user = userStr ? JSON.parse(userStr) : null;
            if (user && user.username) {
              return (
                <button
                  onClick={() => navigate(`/profile/${user.username}`, { state: { activeTab: "analytics" } })}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all flex items-center"
                >
                  📊 View My Analytics
                </button>
              );
            }
          } catch (e) {
            console.error("Error parsing user for analytics button:", e);
          }
          return null;
        })()}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div
            key={test._id}
            className="bg-white shadow-md rounded-lg p-5 border border-gray-200 hover:shadow-lg transition-all"
          >
            <h3 className="text-xl font-semibold text-blue-700">{test.name}</h3>
            <p className="text-gray-600 mt-2">{test.description}</p>

            <Link
              to={`/take-test/${test._id}`}
              className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-all"
            >
              Start Test
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestList;
