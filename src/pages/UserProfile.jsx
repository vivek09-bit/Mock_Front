import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSignOutAlt, FaCheckCircle } from "react-icons/fa"; 

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [testRecords, setTestRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser.username === username) {
      setUser(storedUser);
      fetchUserTests(storedUser._id);
      setLoading(false);
    } else {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`https://mock-backend-8zgl.onrender.com/api/auth/profile/${username}`);
      setUser(response.data);
      fetchUserTests(response.data._id);
    } catch (err) {
      setError(err.response?.data?.message || "User not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTests = async (userId) => {
    try {
      const response = await axios.get(`https://mock-backend-8zgl.onrender.com/api/user/tests/${userId}`);
      setTestRecords(response.data);
    } catch (err) {
      setTestRecords([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100"> 
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6 text-black">
        {error && <div className="text-red-500 text-center mb-4 font-semibold">⚠️ {error}</div>}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-500"></div>
          </div>
        ) : user ? (
          <div className="flex flex-col items-center text-center">
            {/* Profile Image */}
            <img
              src={user.profileURL || "/assets/adventurer-1739115902517.svg"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-gray-300 shadow-md"
            />

            {/* User Info */}
            <h2 className="text-3xl font-bold mt-3">{user.name}</h2>
            <p className="text-lg text-gray-600">@{user.username}</p>
            <span className="text-sm bg-gray-200 px-3 py-1 rounded-full mt-2">{user.role}</span>

            <div className="mt-4 w-full px-6 space-y-2 text-gray-700 text-left">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <p><strong>Subscription:</strong> {user.subscription_status === "Active" ? 
                <span className="text-green-600 font-semibold">Active ✅</span> : 
                <span className="text-red-600 font-semibold">Inactive ❌</span>
              }</p>
            </div>

            {/* Test History Section */}
            <div className="mt-6 w-full">
              <h3 className="text-xl font-semibold mb-2 border-b pb-2">📚 Test History</h3>
              {testRecords.length > 0 ? (
                <ul className="space-y-4">
                  {testRecords.map((test, index) => (
                    <li key={index} className="bg-gray-100 p-4 rounded-lg shadow-md flex justify-between items-center">
                      <div>
                        <p className="font-medium text-lg text-black">{test.testDetails.testName}</p>
                        <p className="text-sm text-gray-600">Best Score: <span className="text-green-600">{test.bestScore}</span></p>
                        <p className="text-sm text-gray-600">Attempts: {test.attempts.length}</p>
                      </div>
                      {test.bestScore >= test.testDetails.passingScore ? (
                        <FaCheckCircle className="text-green-500 text-2xl" />
                      ) : (
                        <span className="text-red-500 text-sm">Retry Needed</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No test records found.</p>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="mt-6 flex items-center bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition shadow-md"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-700">No user found.</div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
