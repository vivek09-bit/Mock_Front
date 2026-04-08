import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";

const TokenShop = () => {
    const navigate = useNavigate();
    const { apiBase } = useContext(ThemeContext);
    const token = localStorage.getItem("authToken");

    const [loading, setLoading] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("upi");
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");

    // Indian EdTech Pricing - Rupees
    const packages = [
        {
            id: "starter",
            name: "Starter",
            tokens: 50,
            price: 99,
            bonus: 0,
            savings: 0,
            popular: false,
            description: "Great for trying out",
            icon: "🎯"
        },
        {
            id: "economy",
            name: "Popular",
            tokens: 150,
            price: 199,
            bonus: 30,
            savings: "33%",
            popular: true,
            description: "Most purchased package",
            icon: "⭐",
            badge: "BESTSELLER"
        },
        {
            id: "professional",
            name: "Professional",
            tokens: 350,
            price: 349,
            bonus: 154,
            savings: "44%",
            popular: false,
            description: "Year-long prep",
            icon: "🚀",
            badge: "BEST VALUE"
        },
        {
            id: "ultimate",
            name: "Ultimate",
            tokens: 800,
            price: 599,
            bonus: 440,
            savings: "55%",
            popular: false,
            description: "Maximum savings",
            icon: "👑",
            perks: ["Priority Support", "Monthly Bonus", "Expert Chat Access"]
        }
    ];

    const handlePurchase = (pkg) => {
        setSelectedPackage(pkg);
        setShowPaymentModal(true);
        setError("");
    };

    const handlePayment = async () => {
        if (!selectedPackage) return;

        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                `${apiBase}/api/payment/buy-tokens`,
                { tokenAmount: selectedPackage.tokens },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccessMessage(`✓ Successfully purchased ${selectedPackage.tokens} tokens! (₹${selectedPackage.price})`);
            setShowPaymentModal(false);

            // Auto-redirect after 2 seconds
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-3">Test Your Potential</h1>
                    <p className="text-gray-600 text-lg md:text-xl mb-6">Unlock unlimited mock tests with tokens</p>

                    {/* TRUST SIGNALS */}
                    <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm md:text-base">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">👥</span>
                            <span className="text-gray-700"><strong>100K+</strong> Students</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⭐</span>
                            <span className="text-gray-700"><strong>4.8/5</strong> Rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🎓</span>
                            <span className="text-gray-700"><strong>IIT, NEET</strong> Experts</span>
                        </div>
                    </div>
                </div>

                {/* PACKAGES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`relative rounded-xl transition-all transform hover:scale-105 ${pkg.popular
                                    ? "bg-gradient-to-br from-blue-600 to-blue-700 ring-2 ring-blue-400 shadow-xl scale-105 md:scale-110"
                                    : "bg-white border-2 border-gray-200 shadow-md"
                                }`}
                        >
                            {/* BADGE */}
                            {pkg.badge && (
                                <div className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-bold ${pkg.popular ? "bg-yellow-400 text-gray-900" : "bg-blue-100 text-blue-900"
                                    }`}>
                                    {pkg.badge}
                                </div>
                            )}

                            <div className={`p-6 ${pkg.popular ? "text-white" : "text-gray-900"}`}>
                                {/* ICON & NAME */}
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-3xl">{pkg.icon}</span>
                                    <h3 className="text-xl font-bold">{pkg.name}</h3>
                                </div>

                                {/* DESCRIPTION */}
                                <p className={`text-sm mb-4 ${pkg.popular ? "text-blue-100" : "text-gray-600"}`}>
                                    {pkg.description}
                                </p>

                                {/* TOKENS & PRICE */}
                                <div className="mb-4 border-t border-b py-4" style={{ borderColor: pkg.popular ? "rgba(255,255,255,0.3)" : "#e5e7eb" }}>
                                    <div className="text-3xl font-bold mb-1">{pkg.tokens} <span className="text-lg">tokens</span></div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold">₹{pkg.price}</span>
                                        {pkg.savings && (
                                            <span className={`text-sm font-bold ${pkg.popular ? "bg-yellow-400 text-gray-900 px-2 py-1 rounded" : "text-green-600"}`}>
                                                Save {pkg.savings}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs mt-2">
                                        <span className={pkg.popular ? "text-blue-100" : "text-gray-500"}>
                                            ₹{(pkg.price / pkg.tokens).toFixed(2)}/token
                                        </span>
                                        {pkg.bonus > 0 && (
                                            <div className={`font-bold mt-1 ${pkg.popular ? "text-yellow-300" : "text-green-600"}`}>
                                                + {pkg.bonus} bonus tokens
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* PERKS */}
                                {pkg.perks && (
                                    <ul className="text-sm mb-4 space-y-2">
                                        {pkg.perks.map((perk, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <span>✓</span>
                                                <span className={pkg.popular ? "text-blue-100" : "text-gray-700"}>{perk}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* BUTTON */}
                                <button
                                    onClick={() => handlePurchase(pkg)}
                                    className={`w-full py-3 px-4 rounded-lg font-bold text-base transition-all ${pkg.popular
                                            ? "bg-white text-blue-700 hover:bg-gray-100 transform active:scale-95"
                                            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                                        }`}
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FEATURES */}
                <div className="bg-white rounded-xl shadow-md p-8 mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Students Love Our Tokens</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-4xl mb-3">💰</div>
                            <h3 className="font-bold text-lg mb-2">Transparent Pricing</h3>
                            <p className="text-gray-600">No hidden charges. Pay only for tests you take.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">🎁</div>
                            <h3 className="font-bold text-lg mb-2">Earn Rewards</h3>
                            <p className="text-gray-600">Refer friends and earn tokens as bonus.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">⚡</div>
                            <h3 className="font-bold text-lg mb-2">Instant Access</h3>
                            <p className="text-gray-600">Start taking tests immediately after purchase.</p>
                        </div>
                    </div>
                </div>

                {/* FAQ SECTION */}
                <div className="bg-blue-50 rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked</h2>
                    <div className="space-y-4">
                        <details className="group cursor-pointer">
                            <summary className="flex items-center gap-3 font-bold text-gray-800 group-open:text-blue-700">
                                <span className="text-xl group-open:rotate-180 transition-transform">▶</span>
                                How many tokens do I need for a test?
                            </summary>
                            <p className="ml-6 mt-3 text-gray-600">Full mocks cost 25-30 tokens, practice tests cost 5-10 tokens. Check test details before starting.</p>
                        </details>
                        <details className="group cursor-pointer">
                            <summary className="flex items-center gap-3 font-bold text-gray-800 group-open:text-blue-700">
                                <span className="text-xl group-open:rotate-180 transition-transform">▶</span>
                                Can I get a refund for unused tokens?
                            </summary>
                            <p className="ml-6 mt-3 text-gray-600">30% refund is automatically credited if you fail any paid attempt.</p>
                        </details>
                        <details className="group cursor-pointer">
                            <summary className="flex items-center gap-3 font-bold text-gray-800 group-open:text-blue-700">
                                <span className="text-xl group-open:rotate-180 transition-transform">▶</span>
                                Which payment methods do you accept?
                            </summary>
                            <p className="ml-6 mt-3 text-gray-600">We accept UPI (Google Pay, PhonePe), credit cards, debit cards, and net banking through Razorpay.</p>
                        </details>
                        <details className="group cursor-pointer">
                            <summary className="flex items-center gap-3 font-bold text-gray-800 group-open:text-blue-700">
                                <span className="text-xl group-open:rotate-180 transition-transform">▶</span>
                                Do you offer student discounts?
                            </summary>
                            <p className="ml-6 mt-3 text-gray-600">Yes! Use coupon code STUDY50 for 50 bonus tokens on your first purchase.</p>
                        </details>
                    </div>
                </div>
            </div>

            {/* PAYMENT MODAL */}
            {showPaymentModal && selectedPackage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
                        {/* HEADER */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                            <h2 className="text-2xl font-bold text-white">Confirm Purchase</h2>
                            <p className="text-blue-100 text-sm mt-1">{selectedPackage.name} Package</p>
                        </div>

                        {/* BODY */}
                        <div className="p-6">
                            {/* SUMMARY */}
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <div className="flex justify-between mb-3">
                                    <span className="text-gray-700">{selectedPackage.tokens} tokens</span>
                                    <span className="font-bold text-gray-900">₹{selectedPackage.price}</span>
                                </div>
                                {selectedPackage.bonus > 0 && (
                                    <div className="flex justify-between text-green-700 font-bold">
                                        <span>Bonus tokens</span>
                                        <span>+{selectedPackage.bonus}</span>
                                    </div>
                                )}
                                <div className="border-t border-blue-200 mt-3 pt-3 flex justify-between">
                                    <span className="font-bold text-gray-900">Total:</span>
                                    <span className="text-2xl font-bold text-blue-700">₹{selectedPackage.price}</span>
                                </div>
                            </div>

                            {/* PAYMENT METHOD */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-800 mb-3">Choose Payment Method</label>
                                <div className="space-y-2">
                                    <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400" style={{ borderColor: paymentMethod === "upi" ? "#2563eb" : "#e5e7eb" }}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="upi"
                                            checked={paymentMethod === "upi"}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-3"
                                        />
                                        <span className="text-lg mr-2">📱</span>
                                        <span className="font-bold text-gray-800">UPI (Google Pay, PhonePe)</span>
                                        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">FASTEST</span>
                                    </label>
                                    <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="card"
                                            checked={paymentMethod === "card"}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-3"
                                        />
                                        <span className="text-lg mr-2">💳</span>
                                        <span className="font-bold text-gray-800">Credit/Debit Card</span>
                                    </label>
                                    <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="netbanking"
                                            checked={paymentMethod === "netbanking"}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-3"
                                        />
                                        <span className="text-lg mr-2">🏦</span>
                                        <span className="font-bold text-gray-800">Net Banking</span>
                                    </label>
                                </div>
                            </div>

                            {/* ERROR MESSAGE */}
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}

                            {/* BUTTONS */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : `Pay ₹${selectedPackage.price}`}
                                </button>
                            </div>

                            {/* TRUST BADGE */}
                            <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                                <span>🔒</span>
                                <span>Secure payment via Razorpay</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS MESSAGE */}
            {successMessage && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in fade-in">
                    {successMessage}
                </div>
            )}

            {/* BACK BUTTON */}
            <button
                onClick={() => navigate("/dashboard")}
                className="fixed bottom-6 left-6 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-bold"
            >
                ← Go Back
            </button>
        </div>
    );
};

export default TokenShop;
