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
import PolicyPage from './pages/PolicyPage';
import InstructorLogin from "./pages/InstructorLogin";
import InstructorRegister from "./pages/InstructorRegister";
import InstructorDashboard from "./pages/InstructorDashboard";
import InstructorTestList from "./pages/InstructorTestList";
import CreateTest from "./pages/CreateTest";
import TestAnalytics from "./pages/TestAnalytics";
import ExamDashboard from "./pages/ExamDashboard";
import TestInstruction from "./pages/TestInstruction";
import DashboardLayout from "./components/DashboardLayout";
import MyTests from "./pages/MyTests";
import StudentLanding from "./pages/StudentLanding";
import SubmissionSuccess from "./pages/SubmissionSuccess";
import GlobalLiveJoin from "./pages/GlobalLiveJoin";
import Pricing from "./pages/Pricing";
import TokenShop from "./pages/TokenShop";

import InstructorStudentManagement from "./pages/InstructorStudentManagement";
import LiveSessionHost from "./pages/LiveSessionHost";
import LiveSessionJoin from "./pages/LiveSessionJoin";
import InstructorProtectedRoute from "./components/InstructorProtectedRoute";

const DashboardRoute = () => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const role = storedUser?.role;
  return role === 'ins' ? <InstructorDashboard /> : <ExamDashboard />;
};

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
          <Route path="/instructor-login" element={<InstructorLogin />} />
          <Route path="/instructor-register" element={<InstructorRegister />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/faqspage" element={<FAQsPage />} />
          <Route path='/about' element={<AboutUs />} />
          <Route path='/contact' element={<ContactForm />} />
          <Route path='/policy' element={<PolicyPage />} />
          <Route path='/page/terms-portal' element={<TermsAndConditions />} />
          <Route path="/test/instruction/:testId" element={<TestInstruction />} />
          <Route path="/start-test/:testId" element={<StudentLanding />} />
          <Route path='/test-result' element={<TestResult />} />
          <Route path='/submission-success' element={<SubmissionSuccess />} />
          {/* <Route path='/join' element={<GlobalLiveJoin />} /> */}
          <Route path='/pricing' element={<Pricing />} />

          <Route path="*" element={<NotFound />} />
          <Route path="/take-test/:testId" element={<TakeTest />} />
          <Route path="/live/join/:testId" element={<LiveSessionJoin />} />
        </Route>

        {/* Dashboard Routes with Sidebar */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path='/typing' element={<Tping />} />
          <Route path="/analytics" element={<UserProfile />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/my-tests" element={<MyTests />} />
          <Route path="/token-shop" element={<TokenShop />} />
          <Route path="/tests" element={<TestList />} />

          {/* Instructor Specific Paths protected by role */}
          <Route element={<InstructorProtectedRoute />}>
            <Route path="/instructor/my-tests" element={<InstructorTestList />} />
            <Route path="/instructor/create-test" element={<CreateTest />} />
            <Route path="/instructor/students" element={<InstructorStudentManagement />} />
            <Route path="/instructor/test-stats/:testId" element={<TestAnalytics />} />
            <Route path="/live/host/:testId" element={<LiveSessionHost />} />
          </Route>
        </Route>

        {/* Specialized Routes without standard layout */}
      </Routes>
    </Router>
  );
};

export default App;
