import { useState, useEffect } from 'react';
import UserNavbar from '../../components/UserNavbar';
import { getSettings, getMyBookings, createBooking, getMe } from '../../services/api';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

const generateTimeSlots = (openingTime = '06:00', closingTime = '23:00') => {
  const slots = [];
  const [openH] = openingTime.split(':').map(Number);
  const [closeH] = closingTime.split(':').map(Number);
  for (let h = openH; h < closeH; h++) {
    const start = h % 12 === 0 ? 12 : h % 12;
    const end = (h + 1) % 12 === 0 ? 12 : (h + 1) % 12;
    const startSuffix = h < 12 ? 'AM' : 'PM';
    const endSuffix = h + 1 < 12 ? 'AM' : 'PM';
    slots.push(`${start}:00 ${startSuffix} - ${end}:00 ${endSuffix}`);
  }
  return slots;
};

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};


const normalizeDateKey = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
};


const normalizeSlot = (slot) => slot?.trim().replace(/\s+/g, ' ') ?? '';

const Dashboard = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [settings, setSettings] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerName: '', email: '', phoneNumber: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, bookingsRes, meRes] = await Promise.all([
        getSettings(),
        getMyBookings(),
        getMe(),
      ]);

      setSettings(settingsRes.data.data);

      const bookingsData = bookingsRes.data.bookings || bookingsRes.data.data || bookingsRes.data || [];

      console.log('RAW bookings:', JSON.stringify(bookingsData, null, 2));

      setMyBookings(Array.isArray(bookingsData) ? bookingsData : []);

      const u = meRes.data.user || meRes.data.data;
      setUser(u);
      setForm((prev) => ({
        ...prev,
        customerName: u.username || '',
        email: u.email || '',
      }));
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const timeSlots = settings
    ? generateTimeSlots(settings.openingTime, settings.closingTime)
    : generateTimeSlots();


  const bookedMap = {};
  myBookings.forEach((b) => {
    const dateKey = normalizeDateKey(b.bookingDate);
    const slotKey = normalizeSlot(b.timeSlot);
    if (!bookedMap[dateKey]) bookedMap[dateKey] = {};
    bookedMap[dateKey][slotKey] = b.status;
  });

  // Check browser console: do dateKey + slotKey match what getSlotStatus generates?
  console.log('bookedMap:', bookedMap);

  const getSlotStatus = (slot) => {
    const dateKey = formatDateKey(selectedDate);
    const slotKey = normalizeSlot(slot);
    const status = bookedMap[dateKey]?.[slotKey];
    console.log(`[${dateKey}] "${slotKey}" => DB status: "${status}"`);
    if (status === 'approved') return 'booked';
    if (status === 'pending') return 'pending';
    return 'available';
  };

  const datesWithBookings = new Set(myBookings.map((b) => normalizeDateKey(b.bookingDate)));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleSlotClick = (slot) => {
    const status = getSlotStatus(slot);
    if (status !== 'available') {
      toast.error(`This slot is already ${status}`);
      return;
    }
    setSelectedSlot(slot);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.customerName || !form.email || !form.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email');
      return;
    }
    try {
      setSubmitting(true);
      const bookingData = {
        customerName: form.customerName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        bookingDate: formatDateKey(selectedDate),
        timeSlot: selectedSlot,
        notes: form.notes || '',
      };
      await createBooking(bookingData);
      toast.success('Booking submitted! Awaiting approval.');
      setShowForm(false);
      setSelectedSlot(null);
      await fetchData();
    } catch (err) {
      console.error('Booking error:', err);
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDateLabel = selectedDate
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="pt-20 px-6 pb-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <div className="pt-20 px-6 pb-10">
        <div className="border border-gray-200 rounded-2xl overflow-hidden flex shadow-sm bg-white" style={{ minHeight: '75vh' }}>

          {/* Calendar Panel */}
          <div className="w-96 bg-white border-r border-gray-100 p-8 flex-shrink-0">
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
              <h2 className="text-gray-900 font-black tracking-widest text-sm">{MONTHS[month]} {year}</h2>
              <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-3">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs text-gray-400 font-bold py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(year, month, day);
                const key = formatDateKey(date);
                const isToday = formatDateKey(date) === formatDateKey(today);
                const isSelected = formatDateKey(date) === formatDateKey(selectedDate);
                const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const hasBooking = datesWithBookings.has(key);

                return (
                  <button
                    key={day}
                    onClick={() => !isPast && setSelectedDate(date)}
                    disabled={isPast}
                    className={`relative flex flex-col items-center justify-center h-10 w-10 mx-auto rounded-xl text-sm font-semibold transition-all ${
                      isSelected ? 'bg-green-600 text-white'
                        : isToday ? 'border border-green-600 text-green-600'
                        : isPast ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                    {hasBooking && (
                      <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Panel */}
          <div className="flex-1 bg-gray-50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-black tracking-widest text-sm">{selectedDateLabel}</h3>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Clock className="w-4 h-4" />
                1 Hour Slots
              </div>
            </div>

            {timeSlots.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No time slots available</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {timeSlots.map((slot) => {
                  const status = getSlotStatus(slot);
                  const isSelectedSlot = selectedSlot === slot;

                  // ✅ Slot visual styles
                  const containerClass =
                    status === 'booked'
                      ? 'border-red-500 bg-red-500 cursor-not-allowed'
                      : status === 'pending'
                      ? 'border-yellow-300 bg-yellow-50 cursor-not-allowed'
                      : isSelectedSlot
                      ? 'border-green-500 bg-green-50 cursor-pointer'
                      : 'border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 cursor-pointer';

                  const timeClass =
                    status === 'booked' ? 'font-bold text-xs mb-1 text-white'
                      : status === 'pending' ? 'font-bold text-xs mb-1 text-yellow-900'
                      : 'font-bold text-xs mb-1 text-gray-800';

                  const labelClass =
                    status === 'booked' ? 'text-xs font-semibold text-red-100'
                      : status === 'pending' ? 'text-xs font-semibold text-yellow-600'
                      : 'text-xs font-semibold text-green-600';

                  const labelText =
                    status === 'booked' ? 'Booked'
                      : status === 'pending' ? 'Pending'
                      : 'Available';

                  return (
                    <button
                      key={slot}
                      onClick={() => handleSlotClick(slot)}
                      disabled={status !== 'available'}
                      className={`rounded-xl border p-4 text-left transition-all ${containerClass}`}
                    >
                      <p className={timeClass}>{slot}</p>
                      <p className={labelClass}>{labelText}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Booking Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-xl">
              <h3 className="text-gray-900 font-black text-lg mb-1">Confirm Booking</h3>
              <p className="text-gray-400 text-sm mb-6">{selectedDateLabel} · {selectedSlot}</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-semibold">Full Name *</label>
                  <input
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-semibold">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-semibold">Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+977 9800000000"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-semibold">Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Any special requests..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowForm(false); setSelectedSlot(null); }}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;