import React, { useState } from 'react';
import { FaUniversity, FaTrain, FaBook, FaGlobe } from 'react-icons/fa';

const GOALS = [
  { id: 'banking', label: 'Banking', icon: <FaUniversity />, color: 'bg-blue-100 text-blue-600' },
  { id: 'ssc', label: 'SSC', icon: <FaBook />, color: 'bg-green-100 text-green-600' },
  { id: 'railways', label: 'Railways', icon: <FaTrain />, color: 'bg-orange-100 text-orange-600' },
  { id: 'state-exams', label: 'State Exams', icon: <FaGlobe />, color: 'bg-indigo-100 text-indigo-600' }
];

const GoalSelector = ({ onSelect, onClose }) => {
  const [selected, setSelected] = useState(null);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-scale-in">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2 font-poppins">
          Select Your Goal
        </h2>
        <p className="text-center text-gray-500 mb-8 font-inter">
          Choose your exam category to get personalized tests.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {GOALS.map((goal) => (
            <button
              key={goal.id}
              onClick={() => setSelected(goal.id)}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 ${
                selected === goal.id
                  ? 'border-blue-500 bg-blue-50 transform scale-105 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`text-4xl mb-3 p-3 rounded-full ${goal.color}`}>
                {goal.icon}
              </div>
              <span className="font-semibold text-gray-700 font-poppins">{goal.label}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className={`px-8 py-3 rounded-full font-bold text-white transition-all duration-300 shadow-lg ${
              selected
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-1'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Start Preparing
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalSelector;
