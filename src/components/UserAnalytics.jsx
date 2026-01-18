import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { FaChartLine, FaTrophy, FaCheckCircle, FaClipboardList } from "react-icons/fa";

const UserAnalytics = ({ testRecords }) => {
  if (!testRecords || !Array.isArray(testRecords) || testRecords.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md border border-gray-200">
        <FaClipboardList className="mx-auto text-4xl text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">No Data Available</h3>
        <p className="text-gray-500">Take some tests to see your analytics here!</p>
      </div>
    );
  }

  // Process data for charts
  const totalTests = testRecords.length;
  const passedTests = testRecords.filter(
    (t) => t.testDetails && t.bestScore >= t.testDetails.passingScore
  ).length;
  
  // Calculate average score
  const avgScore =
    Math.round(
      testRecords.reduce((acc, curr) => acc + curr.bestScore, 0) / totalTests
    ) || 0;

  // Prepare data for line chart (Progress over time)
  // Sort by last attempted date
  const sortedRecords = [...testRecords].sort(
    (a, b) => new Date(a.lastAttempted) - new Date(b.lastAttempted)
  );

  const chartData = sortedRecords.map((record) => ({
    name: record.testDetails?.testName || "Unknown Test",
    score: record.bestScore,
    date: new Date(record.lastAttempted).toLocaleDateString(),
  }));

  // Identify Improvements (Multiple attempts where latest > first)
  const improvements = testRecords
    .filter((record) => record.attempts.length > 1)
    .map((record) => {
      const firstScore = record.attempts[0].score;
      const latestScore = record.attempts[record.attempts.length - 1].score;
      const improvement = latestScore - firstScore;
      return {
        testName: record.testDetails?.testName || "Unknown Test",
        improvement,
        firstScore,
        latestScore,
      };
    })
    .filter((item) => item.improvement > 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-teal-100 text-sm font-medium uppercase tracking-wider">Total Tests</p>
            <h3 className="text-4xl font-bold mt-1">{totalTests}</h3>
          </div>
          <FaClipboardList className="text-5xl opacity-30" />
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium uppercase tracking-wider">Passed</p>
            <h3 className="text-4xl font-bold mt-1">{passedTests}</h3>
          </div>
          <FaCheckCircle className="text-5xl opacity-30" />
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Avg. Score</p>
            <h3 className="text-4xl font-bold mt-1">{avgScore}%</h3>
          </div>
          <FaTrophy className="text-5xl opacity-30" />
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
           <FaChartLine className="text-teal-600" /> Performance History
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#888" fontSize={12} tick={{fill: '#666'}} />
              <YAxis stroke="#888" fontSize={12} tick={{fill: '#666'}} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line
                type="monotone"
                dataKey="score"
                name="Test Score"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Improvements Section */}
      {improvements.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-500">📈</span> Recent Improvements
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {improvements.map((item, index) => (
              <div
                key={index}
                className="bg-green-50 p-4 rounded-lg border border-green-100 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold text-gray-800">{item.testName}</h4>
                  <p className="text-sm text-gray-600">
                    {item.firstScore}% ➔ <span className="font-bold text-green-700">{item.latestScore}%</span>
                  </p>
                </div>
                <div className="text-green-600 font-bold text-lg">
                  +{item.improvement}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnalytics;
