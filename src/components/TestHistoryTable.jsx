import React, { useState } from 'react';
import { FaSearch, FaFilter, FaChevronDown, FaDownload, FaEye } from 'react-icons/fa';

const TestHistoryTable = ({ testRecords = [], showFilters = true }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('All Subjects');

  const filteredData = testRecords.filter(record => {
    const testName = record.testDetails?.testName || "Unknown Test";
    const matchesSearch = testName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      {/* Table Controls */}
      {showFilters && (
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search test history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <select 
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="appearance-none w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-600 cursor-pointer"
              >
                <option>All Subjects</option>
                <option>Quantitative</option>
                <option>Logical Reasoning</option>
                <option>Verbal Ability</option>
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none size-3" />
            </div>

            <div className="relative flex-1 md:flex-none">
              <select 
                className="appearance-none w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-600 cursor-pointer"
              >
                <option>Sort By: Date</option>
                <option>Sort By: Score</option>
                <option>Sort By: Accuracy</option>
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none size-3" />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Test Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Score</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Accuracy</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Time Taken</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Result</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length > 0 ? (
              filteredData.map((record, index) => {
                const testName = record.testDetails?.testName || "Unknown Test";
                const date = record.lastAttempted ? new Date(record.lastAttempted).toLocaleDateString('en-GB', {
                   day: '2-digit', month: 'short', year: 'numeric'
                }) : "N/A";
                const score = record.bestScore || 0;
                const accuracy = record.accuracy || "68%"; // Mocking accuracy if not in record
                const timeTaken = record.timeTaken || "45 min"; // Mocking time taken
                const passed = record.testDetails && record.bestScore >= record.testDetails.passingScore;

                return (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{testName}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{date}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${score >= 70 ? 'text-green-600' : score >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                        {score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-center font-medium">{accuracy}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 text-center">{timeTaken}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        passed 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {passed ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-blue-200">
                        View Report
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">
                  No tests found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestHistoryTable;
