import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useNotification } from '../context/NotificationContext';

const NotificationPopup = ({ isOpen, onClose }) => {
  const { notifications, markAsRead } = useNotification();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'responded':
        return <ClockIcon className="w-6 h-6 text-blue-500" />;
      case 'resolved':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      default:
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'responded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleClose = () => {
    markAsRead();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-lg font-semibold text-white">
                      Emergency Response Updates
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <CheckCircleIcon className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No new notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <div key={notification._id} className="px-6 py-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {getStatusIcon(notification.status)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-900">
                                  Emergency Update for {notification.petName}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(notification.status)}`}>
                                  {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Pet Type:</span> {notification.petType}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Emergency Type:</span> {notification.emergencyType}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Original Details:</span> {notification.emergencyDetails}
                                </p>
                                
                                {notification.adminResponse && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                    <div className="flex items-center gap-2 mb-2">
                                      <UserIcon className="w-4 h-4 text-blue-600" />
                                      <span className="text-sm font-medium text-blue-900">
                                        Admin Response by {notification.respondedBy?.username || 'Staff'}
                                      </span>
                                    </div>
                                    <p className="text-sm text-blue-800">
                                      {notification.adminResponse}
                                    </p>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                  <span className="text-xs text-gray-500">
                                    Submitted: {formatDate(notification.createdAt)}
                                  </span>
                                  {notification.respondedAt && (
                                    <span className="text-xs text-gray-500">
                                      Responded: {formatDate(notification.respondedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="bg-gray-50 px-6 py-4">
                    <button
                      onClick={handleClose}
                      className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark All as Read
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NotificationPopup;