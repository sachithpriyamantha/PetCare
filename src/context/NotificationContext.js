import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/emergency/notifications', {
        withCredentials: true,
      });
      setNotifications(response.data);
      setUnreadCount(response.data.length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.patch('/api/emergency/notifications/mark-read', {}, {
        withCredentials: true,
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(notif => ({ ...notif, userNotified: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
       
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};