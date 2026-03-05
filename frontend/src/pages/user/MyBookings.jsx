import { useState, useEffect } from 'react';
import UserNavbar from '../../components/UserNavbar';
import { getMyBookings } from '../../services/api';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const normalizeDateKey = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
};

const formatDisplayDate = (dateStr) => {
  const date = new Date(normalizeDateKey(dateStr) + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    containerClass: 'bg-green-50 border-green-200',
    badgeClass: 'bg-green-100 text-green-700 border border-green-200',
    iconClass: 'text-green-500',
    dotClass: 'bg-green-500',
  },
  pending: {
    label: 'Pending',
    icon: AlertCircle,
    containerClass: 'bg-yellow-50 border-yellow-200',
    badgeClass: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    iconClass: 'text-yellow-500',
    dotClass: 'bg-yellow-400',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    containerClass: 'bg-red-50 border-red-200',
    badgeClass: 'bg-red-100 text-red-600 border border-red-200',
    iconClass: 'text-red-400',
    dotClass: 'bg-red-400',
  },
};

const FILTERS = ['All', 'Approved', 'Pending', 'Rejected'];

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getMyBookings();
        const data = res.data.bookings || res.data.data || res.data || [];
        // Sort newest first
        const sorted = [...(Array.isArray(data) ? data : [])].sort(
          (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
        );
        setBookings(sorted);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = filter === 'All'
    ? bookings
    : bookings.filter((b) => b.status === filter.toLowerCase());

  const counts = {
    All: bookings.length,
    Approved: bookings.filter((b) => b.status === 'approved').length,
    Pending: bookings.filter((b) => b.status === 'pending').length,
    Rejected: bookings.filter((b) => b.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="pt-20 px-6 pb-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />

      <div className="pt-20 px-6 pb-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 mt-4">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Bookings</h1>
          <p className="text-gray-400 text-sm mt-1">Track all your court reservations</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Approved', count: counts.Approved, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
            { label: 'Pending', count: counts.Pending, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
            { label: 'Rejected', count: counts.Rejected, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
          ].map(({ label, count, color, bg, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
              <p className={`text-3xl font-black ${color}`}>{count}</p>
              <p className="text-gray-500 text-xs font-semibold mt-1 tracking-widest uppercase">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
                filter === f
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600'
              }`}
            >
              {f}
              <span className={`ml-1.5 ${filter === f ? 'text-green-200' : 'text-gray-400'}`}>
                ({counts[f]})
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-semibold">No {filter !== 'All' ? filter.toLowerCase() : ''} bookings found</p>
            <p className="text-gray-300 text-sm mt-1">Your reservations will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((booking, idx) => {
              const statusKey = booking.status || 'pending';
              const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
              const StatusIcon = config.icon;
              const bookingId = booking._id || booking.id || `booking-${idx}`;
              const isExpanded = expandedId === bookingId;

              return (
                <div
                  key={bookingId}
                  className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${config.containerClass}`}
                >
                  {/* Main Row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : bookingId)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Status dot */}
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${config.dotClass}`} />

                      {/* Date & Slot */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gray-900 font-bold text-sm">
                            {formatDisplayDate(booking.bookingDate)}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${config.badgeClass}`}>
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-500 text-xs">{booking.timeSlot}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <div className="flex-shrink-0 text-gray-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Name', value: booking.customerName },
                          { label: 'Email', value: booking.email },
                          { label: 'Phone', value: booking.phoneNumber },
                          { label: 'Booking ID', value: bookingId?.slice(-8).toUpperCase() },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase mb-0.5">{label}</p>
                            <p className="text-sm text-gray-700 font-medium">{value || '—'}</p>
                          </div>
                        ))}
                        {booking.notes && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase mb-0.5">Notes</p>
                            <p className="text-sm text-gray-700">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;