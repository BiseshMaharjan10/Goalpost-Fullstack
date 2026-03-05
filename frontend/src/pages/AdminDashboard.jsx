import React, { useEffect, useState } from 'react';
import { Calendar, Users, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { pendingRequest, approveBooking, rejectBooking, getDashboardStats } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    bookingsToday: 0,
    pendingRequests: 0,
    totalUsers: 0,
    recentActivity: [],
  });

  // Fetch pending requests when component mounts
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await pendingRequest();
      if (response?.data?.success) {
        setPendingRequests(response.data.data);
      } else {
        toast.error(response?.data?.message || "Failed to fetch pending requests");
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch pending requests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard stats (including recent activity)
  const fetchDashboardStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response?.data?.success) {
        setDashboardStats(response.data.data);
      } else {
        toast.error(response?.data?.message || "Failed to fetch dashboard stats");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch dashboard stats");
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    fetchDashboardStats();
  }, []); 
  
  // Handle approve booking
  const handleApprove = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      const response = await approveBooking(bookingId);
      
      if (response.data.success) {
        toast.success('Booking approved successfully');
        setPendingRequests(prev => prev.filter(req => req.id !== bookingId));
        fetchDashboardStats(); // Refresh stats after approval
      } else {
        toast.error(response.data.message || 'Failed to approve booking');
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error(error?.response?.data?.message || 'Failed to approve booking');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject booking
  const handleReject = async (bookingId) => {
    const confirmed = window.confirm('Are you sure you want to reject this booking?');
    if (!confirmed) return;

    try {
      setActionLoading(bookingId);
      const response = await rejectBooking(bookingId);
      
      if (response.data.success) {
        toast.success('Booking rejected successfully');
        setPendingRequests(prev => prev.filter(req => req.id !== bookingId));
        fetchDashboardStats(); // Refresh stats after rejection
      } else {
        toast.error(response.data.message || 'Failed to reject booking');
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error(error?.response?.data?.message || 'Failed to reject booking');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = [
    {
      icon: Calendar,
      value: dashboardStats.bookingsToday.toString(),
      label: 'Bookings Today',
      positive: true,
      bgColor: 'bg-white',
      iconColor: 'text-green-600'
    },
    {
      icon: Clock,
      value: pendingRequests.length.toString(),
      label: 'Pending Requests',
      indicator: true,
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400',
      iconColor: 'text-yellow-600'
    },
    {
      icon: TrendingUp,
      value: '75%',
      label: 'Occupancy Rate',
      change: '+5%',
      changeLabel: 'vs yesterday',
      positive: true,
      bgColor: 'bg-white',
      iconColor: 'text-green-600'
    },
    {
      icon: Users,
      value: dashboardStats.totalUsers.toString(),
      label: 'Total Users',
      change: '+8%',
      changeLabel: 'this month',
      positive: true,
      bgColor: 'bg-white',
      iconColor: 'text-green-600'
    }
  ];

  // Helper function to determine activity type based on action text
  const getActivityType = (action) => {
    if (action.toLowerCase().includes('approved')) return 'approved';
    if (action.toLowerCase().includes('rejected')) return 'rejected';
    return 'new';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex-1 ml-72 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`${stat.bgColor} rounded-2xl p-6 shadow-sm relative overflow-hidden`}>
                  {stat.indicator && (
                    <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  )}
                  <div className={`w-12 h-12 ${stat.iconColor} bg-gray-50 rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                  {stat.change && (
                    <div className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} <span className="text-gray-500 font-normal">{stat.changeLabel}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pending Requests */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
                    <span className="bg-yellow-100 text-yellow-700 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {pendingRequests.length} waiting
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/pending')}
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2 font-medium transition-transform duration-200 hover:scale-105 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* ⭐ SCROLLABLE CONTAINER */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Loading pending requests...</p>
                    </div>
                  ) : pendingRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg font-medium">No pending requests</p>
                      <p className="text-gray-400 text-sm">All caught up!</p>
                    </div>
                  ) : (
                    pendingRequests.map((request) => (
                      <div key={request.id} className="border-2 border-yellow-200 rounded-xl p-6 bg-gradient-to-r from-yellow-50 to-orange-50 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">
                                {request.customerName || request.name}
                              </h3>
                              <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                {request.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {request.bookingDate} at {request.timeSlot}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>{request.players || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{request.phoneNumber || request.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{request.email}</span>
                          </div>
                        </div>

                        {request.notes && (
                          <div className="flex items-start gap-2 text-sm text-gray-700 mb-4 bg-white bg-opacity-50 p-3 rounded-lg">
                            <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span className="flex-1">{request.notes}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-yellow-200">
                          <div className="text-xs text-gray-500">
                            Requested: {request.createdAt 
                              ? new Date(request.createdAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'N/A'
                            }
                          </div>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleApprove(request.id)}
                              disabled={actionLoading === request.id}
                              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === request.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button 
                              onClick={() => handleReject(request.id)}
                              disabled={actionLoading === request.id}
                              className="border-2 border-red-500 text-red-500 hover:bg-red-50 px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === request.id ? 'Processing...' : 'Reject'}
                            </button>
                            <button 
                              onClick={() => navigate('/pending')}
                              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition hover:bg-gray-100"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {dashboardStats.recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No recent activity</p>
                    </div>
                  ) : (
                    dashboardStats.recentActivity.map((activity, index) => {
                      const activityType = getActivityType(activity.action);
                      return (
                        <div key={activity.id || index} className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activityType === 'approved' ? 'bg-green-100' :
                            activityType === 'rejected' ? 'bg-red-100' :
                            'bg-yellow-100'
                          }`}>
                            <div className={`w-3 h-3 rounded-full ${
                              activityType === 'approved' ? 'bg-green-600' :
                              activityType === 'rejected' ? 'bg-red-600' :
                              'bg-yellow-600'
                            }`}></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;