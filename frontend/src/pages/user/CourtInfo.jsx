import { useState, useEffect } from 'react';
import UserNavbar from '../../components/UserNavbar';
import { getSettings } from '../../services/api';
import { Clock, MapPin, Shield, ChevronDown, ChevronUp, AlertCircle, Wifi, Car, Droplets, Wind, Star, Zap } from 'lucide-react';

// Static FAQs — not in DB, kept as-is
const FAQS = [
  {
    q: 'How far in advance can I book a slot?',
    a: 'You can book slots for any future date. Bookings are confirmed once an admin approves your request.',
  },
  {
    q: 'What is the cancellation policy?',
    a: 'Cancellations must be made at least 24 hours before your booked slot.',
  },
  {
    q: 'What should I bring?',
    a: 'Bring your own futsal shoes, shin guards, and sports attire. We provide the ball.',
  },
  {
    q: 'Is the court available for tournaments?',
    a: 'Yes! Contact us directly to arrange a full-day booking with custom scheduling.',
  },
  {
    q: 'Are there changing rooms available?',
    a: 'Yes, we have separate changing rooms and shower facilities for all players.',
  },
];

// Fallback facility icons — map common facility names to icons
const FACILITY_ICONS = {
  'wifi': Wifi,
  'wi-fi': Wifi,
  'parking': Car,
  'shower': Droplets,
  'showers': Droplets,
  'ventilation': Wind,
  'security': Shield,
  'cctv': Shield,
  'turf': Star,
  'lighting': Zap,
};

const getFacilityIcon = (name) => {
  const key = name.toLowerCase();
  for (const [k, Icon] of Object.entries(FACILITY_ICONS)) {
    if (key.includes(k)) return Icon;
  }
  return Star; // default icon
};

const formatTime = (timeStr) => {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

const CourtInfo = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        const data = res.data.data || res.data;
        console.log('Settings from DB:', data);
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading court info...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">Failed to load court info</p>
            <p className="text-gray-400 text-sm mt-1">Check your connection and try again</p>
          </div>
        </div>
      </div>
    );
  }

  const facilities = Array.isArray(settings?.facilities) ? settings.facilities : [];
  const courtRules = Array.isArray(settings?.courtRules) ? settings.courtRules : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />

      <div className="pt-20 pb-16">

        {/* Hero Banner */}
        <div className="relative bg-green-600 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-green-500 rounded-full opacity-40" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-green-700 rounded-full opacity-30" />
          <div className="absolute top-8 right-48 w-20 h-20 bg-green-400 rounded-full opacity-20" />

          <div className="relative px-6 py-14 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              Futsal Arena
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-3">
              {settings?.courtName || 'The Court'}
            </h1>
            {settings?.address && (
              <div className="flex items-center gap-2 text-green-100 text-sm">
                <MapPin className="w-4 h-4" />
                {settings.address}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 max-w-4xl mx-auto mt-8 space-y-6">

          {/* Opening Hours */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-gray-900 font-black text-sm tracking-widest uppercase">Opening Hours</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Opens</p>
                <p className="text-2xl font-black text-green-600">{formatTime(settings?.openingTime || '06:00')}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center flex items-center justify-center">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Slot Duration</p>
                  <p className="text-lg font-black text-gray-700">1 Hour</p>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Closes</p>
                <p className="text-2xl font-black text-gray-800">{formatTime(settings?.closingTime || '23:00')}</p>
              </div>
            </div>
            <div className="mt-4 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
              <p className="text-green-700 text-xs font-semibold text-center">Open Every Day · Booking Requires Admin Approval</p>
            </div>
          </div>

          {/* Address — only show if set in DB */}
          {settings?.address && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="text-gray-900 font-black text-sm tracking-widest uppercase">Location</h2>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{settings.address}</p>
            </div>
          )}

          {/* Facilities — only show if admin has added any */}
          {facilities.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-gray-900 font-black text-sm tracking-widest uppercase mb-5">Facilities</h2>
              <div className="grid grid-cols-3 gap-3">
                {facilities.map((facility, i) => {
                  const Icon = getFacilityIcon(facility);
                  return (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-xs font-semibold">{facility}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Court Rules — only show if admin has added any */}
          {courtRules.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="text-gray-900 font-black text-sm tracking-widest uppercase">Court Rules</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {courtRules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                    <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-600 text-xs leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ — static, always shown */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-gray-900 font-black text-sm tracking-widest uppercase mb-5">
              Frequently Asked Questions
            </h2>
            <div className="space-y-2">
              {FAQS.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className={`border rounded-xl overflow-hidden transition-all ${
                      isOpen ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3"
                    >
                      <span className={`text-sm font-semibold ${isOpen ? 'text-green-800' : 'text-gray-700'}`}>
                        {faq.q}
                      </span>
                      {isOpen
                        ? <ChevronUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      }
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourtInfo;