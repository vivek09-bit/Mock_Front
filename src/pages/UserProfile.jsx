import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { FaCheckCircle } from "react-icons/fa"; 
import UserAnalytics from "../components/UserAnalytics";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [testRecords, setTestRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Set default tab based on path or state
  const isAnalyticsRoute = location.pathname === '/analytics';
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || (isAnalyticsRoute ? "analytics" : "history"));

  const { apiBase } = useContext(ThemeContext);
  const inFlight = useRef(new Set());

  useEffect(() => {
    // If routing to /analytics, force tab to analytics
    if (isAnalyticsRoute) {
        setActiveTab("analytics");
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log("UserProfile effect", { username, storedUser, path: location.pathname });

    // Handle "me", "undefined", or missing username (mapped to authenticated user)
    const isMe = !username || username === 'me' || username === 'undefined';

    if (storedUser && (isMe ? true : storedUser.username === username)) {
      console.log("Using storedUser for profile", storedUser);
      setUser(storedUser);
      if (storedUser?._id) {
        fetchUserTests(storedUser._id);
      } else {
        fetchUserProfile();
      }
      setLoading(false);
    } else {
      fetchUserProfile();
    }
  }, [username, location.pathname]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      let response;
      
      const isMe = !username || username === 'me' || username === 'undefined';
      
      if (isMe) {
          if (!token) throw new Error("Authentication required");
          response = await axios.get(`${apiBase}/api/auth/profile`, { 
              headers: { Authorization: `Bearer ${token}` } 
          });
          if (response.data.user) response.data = response.data.user;
      } else {
          response = await axios.get(`${apiBase}/api/auth/profile/${username}`);
      }

      console.log("fetchUserProfile response", { status: response.status, dataId: response.data?._id });
      setUser(response.data);
      if (response.data?._id) fetchUserTests(response.data._id);
    } catch (err) {
      setError(err.response?.data?.message || "User not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTests = async (userId) => {
    if (!userId) return;

    // Skip if already in-flight for this userId
    if (inFlight.current.has(userId)) {
      console.log("Skipping duplicate fetchUserTests for", userId);
      return;
    }

    inFlight.current.add(userId);
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const url = `${apiBase}/api/user/tests/${userId}`;
      console.log("Fetching user tests", { userId, url, hasToken: !!token });

      const response = await axios.get(url, { headers });
      console.log("Fetch user tests response:", response?.status, response?.data);
      const records = response.data.records || response.data || [];
      if (Array.isArray(records)) {
        setTestRecords(records);
      } else {
        console.error("Expected array of records but got:", typeof records);
        setTestRecords([]);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Expected for new users (until backend restart)
        setTestRecords([]);
        return;
      }
      console.error("Test fetch failed:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      try { console.debug("Error response text:", err.response?.data); } catch (e) {}
      setTestRecords([]);
    } finally {
      inFlight.current.delete(userId);
    }
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

            {/* Tabs for Test History & Analytics */}
            <div className="mt-8 w-full">
              <div className="flex justify-center space-x-4 border-b border-gray-300 pb-2 mb-4">
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-2 font-semibold text-lg transition-colors ${
                    activeTab === "history"
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-gray-500 hover:text-teal-500"
                  }`}
                >
                  📜 Test History
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`px-4 py-2 font-semibold text-lg transition-colors ${
                    activeTab === "analytics"
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-gray-500 hover:text-teal-500"
                  }`}
                >
                  📊 Analytics
                </button>
              </div>

              {activeTab === "history" ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">📚 Test History</h3>
                  {testRecords.length > 0 ? (
                    <ul className="space-y-4">
                      {testRecords.map((test, index) => {
                        if (!test) return null;
                        const testName = test?.testDetails?.testName || "Unknown Test";
                        const bestScore = test?.bestScore || 0;
                        const passingScore = test?.testDetails?.passingScore || 0;
                        const attemptsCount = test?.attempts?.length || 0;
                        const passed = test?.testDetails && bestScore >= passingScore;

                        return (
                          <li key={index} className="bg-gray-100 p-4 rounded-lg shadow-md flex justify-between items-center">
                            <div>
                              <p className="font-medium text-lg text-black">{testName}</p>
                              <p className="text-sm text-gray-600">Best Score: <span className="text-green-600">{bestScore}</span></p>
                              <p className="text-sm text-gray-600">Attempts: {attemptsCount}</p>
                            </div>
                            {passed ? (
                              <FaCheckCircle className="text-green-500 text-2xl" />
                            ) : (
                              <span className="text-red-500 text-sm">Retry Needed</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No test records found.</p>
                  )}
                </>
              ) : (
                <UserAnalytics testRecords={testRecords} />
              )}
            </div>


          </div>
        ) : (
          <div className="text-center text-gray-700">No user found.</div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
