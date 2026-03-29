import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

const InstructorRegister = () => {
    const [step, setStep] = useState(1);
    const [verificationToken, setVerificationToken] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        otp: "",
        institution: "",
        designation: "",
        termsAccepted: false,
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { apiBase } = useContext(ThemeContext);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await axios.post(`${apiBase}/api/verification/initiate`, { email: formData.email });
            setSuccess("Verification code sent to your email.");
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send verification code.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(`${apiBase}/api/verification/verify`, {
                email: formData.email,
                otp: formData.otp,
            });
            setVerificationToken(response.data.verificationToken);
            setSuccess("Email verified! Let's complete your professional profile.");
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired code.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        if (!formData.termsAccepted) return setError("Please accept the terms to proceed.");
        setLoading(true);

        try {
            await axios.post(`${apiBase}/api/auth/register`, {
                ...formData,
                verificationToken,
                role: "ins" // Explicitly setting role as instructor
            });
            setSuccess("Account created successfully! Redirecting to login...");
            setTimeout(() => navigate("/instructor-login"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white p-4">
            <div className="relative w-full max-w-lg">
                <div className="absolute -top-10 -left-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

                <div className="relative bg-[#1e293b] border border-slate-700 shadow-2xl rounded-2xl overflow-hidden">
                    <div className="px-8 pt-10 pb-12">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                                {step === 1 ? "Educator Sign Up" : step === 2 ? "Verify Official Email" : "Complete Educator Profile"}
                            </h1>
                            <p className="mt-2 text-slate-400 font-medium">
                                Join our global network of teachers & schools
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 rounded-lg bg-teal-500/10 border border-teal-500/50 text-teal-400 text-sm">
                                {success}
                            </div>
                        )}

                        {step === 1 && (
                            <form onSubmit={handleSendCode} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Work Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition duration-200"
                                        placeholder="you@institution.com"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition duration-300 disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : "Continue to Verification"}
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="text-center text-slate-400 text-sm mb-4">
                                    A verification code has been sent to <br/><span className="text-white font-bold">{formData.email}</span>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="otp"
                                        required
                                        value={formData.otp}
                                        onChange={handleChange}
                                        maxLength="6"
                                        className="block w-full px-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white text-center text-2xl tracking-[1em] focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="000000"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition"
                                >
                                    {loading ? "Verifying..." : "Verify & Continue"}
                                </button>
                                <button type="button" onClick={() => setStep(1)} className="w-full text-slate-500 text-xs hover:text-slate-300">
                                    Use a different email address
                                </button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleRegister} className="space-y-5">
                                <div className="grid grid-cols-1 gap-4">
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        placeholder="Username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        placeholder="Safe Password (min 6 characters)"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        name="institution"
                                        placeholder="School / Institution Name"
                                        value={formData.institution}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        name="designation"
                                        placeholder="Designation (e.g. Class Teacher, Physics Faculty)"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        name="phone"
                                        required
                                        placeholder="Contact Number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div className="flex items-start mt-4">
                                    <div className="flex items-center h-5">
                                        <input
                                            name="termsAccepted"
                                            type="checkbox"
                                            required
                                            checked={formData.termsAccepted}
                                            onChange={handleChange}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-700 rounded bg-slate-900"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label className="font-medium text-slate-400">
                                            I agree to the <Link to="/terms" className="text-indigo-400 hover:text-indigo-300">Instructor Terms of Service</Link>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition"
                                >
                                    {loading ? "Finalizing Account..." : "Create Educator Account"}
                                </button>
                            </form>
                        )}

                        <div className="mt-8 text-center">
                            <p className="text-slate-400 text-sm font-medium">
                                Already have an account? {" "}
                                <Link to="/instructor-login" className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-4">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500"></div>
                </div>
            </div>
        </div>
    );
};

export default InstructorRegister;
