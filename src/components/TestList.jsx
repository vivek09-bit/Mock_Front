import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { Link } from "react-router-dom";

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { apiBase } = useContext(ThemeContext);
  useEffect(() => {
    axios
      .get(`${apiBase}/api/test`) // Adjust to match your API route
      .then((response) => {
        setTests(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load tests. Please try again.");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600 animate-pulse">Loading tests...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 mt-5">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Available Tests
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div
            key={test._id}
            className="bg-white shadow-md rounded-lg p-5 border border-gray-200 hover:shadow-lg transition-all"
          >
            <h3 className="text-xl font-semibold text-blue-700">{test.name}</h3>
            <p className="text-gray-600 mt-2">{test.description}</p>

            <Link
              to={`/take-test/${test._id}`}
              className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-all"
            >
              Start Test
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestList;
