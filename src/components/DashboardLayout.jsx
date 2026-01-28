import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  FaThLarge, 
  FaClipboardList, 
  FaChartBar, 
  FaUser, 
  FaSignOutAlt, 
  FaSearch, 
  FaBell,
  FaChevronDown
} from 'react-icons/fa';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User', username: 'user' };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <FaThLarge />, path: '/dashboard' },
    { name: 'Mock Tests', icon: <FaClipboardList />, path: '/testlist' },
    { name: 'Analytics', icon: <FaChartBar />, path: '/analytics' },
    { name: 'Profile', icon: <FaUser />, path: `/profile/${user.username}` },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-inter overflow-hidden">
      {/* Sidebar */}
      <aside 
        className="w-64 bg-[#e0fcf8] text-slate-800 flex flex-col flex-shrink-0 shadow-xl z-20 relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(#b2f0e6 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      >
        <Link to="/" className="p-6 flex items-center gap-3 hover:bg-black/5 transition-colors group relative z-10">
          <div className="bg-[#007d71] p-2 rounded-xl shadow-lg ring-4 ring-white/50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#007d71]">TeamIgnite</span>
        </Link>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto relative z-10">
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">
              Hi, {user.name.split(' ')[0]} 👋
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-slate-100 px-4 py-2 rounded-xl group focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <FaSearch className="text-slate-400 group-focus-within:text-blue-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none focus:outline-none ml-3 text-sm text-slate-600 w-48"
              />
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
                <FaBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-all"
                >
                  <img 
                    src={user.profilePic || "/assets/adventurer-1739115902517.svg"} 
                    alt="User" 
                    className="w-10 h-10 rounded-full border-2 border-slate-200"
                  />
                  <FaChevronDown className={`text-slate-400 text-xs transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link to={`/profile/${user.username}`} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile Settings</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
