import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import TestList from "./components/TestList";
import TakeTest from "./pages/TakeTest";
import TestResult from "./pages/TestResult";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import TermsAndConditions from "./pages/TermsAndConditions";
import NotFound from "./pages/NotFound";
import Tping from "./pages/Tping"; // Import the Tping component
import AboutUs from "./components/About"; // Import the AboutUs component
import ContactForm from "./pages/ContactForm"; // Import the ContactForm component
import FAQsPage from "./pages/FAQsPage"; // Import the FAQsPage component

const App = () => {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<UserProfile />} />
            <Route path="/tests" element={<TestList />} />
            <Route path="/take-test/:testId" element={<TakeTest />} />
            <Route path="Test-Submit" element={<TestResult />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/typing" element={<Tping />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactForm />} />
            <Route path="/faqspage" element={<FAQsPage />} />{" "}
            {/* Add FAQs route */}
            {/* Infomational Routes */}
            <Route path="/page/terms-portal" element={<TermsAndConditions />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
