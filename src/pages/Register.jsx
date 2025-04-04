import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    termsAccepted: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "https://mock-backend-8zgl.onrender.com/api/auth/register",
        formData
      );
      setSuccess(response.data.message);
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        termsAccepted: false,
      });
      navigate("/login/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  // Google OAuth Handler (Mock)
  const handleGoogleSignUp = () => {
    alert("Redirecting to Google Sign-Up...");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-400 to-teal-600 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-teal-700">
          Create an Account
        </h2>

        {/* Error & Success Messages */}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        {success && <p className="text-green-500 text-center mt-2">{success}</p>}

        <form onSubmit={handleSubmit} className="mt-6">
          {/* Name */}
          <div className="mb-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          {/* Username */}
          <div className="mb-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
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

          {/* Phone */}
          <div className="mb-4">
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          {/* Terms Checkbox */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mr-2"
              required
            />
            <label className="text-gray-600 text-sm">
              I accept the{" "}
              <a href="#" className="text-teal-500 font-medium">
                Terms & Conditions
              </a>
            </label>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition duration-300"
          >
            Sign Up
          </button>

          {/* Google Sign-Up */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition duration-300"
            >
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#4285F4"
                  d="M24 9.5c3.69 0 6.9 1.26 9.48 3.4L38.83 9C34.82 5.63 29.82 3.5 24 3.5 14.85 3.5 6.99 9.14 3.15 17.07l7.27 5.62C12.28 16.69 17.63 9.5 24 9.5z"
                />
                <path
                  fill="#34A853"
                  d="M46.5 24c0-1.45-.13-2.85-.38-4.19H24v8.19h12.76c-.58 3.18-2.18 5.86-4.55 7.69l7.27 5.61C43.01 37.78 46.5 31.59 46.5 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.42 28.69A14.87 14.87 0 0 1 9.5 24c0-1.63.27-3.2.77-4.62l-7.28-5.61A23.85 23.85 0 0 0 .5 24c0 3.85.89 7.48 2.5 10.69l7.27-5.61z"
                />
                <path
                  fill="#EA4335"
                  d="M24 46.5c6.46 0 11.83-2.14 15.77-5.82l-7.27-5.61c-2.04 1.44-4.64 2.3-7.5 2.3-6.37 0-11.72-4.19-13.58-9.81l-7.28 5.62C9 38.86 16.86 46.5 24 46.5z"
                />
              </svg>
              Sign Up with Google
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-2">
            <a href="/login" className="text-teal-500 text-sm">
              Already have an account? Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
