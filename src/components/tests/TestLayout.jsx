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
  // Determine timer color and styling based on time remaining
  const getTimerStyles = () => {
    const isLowTime = timeLeft < 600; // Less than 10 minutes
    const isCritical = timeLeft < 300; // Less than 5 minutes
    const isVeryLow = timeLeft < 60; // Less than 1 minute

    let bgColor = "bg-gray-800";
    let textColor = "text-white";
    let borderClass = "";
    let pulseClass = "";
    let shadowClass = "shadow-sm";

    if (isVeryLow) {
      bgColor = "bg-red-600";
      borderClass = "border-2 border-red-800";
      pulseClass = "animate-pulse";
      shadowClass = "shadow-lg shadow-red-600/50";
    } else if (isCritical) {
      bgColor = "bg-red-500";
      borderClass = "border-2 border-red-700";
      shadowClass = "shadow-lg shadow-red-500/50";
    } else if (isLowTime) {
      bgColor = "bg-orange-500";
      borderClass = "border-2 border-orange-600";
      shadowClass = "shadow-lg shadow-orange-500/50";
    }

    return { bgColor, textColor, borderClass, pulseClass, shadowClass };
  };

  const timerStyles = getTimerStyles();
  const isLowTime = timeLeft < 600;
  const isCritical = timeLeft < 300;
  const isVeryLow = timeLeft < 60;

  // Determine security mode for badge display
  const getSecurityBadge = () => {
    if (test.isLive) return { label: 'Live Session', color: 'bg-purple-100 text-purple-700' };
    if (test.isFullMock) return { label: 'Proctored', color: 'bg-red-100 text-red-700' };
    if (test.isPremock) return { label: 'Secure', color: 'bg-blue-100 text-blue-700' };
    return { label: null, color: null };
  };

  const securityBadge = getSecurityBadge();

  return (
    <div className="h-screen bg-gray-50 font-sans flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="h-18 md:h-16 bg-white border-b-2 border-gray-200 flex justify-between items-center px-3 md:px-6 gap-2 md:gap-4 z-50 flex-wrap md:flex-nowrap">
        <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-700 tracking-tight flex-shrink-0`}>Ignite Verse</div>

        {!isMobile && test.name && (
          <div className="hidden lg:flex font-semibold text-xs text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
            {test.name}
          </div>
        )}

        {/* Security Mode Badge */}
        {securityBadge.label && (
          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${securityBadge.color}`}>
            {securityBadge.label}
          </div>
        )}

        {/* User Info (Hidden on mobile) */}
        {!isMobile && user?.name && (
          <div className="hidden md:flex text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
            {user.name.split(' ')[0]}
          </div>
        )}

        {/* TIMER SECTION - Enhanced Display */}
        <div className="flex items-center gap-2 md:gap-4 flex-col md:flex-row">
          <div className="flex flex-col items-end gap-1.5">
            {/* Timer Label */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${isLowTime ? (isVeryLow ? 'text-red-600' : 'text-red-500' ? 'text-orange-500' : 'text-gray-600') : 'text-gray-600'}`}>
                {isVeryLow ? 'CRITICAL' : isCritical ? 'URGENT' : isLowTime ? 'LOW' : 'TIME'}
              </span>
            </div>

            {/* MAIN TIMER DISPLAY - Enhanced */}
            <div className={`${timerStyles.bgColor} ${timerStyles.textColor} ${timerStyles.borderClass} ${timerStyles.pulseClass} ${timerStyles.shadowClass} py-2 px-4 md:py-2.5 md:px-5 rounded-lg text-base md:text-lg font-black tracking-wider transition-all duration-300 min-w-[130px] md:min-w-[150px] text-center transform hover:scale-105`}>
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* CRITICAL TIME WARNING BADGE - Enhanced */}
          {isCritical && (
            <div className="flex flex-col items-center justify-center animate-pulse gap-0.5">
              <span className={`text-[10px] md:text-xs font-black ${isVeryLow ? 'text-red-600' : 'text-red-500'}`}>
                {isVeryLow ? 'FINAL' : 'ALERT'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION BAR - Enhanced */}
      <div className="h-11 md:h-12 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200 flex items-center px-3 md:px-6 justify-between gap-2">
        <div className="flex items-center gap-3 flex-1">
          <span className="hidden md:inline text-xs font-bold text-gray-600 uppercase tracking-widest">Section</span>
          <div className="bg-blue-700 text-white px-4 md:px-6 h-9 flex items-center text-xs md:text-sm font-bold rounded-md shadow-sm">
            {currentQuestion?.subject || "Quantitative Aptitude"}
          </div>
          {currentQuestion?.category && (
            <div className="hidden lg:flex items-center px-3 py-1.5 bg-white border border-blue-200 rounded-md text-xs text-gray-700 font-medium">
              {currentQuestion.category}
            </div>
          )}
        </div>

        {/* Question Counter */}
        <div className="text-xs md:text-sm font-bold text-gray-700 whitespace-nowrap">
          Question {currentQuestionIndex + 1}/{test?.questions?.length || 0}
        </div>

        {/* Mobile Toggle */}
        <button
          className={`${isMobile ? 'flex' : 'hidden'} items-center gap-1.5 py-1.5 px-3 border-2 border-blue-700 rounded-md text-blue-700 font-bold text-xs bg-white hover:bg-blue-50 transition-colors`}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? 'Close' : 'Panel'}
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
            <button onClick={() => setIsSidebarOpen(false)} className="bg-transparent border-none text-xl">×</button>
          </div>
          <div className="p-2 bg-blue-100 border-b border-blue-200">
            <button className="w-full bg-blue-700 text-white py-2 rounded text-sm font-bold mb-2" onClick={() => setShowSubmitModal(true)}>Submit Test</button>
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
            <div className="flex gap-1 justify-between text-xs">
              <button className="text-blue-700">Question Paper</button>
              <button className="text-blue-700">Instructions</button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER - Enhanced */}
      <div className={`bg-gradient-to-r from-white to-gray-50 border-t-2 border-gray-200 flex ${isMobile ? 'flex-col gap-2 py-2 px-2' : 'h-18 items-center justify-between px-6 gap-4'}`}>
        {/* Left Actions */}
        <div className={`flex gap-2 ${isMobile ? 'w-full flex-col' : 'flex-row'}`}>
          <button
            onClick={markForReview}
            className="flex-1 md:flex-none bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 md:py-2.5 px-3 md:px-4 rounded-md text-xs md:text-sm font-bold hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105"
          >
            Mark & Next
          </button>
          <button
            onClick={clearResponse}
            className="flex-1 md:flex-none bg-white text-gray-800 border-2 border-gray-300 py-2 md:py-2.5 px-3 md:px-4 rounded-md text-xs md:text-sm font-bold hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            Clear
          </button>
        </div>

        {/* Right Actions */}
        <div className={`flex gap-2 ${isMobile ? 'w-full' : 'flex-row'}`}>
          {!isMobile && (
            <button
              onClick={saveAndNext}
              className="bg-blue-600 text-white py-2.5 px-5 rounded-md text-sm font-bold hover:bg-blue-700 hover:shadow-lg transition-all transform hover:scale-105"
            >
              Save & Next
            </button>
          )}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex-1 md:flex-none bg-gradient-to-r from-green-600 to-green-700 text-white py-2 md:py-2.5 px-4 md:px-6 rounded-md text-xs md:text-sm font-bold hover:shadow-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestLayout;
