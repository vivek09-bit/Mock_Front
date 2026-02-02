import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import Header from './Header'; // Import global Header
import { 
  FaThLarge, 
  FaClipboardList, 
  FaChartBar, 
  FaUser, 
  FaSignOutAlt
} from 'react-icons/fa';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Sidebar toggle state could be managed here if needed for mobile

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const user = storedUser || { name: 'User', username: 'me' };
  if (!user.username) user.username = 'me';

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <FaThLarge />, path: '/dashboard' },
    { name: 'Mock Tests', icon: <FaClipboardList />, path: '/tests' },
    // { name: 'Typing Practice', icon: <FaClipboardList />, path: '/typing' },
    { name: 'Analytics', icon: <FaChartBar />, path: '/analytics' },
    { name: 'Profile', icon: <FaUser />, path: `/profile/${user.username}` },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-inter">
      {/* Global Header */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className="hidden md:flex w-64 bg-[#e0fcf8] text-slate-800 flex-col flex-shrink-0 shadow-xl z-20 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(#b2f0e6 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* Sidebar Header/Brand (Optional if Header is present, keeping Nav title) */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-[#007d71] uppercase tracking-wider">Dashboard</h2>
          </div>

          <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto relative z-10">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  location.pathname === item.path
                    ? 'bg-white shadow-md transform scale-[1.02]'
                    : 'hover:bg-white/40'
                }`}
              >
                <span className={`text-lg transition-colors ${location.pathname === item.path ? 'text-[#007d71]' : 'text-slate-500 group-hover:text-[#007d71]'}`}>
                  {item.icon}
                </span>
                <span className={`font-bold transition-colors ${location.pathname === item.path ? 'text-slate-900' : 'text-slate-600 group-hover:text-[#007d71]'}`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          <div className="p-4 mt-auto relative z-10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <FaSignOutAlt className="text-lg" />
              <span className="font-bold">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
           {/* Mobile Sidebar Trigger could go here */}
           
           <div className="flex-1 overflow-y-auto p-4 md:p-8">
             <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
