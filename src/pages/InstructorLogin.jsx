import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

const InstructorLogin = () => {
    const [formData, setFormData] = useState({ emailOrUsername: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { apiBase } = useContext(ThemeContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(`${apiBase}/api/auth/login`, formData);
            const { token, user } = response.data;

            if (user.role !== 'ins' && user.role !== 'ad') {
                setError("Access Denied: This portal is for educators and administrators only.");
                setLoading(false);
                return;
            }

            localStorage.setItem("authToken", token);
            localStorage.setItem("user", JSON.stringify(user));

            navigate("/dashboard"); // Or instructor specific dashboard if exists
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-sans selection:bg-indigo-500 selection:text-white">
            <div className="relative w-full max-w-lg">
                {/* Decorative background elements */}
                <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative bg-[#1e293b] border border-slate-700 shadow-2xl rounded-2xl overflow-hidden">
                    <div className="px-8 pt-10 pb-12">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                                Educator Portal
                            </h1>
                            <p className="mt-2 text-slate-400 font-medium">
                                Manage your students, classes and assessments
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm flex items-center">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Email or Username</label>
                                <input
                                    type="text"
                                    name="emailOrUsername"
                                    required
                                    value={formData.emailOrUsername}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
                                    placeholder="Enter your credentials"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Link to="/forgot-password/instructor" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    "Sign in to Dashboard"
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center flex flex-col gap-3">
                            <p className="text-slate-400 text-sm">
                                Not an educator? {" "}
                                <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                                    Student Login
                                </Link>
                            </p>
                            <p className="text-slate-400 text-sm">
                                New here? {" "}
                                <Link to="/instructor-register" className="font-bold text-teal-400 hover:text-teal-300 underline underline-offset-4">
                                    Create Educator Account
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Bottom bar for aesthetic touch */}
                    <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500"></div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-xs">
                        &copy; 2026 Ignite Verse Education Group. Internal access only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InstructorLogin;
