import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ScissorsIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon, UserIcon, PhoneIcon, EnvelopeIcon, CalendarDaysIcon, StarIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import BookingModal from '../components/BookingModal';
import { motion } from 'framer-motion';

const CaregiverCards = () => {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('experience-desc');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileCaregiver, setProfileCaregiver] = useState(null);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/caregivers');
      setCaregivers(response.data);
      
      const uniqueSpecializations = [...new Set(response.data.map(caregiver => 
        caregiver.specialization))];
      setSpecializations(uniqueSpecializations);
    } catch (err) {
      console.error('Error fetching caregivers:', err);
      setError('Failed to load caregivers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (caregiver, event) => {
    if (event) {
      event.preventDefault();
    }
    
    if (!user) return navigate('/login');
    
    setSelectedCaregiver(caregiver);
    setShowBookingModal(true);
  };

  const handleProfileClick = (caregiver, event) => {
    if (event) {
      event.preventDefault();
    }
    
    setProfileCaregiver(caregiver);
    setShowProfileModal(true);
  };

  const handleBookingSuccess = (booking) => {
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 3000);
  };

  const filteredCaregivers = caregivers.filter(caregiver => {
    const matchesSpecialization = !selectedSpecialization || 
      caregiver.specialization === selectedSpecialization;
    
    const matchesSearch = !searchTerm ||
      caregiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caregiver.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSpecialization && matchesSearch;
  });

  const sortedCaregivers = [...filteredCaregivers].sort((a, b) => {
    switch (sortOption) {
      case 'experience-desc':
        return b.experience - a.experience;
      case 'experience-asc':
        return a.experience - b.experience;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'rating-desc':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const checkAvailability = (caregiver) => {
    if (availabilityFilter === 'all') return true;
    return Math.random() > 0.5;
  };

  const availableCaregivers = sortedCaregivers.filter(checkAvailability);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" 
         style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)' }}>
      <div className="min-h-screen backdrop-blur-sm bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Expert Pet Caregivers
            </motion.h1>
            <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">
              Discover our trusted professionals dedicated to your pet's wellbeing
            </p>
          </div>

          {/* Filters Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search caregivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Specialization Dropdown */}
              <div className="relative">
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="w-full pl-3 pr-10 py-3 bg-white/80 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                <FunnelIcon className="w-5 h-5 absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Availability Filter */}
              <div className="relative">
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="w-full pl-3 pr-10 py-3 bg-white/80 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Availability</option>
                  <option value="available">Available Today</option>
                  <option value="week">Available This Week</option>
                </select>
                <CheckCircleIcon className="w-5 h-5 absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort Options */}
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full pl-3 pr-10 py-3 bg-white/80 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="experience-desc">Experience: High to Low</option>
                  <option value="experience-asc">Experience: Low to High</option>
                  <option value="name-asc">Name: A-Z</option>
                  <option value="name-desc">Name: Z-A</option>
                  <option value="rating-desc">Rating: High to Low</option>
                </select>
                <ScissorsIcon className="w-5 h-5 absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-center gap-3 text-red-700">
                <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-xl p-6 h-96" />
                ))}
              </div>
            ) : availableCaregivers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCaregivers.map((caregiver) => (
                  <motion.div 
                    key={caregiver._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl"
                  >
                    <div className="relative h-64 overflow-hidden">
                      {caregiver.profileImage ? (
                        <img 
                          src={caregiver.profileImage} 
                          alt={caregiver.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center">
                          <UserIcon className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      {caregiver.status === 'active' && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                          Active
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{caregiver.name}</h3>
                        <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                          <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-yellow-700 text-sm font-medium">
                            {caregiver.rating?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">{caregiver.specialization}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ScissorsIcon className="w-5 h-5 text-purple-500" />
                          <span>{caregiver.experience} years experience</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarDaysIcon className="w-5 h-5 text-green-500" />
                          <span>Member since {formatDate(caregiver.createdAt)}</span>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <button 
                          onClick={(e) => handleProfileClick(caregiver, e)}
                          className="bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={(e) => handleBookClick(caregiver, e)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-4 rounded-xl font-medium hover:shadow-lg transition-all"
                        >
                          Book Session
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-xl bg-gray-50/50">
                <div className="max-w-md mx-auto">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">No caregivers found</h3>
                  <p className="mt-2 text-gray-600">Try adjusting your search filters</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSpecialization('');
                      setAvailabilityFilter('all');
                    }}
                    className="mt-6 px-6 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Modal */}
        {showProfileModal && profileCaregiver && (
          <Dialog
            open={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <Dialog.Panel className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <Dialog.Title className="text-2xl font-bold text-gray-900">
                    Caregiver Profile
                  </Dialog.Title>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                  <div className="relative">
                    {profileCaregiver.profileImage ? (
                      <img 
                        src={profileCaregiver.profileImage} 
                        alt={profileCaregiver.name}
                        className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
                        <UserIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-medium ${
                      profileCaregiver.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {profileCaregiver.status}
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {profileCaregiver.name}
                    </h2>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                      <StarIcon className="w-5 h-5 text-yellow-500" />
                      <span className="text-lg font-medium text-gray-700">
                        {profileCaregiver.rating?.toFixed(1) || 'No rating yet'}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="font-medium">{profileCaregiver.specialization}</span>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{profileCaregiver.email}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <PhoneIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{profileCaregiver.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Professional Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <ScissorsIcon className="w-5 h-5 text-purple-500" />
                        <div>
                          <span className="text-gray-700 font-medium">{profileCaregiver.experience} years</span>
                          <p className="text-sm text-gray-500">Experience</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <CalendarDaysIcon className="w-5 h-5 text-green-500" />
                        <div>
                          <span className="text-gray-700 font-medium">{formatDate(profileCaregiver.createdAt)}</span>
                          <p className="text-sm text-gray-500">Member since</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Caregiver</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {profileCaregiver.name} is a dedicated {profileCaregiver.specialization.toLowerCase()} specialist with {profileCaregiver.experience} years of experience in pet care. 
                    They have been a trusted member of our community since {formatDate(profileCaregiver.createdAt)} and are committed to providing the best care for your beloved pets.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      handleBookClick(profileCaregiver);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Book Session with {profileCaregiver.name}
                  </button>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Dialog>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedCaregiver && (
          <Dialog
            open={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
            <Dialog.Panel className="relative bg-white rounded-2xl p-8 max-w-xl w-full">
              <BookingModal
                caregiver={selectedCaregiver}
                onClose={() => setShowBookingModal(false)}
                onBookingSuccess={handleBookingSuccess}
              />
            </Dialog.Panel>
          </Dialog>
        )}

        {/* Success Toast */}
        {bookingSuccess && (
          <div className="fixed bottom-6 right-6 bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            <span>Booking confirmed! Check your email for details</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaregiverCards;