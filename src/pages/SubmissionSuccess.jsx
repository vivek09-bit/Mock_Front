import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaHome } from "react-icons/fa";

const SubmissionSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 text-center border border-slate-100">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaCheckCircle className="text-emerald-500 text-4xl" />
                </div>
                
                <h1 className="text-2xl font-bold text-slate-800 mb-3">Submission Successful!</h1>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Your responses have been securely recorded and sent to your instructor for evaluation. 
                    Results will be shared once the official review phase is complete.
                </p>

                <button 
                    onClick={() => navigate("/")}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98]"
                >
                    <FaHome />
                    Back to Dashboard
                </button>
                
                <p className="mt-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    Powered by Ignite Verse Proctoring
                </p>
            </div>
        </div>
    );
};

export default SubmissionSuccess;
