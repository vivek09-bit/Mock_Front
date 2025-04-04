import React from "react";
import { useNavigate } from "react-router-dom";

const StartTestButton = ({ testId }) => {
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate(`/take-test/${testId}`); // Redirect to test-taking page
  };

  return (
    <button onClick={handleStartTest} className="btn btn-primary">
      Start Test
    </button>
  );
};

export default StartTestButton;
