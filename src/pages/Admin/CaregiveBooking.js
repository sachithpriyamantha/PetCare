import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FaSearch, FaFilter, FaSync, FaExclamationTriangle, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/caregiver-bookings/admin', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setBookings(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bookings');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await axios.put(
        `/api/caregiver-bookings/${bookingId}/status`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? response.data : booking
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking?.status === statusFilter;
    
    if (searchTerm === '') {
      return matchesStatus;
    }
    
    const caregiverName = booking.caregiver?.name?.toLowerCase() || '';
    const username = booking.user?.username?.toLowerCase() || '';
    const instructions = booking.specialInstructions?.toLowerCase() || '';
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    const matchesSearch = 
      caregiverName.includes(lowerSearchTerm) ||
      username.includes(lowerSearchTerm) ||
      instructions.includes(lowerSearchTerm);
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    
    const badgeStatus = status || 'unknown';
    
    return (
      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusClasses[badgeStatus]}`}>
        {badgeStatus.charAt(0).toUpperCase() + badgeStatus.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed">
      {/* Background image overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20"></div>
      <div className="backdrop-blur-sm bg-black/30 min-h-screen"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Content Container */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20">
            {/* Navigation Header */}
            <div className="flex justify-between items-center mb-8"></div>
            <button
                    onClick={() => navigate(-1)}  
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back
                  </button>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 p-6 sm:p-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Manage Bookings
              </h1>
            </div>

            {/* Subtitle */}
            <div className="px-6 sm:px-8 pb-6">
              <p className="text-gray-600">View and manage all caregiver bookings</p>
            </div>

            {/* Error display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mx-6 mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-3"
                >
                  <FaTimes className="text-red-500 shrink-0" />
                  <p className="text-red-800">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters */}
            <div className="p-6 bg-gray-50/50 border-b border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-500 shrink-0" />
                  <select
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white/50"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/50 hover:bg-white border border-gray-200 rounded-xl transition-all"
                >
                  <FaSync className={`${loading ? "animate-spin" : ""}`} />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {!loading && bookings.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6"
              >
                <div className="bg-white/80 p-4 rounded-xl border border-gray-200 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <FaExclamationTriangle className="text-indigo-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Bookings</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {bookings.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 p-4 rounded-xl border border-gray-200 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FaSpinner className="text-yellow-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {bookings.filter((b) => b.status === "pending").length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 p-4 rounded-xl border border-gray-200 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaCheck className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Confirmed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {bookings.filter((b) => b.status === "confirmed").length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 p-4 rounded-xl border border-gray-200 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaCheck className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {bookings.filter((b) => b.status === "completed").length}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bookings table */}
            <div className="p-6">
              {!bookings || bookings.length === 0 ? (
                <div className="bg-gray-50/50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                  <FaExclamationTriangle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-xl font-medium text-gray-500">No bookings available</p>
                  <p className="mt-2 text-gray-500">There are currently no bookings to display</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="bg-gray-50/50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                  <FaExclamationTriangle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-xl font-medium text-gray-500">No bookings found</p>
                  <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 backdrop-blur-sm sticky top-0">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Caregiver</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Instructions</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <AnimatePresence>
                          {filteredBookings.map((booking) => (
                            <motion.tr
                              key={booking._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-gray-50/30 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {booking.caregiver?.profileImage ? (
                                      <img className="h-10 w-10 rounded-full" src={booking.caregiver.profileImage} alt={booking.caregiver?.name || 'Caregiver'} />
                                    ) : (
                                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-indigo-600 font-medium">{booking.caregiver?.name?.charAt(0) || 'C'}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {booking.caregiver?.name || 'Unknown Caregiver'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {booking.caregiver?.specialization || 'No specialization'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.user?.username || 'Unknown User'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.user?.email || 'No email'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {booking.date ? format(new Date(booking.date), 'MMM dd, yyyy') : 'No date'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.startTime || '--'} - {booking.endTime || '--'}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs truncate" title={booking.specialInstructions || 'No special instructions'}>
                                  {booking.specialInstructions || 'None'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(booking.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                  <div className="flex space-x-2 justify-end">
                                    {booking.status !== 'confirmed' && (
                                      <button
                                        onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                                        className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50"
                                      >
                                        Confirm
                                      </button>
                                    )}
                                    <button
                                      onClick={() => updateBookingStatus(booking._id, 'completed')}
                                      className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                                    >
                                      Complete
                                    </button>
                                    <button
                                      onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                      className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;