import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, RefreshCw, MoreVertical, Phone, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';

const PendingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [selectedBookings, setSelectedBookings] = useState([]);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('YOUR_API_URL/api/bookings/pending');
      
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch pending bookings');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the code from the artifact

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex-1 ml-72 p-8">
        {/* Rest of the component */}
      </div>
    </div>
  );
};

export default PendingRequests;