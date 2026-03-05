import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Info, LogOut } from 'lucide-react';

const UserNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Book Court', icon: Calendar, path: '/userdash' },
    { label: 'My Bookings', icon: BookOpen, path: '/my-bookings' },
    { label: 'Court Info', icon: Info, path: '/court-info' },
  ];

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (!confirmed) return;
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center justify-between px-8 h-16">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a]" />
        </div>
        <div>
          <p className="text-white font-black text-sm tracking-widest">FUTSAL ARENA</p>
          <p className="text-gray-500 text-xs tracking-wider">Book Your Game</p>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex items-center gap-2 bg-[#111] border border-[#222] rounded-full px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-400 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Legend + Logout */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Available
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Pending
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Booked
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 transition-colors text-xs"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default UserNavbar;