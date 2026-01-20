import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  // Steps: 1 = Email Input, 2 = Verify OTP, 3 = Complete Profile
  const [step, setStep] = useState(1);
  const [verificationToken, setVerificationToken] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    otp: "",
    termsAccepted: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const base = import.meta.env.VITE_BACKEND || "";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // Step 1: Send Verification Code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${base}/api/verification/initiate`, { email: formData.email });
      setSuccess("Verification code sent! Please check your email.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${base}/api/verification/verify`, {
        email: formData.email,
        otp: formData.otp,
      });
      
      setVerificationToken(response.data.verificationToken);
      setSuccess("Email verified successfully! Please complete your profile.");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate remaining fields
    const { name, username, password, phone, termsAccepted } = formData;
    if (!name || !username || !password || !phone) return setError("All fields are required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (!termsAccepted) return setError("You must accept the Terms & Conditions.");

    setLoading(true);

    try {
      const response = await axios.post(`${base}/api/auth/register`, {
        ...formData,
        verificationToken, // Include the proof of verification
      });

      setSuccess(response.data.message);
      // Clear sensitive data
      setFormData({ ...formData, password: "", otp: "" });
      
      // Delay to show success message before redirect
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-50 to-teal-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-teal-700 mb-6">
          {step === 1 ? "Sign Up" : step === 2 ? "Verify Email" : "Complete Profile"}
        </h2>

        {error && <p className="text-red-500 text-center mb-4 text-sm font-medium">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4 text-sm font-medium">{success}</p>}

        {/* STEP 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${loading ? "bg-gray-400" : "bg-teal-600 hover:bg-teal-700"}`}
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
            <div className="text-center mt-2">
              <a href="/login" className="text-teal-500 text-sm">Already have an account? Login</a>
            </div>
          </form>
        )}

        {/* STEP 2: OTP Input */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
             <div className="text-center text-gray-600 text-sm mb-4">
              We sent a code to <strong>{formData.email}</strong>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Enter Verification Code</label>
              <input
                type="text"
                name="otp"
                placeholder="6-digit code"
                value={formData.otp}
                onChange={handleChange}
                maxLength="6"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-center tracking-widest text-xl"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${loading ? "bg-gray-400" : "bg-teal-600 hover:bg-teal-700"}`}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
            
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Change Email
            </button>
          </form>
        )}

        {/* STEP 3: Complete Profile */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 chars)"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="mr-2"
                required
              />
              <label className="text-sm text-gray-600">
                I accept the <a href="/page/terms-portal" className="text-teal-500 font-medium">Terms & Conditions</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${loading ? "bg-gray-400" : "bg-teal-600 hover:bg-teal-700"}`}
            >
              {loading ? "Creating Account..." : "Complete Sign Up"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
