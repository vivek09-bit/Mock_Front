import React from "react";

const TestLayout = ({
  test,
  user,
  timeLeft,
  formatTime,
  isMobile,
  isSidebarOpen,
  setIsSidebarOpen,
  currentQuestionIndex,
  currentQuestion,
  counts,
  questionStatus,
  QUESTION_STATUS,
  getStatusTailwindClasses,
  jumpToQuestion,
  setShowSubmitModal,
  markForReview,
  clearResponse,
  saveAndNext,
  proctoringSidebar,
  children
}) => {
  return (
    <div className="h-screen bg-gray-50 font-sans flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-4 z-50">
        <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-700 tracking-tight`}>Ignite Verse</div>
        {!isMobile && <div className="font-medium text-sm text-gray-800">{test.name}</div>}
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-gray-600">{isMobile ? '' : 'Time Left'}</span>
          <div className="bg-gray-800 text-white py-1 px-2 rounded text-sm font-bold tracking-wider">{formatTime(timeLeft)}</div>
        </div>
      </div>

      {/* SECTION BAR */}
      <div className="h-10 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
        <div className="bg-blue-700 text-white px-5 h-10 flex items-center text-sm font-bold rounded-tl rounded-tr">
            {currentQuestion?.subject || "Quantitative Aptitude"}
        </div>
        <button className={`${isMobile ? 'flex' : 'hidden'} items-center gap-1.5 py-1 px-2 border border-blue-700 rounded text-blue-700 font-bold text-xs bg-transparent`} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? 'Close Panel' : 'Question Panel'}
        </button>
      </div>

      {/* MAIN BODY */}
      <div className={`flex flex-1 ${isMobile ? 'flex-col' : 'flex-row'} relative ${isMobile ? 'h-[calc(100vh-160px)]' : 'h-[calc(100vh-120px)]'}`}>
        {/* Mobile Overlay */}
        <div className={`absolute inset-0 bg-black bg-opacity-50 z-40 ${isMobile && isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

        {/* COL 1 & 2: Questions and Options (Child provided) */}
        {children}

        {/* COL 3: Sidebar */}
        <div className={`bg-blue-50 border-l border-gray-300 flex flex-col ${isMobile ? 'absolute w-10/12' : 'w-80'} top-0 right-0 bottom-0 z-50 transform ${isMobile ? (isSidebarOpen ? 'translate-x-0' : 'translate-x-full') : 'translate-x-0'} transition-transform duration-300 shadow-lg`}>
          <div className={`${isMobile ? 'flex' : 'hidden'} justify-end p-2`}>
            <button onClick={() => setIsSidebarOpen(false)} className="bg-transparent border-none text-xl">✕</button>
          </div>
          <div className="flex items-center gap-2 p-2 bg-blue-100 border-b border-blue-200">
            <div className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold">{user?.user?.name?.charAt(0) || 'U'}</div>
            <div className="text-xs font-bold">{user?.user?.name || "Guest Student"}</div>
          </div>

          {/* Proctoring Sidebar (Camera View) */}
          {proctoringSidebar && (
            <div className="border-b border-gray-300">
              {proctoringSidebar}
            </div>
          )}

          <div className="p-2 grid grid-cols-2 gap-2 text-xs border-b border-gray-300 bg-white">
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[0.625rem]">{counts.answered}</div> Answered</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[0.625rem]">{counts.notAnswered}</div> Not Answered</div>
            <div className="flex items:center gap-1"><div className="w-4 h-4 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center text-[0.625rem]">{counts.notVisited}</div> Not Visited</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[0.625rem]">{counts.markedReview}</div> Marked</div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-[0.75rem] font-bold text-gray-800 mb-2 bg-blue-200 px-1 py-0.5">SECTION : {currentQuestion?.subject || "Default Section"}</div>
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((q, idx) => {
                const status = questionStatus[q._id] || QUESTION_STATUS.NOT_VISITED;
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <div
                    key={idx}
                    className={getStatusTailwindClasses(status, isCurrent)}
                    onClick={() => {
                      jumpToQuestion(idx);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                  >
                    {idx + 1}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-2 bg-blue-100 border-t border-blue-200">
            <button className="w-full bg-blue-700 text-white py-2 rounded text-sm font-bold" onClick={() => setShowSubmitModal(true)}>Submit Test</button>
            <div className="flex gap-1 mt-1 justify-between text-xs">
              <button className="text-blue-700">Question Paper</button>
              <button className="text-blue-700">Instructions</button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className={`bg-white border-t border-gray-200 flex ${isMobile ? 'flex-col gap-2 py-2' : 'h-16 items-center justify-between px-4'}`}>
        <div className={`flex gap-2 ${isMobile ? 'w-full justify-between' : ''}`}>
          <button className="bg-blue-500 text-white py-2 rounded text-xs font-medium" onClick={markForReview}>Mark for Review & Next</button>
          <button className="bg-white text-gray-800 border border-gray-300 py-2 rounded text-xs font-medium" onClick={clearResponse}>Clear Response</button>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-700 text-white py-2 px-4 rounded text-sm font-bold" onClick={() => setShowSubmitModal(true)}>Submit</button>
          {!isMobile && <button className="bg-blue-700 text-white py-2 px-4 rounded text-sm font-bold" onClick={saveAndNext}>Save & Next</button>}
        </div>
      </div>
    </div>
  );
};

export default TestLayout;
