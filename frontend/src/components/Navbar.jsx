import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, Settings, LogOut, Clock, Grid, Camera } from 'lucide-react';
import messi from "../assets/messi.jpeg";
import { getMe, uploadImage } from '../services/api';
import { getToken } from "../protected/Auth";
import toast from 'react-hot-toast';

const Navbar = ({ pendingCount = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await getMe();
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      }
    };
    if (getToken()) {
      fetchMe();
    }
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("profile", file);

      const response = await uploadImage(formData);
      
      if (response.data.success) {
        toast.success("Profile image updated successfully");

        console.log("Updated user:", response.data.user);
  console.log("Profile path:", response.data.user.profile, "Full URL:", `${API_BASE}${response.data.user.profile}`);
        
        // Update the user state with new profile image
        setUser(prev => ({
          ...prev,
          profile: response.data.user.profile
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update image");
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: Grid, path: '/admindash', badge: null },
    { name: 'Pending Requests', icon: Clock, path: '/pending', badge: pendingCount || null },
    { name: 'Calendar', icon: Calendar, path: '/calendar', badge: null },
    { name: 'Users', icon: Users, path: '/admin/users', badge: null },
    { name: 'Settings', icon: Settings, path: '/admin/settings', badge: null },
  ];

  const handleLogout = () => {
    const confirmDelete = window.confirm("Are you sure you want to logout?");
    if (!confirmDelete) return;
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  // Loading state
  if (!user) {
    return (
      <div className="w-72 h-screen bg-gradient-to-b from-green-800 to-green-900 text-white flex flex-col fixed left-0 top-0">
        <div className="p-6 border-b border-green-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src={messi}
                alt="Futsal Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">Loading...</h1>
              <p className="text-sm text-green-300">Management Panel</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 h-screen bg-gradient-to-b from-green-800 to-green-900 text-white flex flex-col fixed left-0 top-0">
      {/* Header */}
      <div className="p-6 border-b border-green-700">
        <div className="flex items-center gap-3">
          <div className="relative w-20 h-20 group">
            <div className="w-20 h-20 bg-green-600 rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src={user.profile ? `${API_BASE}${user.profile}` : messi}
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Hover overlay with camera icon */}
            <label 
              htmlFor="profile-upload"
              className={`absolute inset-0 bg-black bg-opacity-60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${loading ? 'opacity-100' : ''}`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </label>
            
            {/* Hidden file input */}
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={loading}
            />
          </div>
          
          <div>
            <h1 className="text-xl font-bold">{user.username}</h1>
            <p className="text-sm text-green-300">Management Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-green-600 shadow-lg'
                  : 'hover:bg-green-700/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left font-medium">{item.name}</span>
              {item.badge && (
                <span className="bg-yellow-500 text-green-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-green-700">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-700/50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;