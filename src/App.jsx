import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from "react-router-dom";
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
import Tping from './pages/Tping';
import AboutUs from './components/About';
import ContactForm from './pages/ContactForm';
import FAQsPage from './pages/FAQsPage';
import ExamDashboard from './pages/ExamDashboard';
import TestInstruction from './pages/TestInstruction';
import DashboardLayout from './components/DashboardLayout';
import MyTests from './pages/MyTests';

const PublicLayout = () => (
  <div className="flex flex-col min-vh-100">
    <Header />
    <main className="flex-grow-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes with Header/Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/faqspage" element={<FAQsPage />} />
          <Route path='/typing' element={<Tping />} />
          <Route path='/about' element={<AboutUs />} />
          <Route path='/contact' element={<ContactForm />} />
          <Route path='/page/terms-portal' element={<TermsAndConditions/>} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Dashboard Routes with Sidebar */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<ExamDashboard />} />
          <Route path="/my-tests" element={<MyTests />} />
          <Route path="/analytics" element={<UserProfile />} /> 
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/tests" element={<TestList />} />
        </Route>

        {/* Specialized Routes without standard layout */}
        <Route path="/test/instruction/:testId" element={<TestInstruction />} />
        <Route path="/take-test/:testId" element={<TakeTest />} />
        <Route path='/Test-Submit' element={<TestResult />} />
      </Routes>
    </Router>
  );
};

export default App;
