import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ emailOrUsername: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("https://mock-backend-8zgl.onrender.com/api/auth/login", formData);

      if (!response.data.token) {
        throw new Error("Token not received");
      }

      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate(`/profile/${response.data.user.username}`);
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-400 to-teal-600 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-teal-700">Login</h2>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6">
          {/* Email or Username */}
          <div className="mb-4">
            <input
              type="text"
              name="emailOrUsername"
              placeholder="Email or Username"
              value={formData.emailOrUsername}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          {/* Forgot Password */}
          <div className="text-right mb-4">
            <a href="/forgot-password" className="text-teal-500 text-sm hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition duration-300"
          >
            Log In
          </button>
        </form>

        {/* OR Divider */}
        <div className="my-4 flex items-center justify-center">
          <div className="w-full border-b border-gray-300"></div>
          <span className="px-2 text-gray-500">OR</span>
          <div className="w-full border-b border-gray-300"></div>
        </div>

        {/* Google Login Button */}
        <button
          className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-5 h-5 mr-2" />
          Login with Google
        </button>

        {/* Signup Link */}
        <div className="text-center mt-4">
          <a href="/register" className="text-teal-800 text-sm hover:underline">
            Create an account?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
