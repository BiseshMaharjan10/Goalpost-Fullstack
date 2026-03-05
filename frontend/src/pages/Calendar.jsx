import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import NewBooking from '../components/NewBooking';
import { getCalendarBookings } from '../services/api';
import toast from 'react-hot-toast';

const Calendar = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('Month');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchCalendarBookings();
  }, []);

  // Refresh bookings when modal closes (backup refresh)
  useEffect(() => {
    if (!isModalOpen && bookings.length > 0) {
      // Only refetch if we already have bookings loaded
      fetchCalendarBookings();
    }
  }, [isModalOpen]);


// ================== TIME FORMAT FUNCTION ==================
const formatHour = (h) => {
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:00 ${period}`;
};

  const fetchCalendarBookings = async () => {
    try {
      setLoading(true);
      const response = await getCalendarBookings();
      
      if (response.data.success) {
        setBookings(response.data.data);
        console.log('📅 Bookings loaded:', response.data.data.length); // Debug log
      }
    } catch (error) {
      console.error('Error fetching calendar bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    return { daysInMonth, startingDayOfWeek: adjustedStartDay, prevMonthDays };
  };

  const getBookingsForDate = (date) => {
  // ✅ Use local date components (NO timezone conversion)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  return bookings.filter(booking => {
    const bookingDateObj = new Date(booking.bookingDate);
    const bYear = bookingDateObj.getFullYear();
    const bMonth = String(bookingDateObj.getMonth() + 1).padStart(2, '0');
    const bDay = String(bookingDateObj.getDate()).padStart(2, '0');
    const bookingDateStr = `${bYear}-${bMonth}-${bDay}`;
    
    return bookingDateStr === dateStr;
  });
};

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    
    if (view === 'Month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (view === 'Week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (view === 'Day') {
      newDate.setDate(newDate.getDate() + direction);
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    const timeSlots = [];
    for (let hour = 6; hour <= 23; hour++) {
      timeSlots.push(hour);
    }

  const getBookingsForDateTime = (date, hour) => {
  // ✅ Use local date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  return bookings.filter(booking => {
    const bookingDateObj = new Date(booking.bookingDate);
    const bYear = bookingDateObj.getFullYear();
    const bMonth = String(bookingDateObj.getMonth() + 1).padStart(2, '0');
    const bDay = String(bookingDateObj.getDate()).padStart(2, '0');
    const bookingDateStr = `${bYear}-${bMonth}-${bDay}`;
    
    const bookingHour = parseInt(booking.timeSlot.split(':')[0]);
    return bookingDateStr === dateStr && bookingHour === hour;
  });
};

    const weekRange = `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{weekRange}</h3>
        </div>
        
        <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="p-4 border-r border-gray-200 bg-gray-50">
            <div className="text-sm font-semibold text-gray-700">Time</div>
          </div>
          {weekDays.map((day, idx) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={idx} className="p-4 text-center border-r border-gray-200">
                <div className="text-xs text-gray-600 mb-1">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold ${isToday ? 'text-green-600' : 'text-gray-900'}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-y-auto max-h-[600px]">
          {timeSlots.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-200 hover:bg-gray-50">
              <div className="p-4 border-r border-gray-200 bg-gray-50">
                <div className="text-sm font-medium text-gray-700">
                   {formatHour(hour)} - {formatHour(hour + 1)}
                </div>
                <div className="text-xs text-gray-500">
                   {formatHour(hour)} - {formatHour(hour + 1)}
                </div>
              </div>
              {weekDays.map((day, idx) => {
                const dayBookings = getBookingsForDateTime(day, hour);
                return (
                  <div key={idx} className="p-2 border-r border-gray-200 min-h-20">
                    {dayBookings.map((booking, bookingIdx) => (
                      <div
                        key={bookingIdx}
                        className={`text-xs px-2 py-1 rounded mb-1 ${getStatusColor(booking.status)}`}
                        title={`${booking.timeSlot} - ${booking.customerName}`}
                      >
                        <div className="font-medium truncate">{booking.customerName}</div>
                        <div className="text-xs opacity-90">{booking.timeSlot}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const today = new Date(currentDate);
    const dateStr = today.toISOString().split('T')[0];
    const dayBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0];
      return bookingDate === dateStr;
    });

    const timeSlots = [];
    for (let hour = 6; hour <= 23; hour++) {
      timeSlots.push(hour);
    }

    const getBookingsForHour = (hour) => {
      return dayBookings.filter(booking => {
        const bookingHour = parseInt(booking.timeSlot.split(':')[0]);
        return bookingHour === hour;
      });
    };

    const formattedDate = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{formattedDate}</h3>
          <p className="text-sm text-gray-600 mt-1">{dayBookings.length} bookings scheduled</p>
        </div>

        <div className="divide-y divide-gray-200">
          {timeSlots.map((hour) => {
            const hourBookings = getBookingsForHour(hour);
            return (
              <div key={hour} className="grid grid-cols-12 hover:bg-gray-50 transition">
                <div className="col-span-2 p-4 border-r border-gray-200 bg-gray-50">
                  <div className="text-sm font-medium text-gray-900">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="text-xs text-gray-500">
                    {(hour + 1).toString().padStart(2, '0')}:00
                  </div>
                </div>
                <div className="col-span-10 p-4 min-h-20">
                  {hourBookings.length === 0 ? (
                    <div className="text-sm text-gray-400 italic">No bookings</div>
                  ) : (
                    <div className="space-y-2">
                      {hourBookings.map((booking, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${getStatusColor(booking.status)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{booking.customerName}</div>
                              <div className="text-sm opacity-90 mt-1">
                                {booking.timeSlot} • {booking.phoneNumber}
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              {booking.players || 'N/A'} players
                            </div>
                          </div>
                          {booking.notes && (
                            <div className="text-sm opacity-90 mt-2 border-t border-white/20 pt-2">
                              {booking.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, prevMonthDays } = getDaysInMonth(currentDate);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
      days.push(
        <div key={`prev-${day}`} className="min-h-32 bg-gray-50 p-2 border border-gray-200">
          <div className="text-gray-400 text-sm font-medium mb-1">{day}</div>
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      date.setHours(0, 0, 0, 0);
      const isToday = date.getTime() === today.getTime();
      const dayBookings = getBookingsForDate(date);

      days.push(
        <div key={day} className="min-h-32 bg-white p-2 border border-gray-200 hover:bg-gray-50 transition cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            {isToday ? (
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {day}
              </div>
            ) : (
              <div className="text-gray-900 text-sm font-medium">{day}</div>
            )}
          </div>
          
          <div className="space-y-1">
            {dayBookings.slice(0, 3).map((booking, idx) => (
              <div
                key={idx}
                className={`text-xs px-2 py-1 rounded truncate ${getStatusColor(booking.status)}`}
                title={`${booking.timeSlot} ${booking.customerName}`}
              >
                {booking.timeSlot} {booking.customerName?.split(' ')[0]}
              </div>
            ))}
            {dayBookings.length > 3 && (
              <div className="text-xs text-gray-500 font-medium px-2">
                +{dayBookings.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    // Next month days to fill the grid
    const totalCells = days.length;
    const remainingCells = 35 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="min-h-32 bg-gray-50 p-2 border border-gray-200">
          <div className="text-gray-400 text-sm font-medium mb-1">{i}</div>
        </div>
      );
    }

    return days;
  };

  const getDisplayDate = () => {
    if (view === 'Month') {
      return currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else if (view === 'Week') {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric' 
      });
    }
  };

  // ⭐ NEW: Handler for successful booking creation
  const handleBookingCreated = () => {
    console.log('🎉 New booking created, refreshing calendar...');
    fetchCalendarBookings();
    toast.success('Calendar updated!');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex-1 ml-72 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Calendar</h1>
            <p className="text-gray-600">View and manage all bookings</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('Month')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    view === 'Month' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📅 Month
                </button>
                <button
                  onClick={() => setView('Week')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    view === 'Week' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 Week
                </button>
                <button
                  onClick={() => setView('Day')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    view === 'Day' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🕐 Day
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title={view === 'Month' ? 'Previous Month' : view === 'Week' ? 'Previous Week' : 'Previous Day'}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-4 py-2 hover:bg-gray-100 rounded-lg font-medium transition"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigate(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title={view === 'Month' ? 'Next Month' : view === 'Week' ? 'Next Week' : 'Next Day'}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-xl font-bold text-gray-900 min-w-[280px] text-center">
                  {getDisplayDate()}
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  <Plus className="w-5 h-5" />
                  New Booking
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Rejected</span>
              </div>
            </div>
          </div>

          {view === 'Month' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="p-4 text-center text-sm font-semibold text-gray-700">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {renderCalendar()}
                  </div>
                </>
              )}
            </div>
          )}

          {view === 'Week' && (
            loading ? (
              <div className="bg-white rounded-2xl shadow-sm p-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : (
              renderWeekView()
            )
          )}

          {view === 'Day' && (
            loading ? (
              <div className="bg-white rounded-2xl shadow-sm p-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : (
              renderDayView()
            )
          )}
        </div>
      </div>

      {/* ⭐ UPDATED: Pass the new handler */}
      <NewBooking 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookingCreated={handleBookingCreated}
      />
    </div>
  );
};

export default Calendar;