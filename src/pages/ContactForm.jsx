import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { FaEnvelope, FaPaperPlane, FaUser, FaTag, FaCommentDots, FaGlobe, FaTwitter, FaLinkedin, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function ContactForm() {
    const { apiBase } = useContext(ThemeContext);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState({ loading: false, success: null, error: null });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: null, error: null });

        try {
            const base = apiBase || '';
            await axios.post(`${base}/api/contact`, form);
            setStatus({ loading: false, success: 'Message sent. Thank you!', error: null });
            setForm({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus({ loading: false, success: null, error: null }), 5000);
        } catch (err) {
            console.error('Contact submit error', err);
            setStatus({ loading: false, success: null, error: err?.response?.data?.error || 'Failed to send message' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-8 lg:px-16 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-200/30 blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-200/30 blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <span className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest mb-4">
                        <FaEnvelope /> Get in Touch
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Let's start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">conversation</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium">
                        Have a question about IgniteVerse? Need tailored solutions for your institute? Our team is here to help.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                    {/* Contact Info Sidebar */}
                    <div className="w-full lg:w-1/3 space-y-8">
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                           <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            
                            <h3 className="text-2xl font-black text-slate-900 mb-6 relative z-10">Contact Information</h3>
                            
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shrink-0 border border-indigo-100">
                                        <FaEnvelope />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Us</p>
                                        <a href="mailto:support@igniteverse.in" className="text-slate-800 font-bold hover:text-indigo-600 transition-colors">support@igniteverse.in</a>
                                        <p className="text-xs text-slate-500 mt-1">We usually reply within 24 hours.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0 border border-purple-100">
                                        <FaGlobe />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">HQ / Virtual Office</p>
                                        <p className="text-slate-800 font-bold">New Delhi, India</p>
                                        <p className="text-xs text-slate-500 mt-1">Operating globally</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Connect */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white border border-indigo-500/30 shadow-xl shadow-indigo-500/20">
                            <h3 className="text-lg font-black mb-4">Connect with us</h3>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10 hover:border-white/30">
                                    <FaTwitter />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10 hover:border-white/30">
                                    <FaLinkedin />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Form Area */}
                    <div className="w-full lg:w-2/3 bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                        {status.success && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 animate-fadeIn">
                                <FaCheckCircle className="text-xl" />
                                <span className="font-bold">{status.success}</span>
                            </div>
                        )}
                        {status.error && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 animate-fadeIn">
                                <FaExclamationCircle className="text-xl" />
                                <span className="font-bold">{status.error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <FaUser className="text-indigo-400" /> Full Name
                                    </label>
                                    <input 
                                        name="name" 
                                        type="text"
                                        value={form.name} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="John Doe"
                                        className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border text-sm font-medium border-slate-200 focus:border-indigo-500 rounded-2xl px-5 py-4 outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400" 
                                    />
                                </div>
                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <FaEnvelope className="text-indigo-400" /> Email Address
                                    </label>
                                    <input 
                                        name="email" 
                                        type="email" 
                                        value={form.email} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="john@example.com"
                                        className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border text-sm font-medium border-slate-200 focus:border-indigo-500 rounded-2xl px-5 py-4 outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400" 
                                    />
                                </div>
                            </div>

                            {/* Subject Input */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <FaTag className="text-indigo-400" /> Subject
                                </label>
                                <input 
                                    name="subject" 
                                    type="text"
                                    value={form.subject} 
                                    onChange={handleChange} 
                                    required
                                    placeholder="How can we help you?"
                                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border text-sm font-medium border-slate-200 focus:border-indigo-500 rounded-2xl px-5 py-4 outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400" 
                                />
                            </div>

                            {/* Message Input */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <FaCommentDots className="text-indigo-400" /> Message
                                </label>
                                <textarea 
                                    name="message" 
                                    value={form.message} 
                                    onChange={handleChange} 
                                    required 
                                    rows={5} 
                                    placeholder="Tell us more about your inquiry..."
                                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border text-sm font-medium border-slate-200 focus:border-indigo-500 rounded-2xl px-5 py-4 outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 resize-none" 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={status.loading} 
                                className="w-full bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {status.loading ? 'Sending Message...' : 'Send Message'}
                                {!status.loading && <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}