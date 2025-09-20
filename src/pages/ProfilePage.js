import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PencilSquareIcon, 
  ArrowLeftOnRectangleIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://pet-care-api-nine.vercel.app/';

const ProfilePage = () => {
  const { user, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || 'Passionate pet lover and caregiver',
    profileImage: user?.profileImage || null
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage
      });
      console.log('Profile Image URL:', user.profileImage);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to logout');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        const response = await axios.post(`${BASE_URL}/api/profile/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        console.log('Upload Response:', response.data);
        setFormData(prev => ({ ...prev, profileImage: response.data.profileImage }));
        setUser(prev => ({ ...prev, profileImage: response.data.profileImage }));
        setError(null);
      } catch (err) {
      //  setError(err.response?.data?.message || 'Failed to upload image');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`${BASE_URL}/api/profile`, {
        username: formData.username,
        email: formData.email,
        bio: formData.bio
      }, { withCredentials: true });
      setUser(response.data.user);
      setEditMode(false);
      setError(null);
    } catch (err) {
    //  setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
    window.location.reload()
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-6 sm:p-8 border border-white/20">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold text-white drop-shadow-md">
              Profile Settings
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
              disabled={loading}
            >
              {editMode ? (
                <>
                  <XMarkIcon className="w-5 h-5" />
                  Cancel
                </>
              ) : (
                <>
                  <PencilSquareIcon className="w-5 h-5" />
                  Edit Profile
                </>
              )}
            </motion.button>
          </div>

          {/* Profile Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Picture Section */}
            <div className="w-full lg:w-1/3 flex flex-col items-center">
              <motion.div 
                className="relative group"
                whileHover={{ scale: editMode ? 1.05 : 1 }}
              >
                <label 
                  htmlFor="profile-upload" 
                  className={`cursor-pointer ${editMode ? 'hover:ring-4 ring-white/30' : ''} transition-all`}
                >
                  {formData.profileImage ? (
                    <img 
                      src={`${BASE_URL}${formData.profileImage}`} 
                      alt="Profile" 
                      className="w-48 h-48 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center shadow-2xl">
                      <UserCircleIcon className="w-32 h-32 text-white/50" />
                    </div>
                  )}
                  {editMode && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <CameraIcon className="w-8 h-8 text-white" />
                    </div>
                  )}
                </label>
                {editMode && (
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                )}
              </motion.div>
              
              {/* Stats Overview */}
              {!editMode && (
                <div className="mt-6 text-center space-y-2">
                  <p className="text-white/80">Member since {new Date(user.createdAt).getFullYear()}</p>
                  <div className="flex justify-center gap-4">
                    <div className="bg-white/10 px-4 py-2 rounded-lg">
                      <p className="text-white font-bold">{user.pets?.length || 0}</p>
                      <p className="text-white/80 text-sm">Pets</p>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-lg">
                      <p className="text-white font-bold">4.9★</p>
                      <p className="text-white/80 text-sm">Rating</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Details Section */}
            <div className="flex-1 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Full Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/50"
                      placeholder="Enter your name"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-white text-xl font-medium">{user.username}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Email Address
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/50"
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-white/70" />
                      <p className="text-white text-xl font-medium">{user.email}</p>
                    </div>
                  )}
                </div>

                {/* Bio Field */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Bio
                  </label>
                  {editMode ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/50 h-32"
                      placeholder="Tell us about yourself..."
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-white/80 text-lg italic">"{formData.bio}"</p>
                  )}
                </div>

                {/* Save Button */}
                {editMode && (
                  <motion.div 
                    className="pt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button
                      type="submit"
                      className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                      disabled={loading}
                    >
                      <CheckIcon className="w-5 h-5" />
                      Save Changes
                    </button>
                  </motion.div>
                )}
              </form>

              {/* Account Actions */}
              {!editMode && (
                <div className="pt-8 border-t border-white/20 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    <span className="text-lg">Logout Account</span>
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;