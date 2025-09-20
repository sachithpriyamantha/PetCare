import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, Transition, Dialog } from "@headlessui/react";
import {
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { FaExclamationTriangle } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);


  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await axios.get("/api/emergency/my-requests", {
        withCredentials: true,
      });
      const updatedEmergencies = response.data.filter(
        (emergency) => emergency.status !== "pending"
      );
      setNotifications(updatedEmergencies);
      
      const unread = updatedEmergencies.filter(emergency => !emergency.isRead);
      setUnreadCount(unread.length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await axios.patch(`/api/emergency/${notification._id}/mark-read`, {}, {
          withCredentials: true,
        });
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notification._id 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setSelectedNotification(notification);
      setIsNotificationOpen(true);
    } catch (err) {
      console.error("Failed to handle notification:", err);
    }
  };

 
  const clearAllNotifications = async () => {
    try {
      await axios.patch("/api/emergency/mark-all-read", {}, {
        withCredentials: true,
      });
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Community", href: "/community" },
    { name: "Training", href: "/training" },
    { name: "Pet Profile", href: "/pets" },
    { name: "Dashboard", href: "/dashboard", adminOnly: true },
  ];

  return (
    <nav className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Brand & Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg group-hover:rotate-12 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Purr & Bark
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {navigation
                .filter((item) => !item.adminOnly || user?.isAdmin)
                .map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg transition-colors font-medium text-sm relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all"
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
          </div>

          {/* Right side - Search, Notifications, User */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Search Bar */}
            {/* <div className="hidden sm:block relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div> */}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Notification Bell with Popup */}
            {user && (
              <Menu as="div" className="relative">
                <Menu.Button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative">
                  <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Menu.Button>
                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-gray-100 dark:divide-gray-800 rounded-lg bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none max-h-96 overflow-y-auto">
                    <div className="p-4 flex justify-between items-center">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Notifications
                      </p>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <Menu.Item key={notification._id}>
                          {({ active }) => (
                            <div
                              onClick={() => handleNotificationClick(notification)}
                              className={`${
                                active ? "bg-gray-50 dark:bg-gray-800" : ""
                              } p-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 cursor-pointer ${
                                !notification.isRead ? "bg-blue-50 dark:bg-blue-900/30" : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <FaExclamationTriangle className="text-red-500 mt-1" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {notification.petName}'s Emergency
                                    {!notification.isRead && (
                                      <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Status: {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                    {notification.emergencyDetails}
                                  </p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </Menu.Item>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                        No new notifications
                      </div>
                    )}
                  </Menu.Items>
                </Transition>
              </Menu>
            )}

            {/* Notification Message Popup */}
            <Transition appear show={isNotificationOpen} as={React.Fragment}>
              <Dialog
                as="div"
                className="relative z-50"
                onClose={() => setIsNotificationOpen(false)}
              >
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                      <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                        {selectedNotification && (
                          <>
                            <Dialog.Title
                              as="h3"
                              className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2"
                            >
                              <FaExclamationTriangle className="text-red-500" />
                              Emergency Notification
                            </Dialog.Title>
                            <div className="mt-4">
                              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                  {selectedNotification.petName}'s emergency has been {selectedNotification.status}!
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                  {selectedNotification.emergencyDetails}
                                </p>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  <div>
                                    <p>Type:</p>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                      {selectedNotification.emergencyType.charAt(0).toUpperCase() + 
                                       selectedNotification.emergencyType.slice(1)}
                                    </p>
                                  </div>
                                  <div>
                                    <p>Reported:</p>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                      {new Date(selectedNotification.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                              <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                                onClick={() => setIsNotificationOpen(false)}
                              >
                                Close
                              </button>
                              <Link
                                to={`/emergency/${selectedNotification._id}`}
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                                onClick={() => setIsNotificationOpen(false)}
                              >
                                View Details
                              </Link>
                            </div>
                          </>
                        )}
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition>

            {/* User Section */}
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 pr-3 transition-colors">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                      {user.username}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </Menu.Button>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-800 rounded-lg bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none">
                    <div className="p-2">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? "bg-gray-50 dark:bg-gray-800" : ""
                            } flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md`}
                          >
                            <UserCircleIcon className="w-5 h-5" />
                            <span>Profile</span>
                          </Link>
                        )}
                      </Menu.Item>
                      {user?.isAdmin && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin"
                              className={`${
                                active ? "bg-gray-50 dark:bg-gray-800" : ""
                              } flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md`}
                            >
                              <Squares2X2Icon className="w-5 h-5" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/settings"
                            className={`${
                              active ? "bg-gray-50 dark:bg-gray-800" : ""
                            } flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md`}
                          >
                            <Cog6ToothIcon className="w-5 h-5" />
                            <span>Settings</span>
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                    <div className="p-2">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? "bg-gray-50 dark:bg-gray-800" : ""
                            } flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md`}
                          >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                            <span>Sign out</span>
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition
        show={isMobileMenuOpen}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Mobile Navigation Links */}
          <div className="p-4 space-y-2">
            {navigation
              .filter((item) => !item.adminOnly || user?.isAdmin)
              .map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
          </div>
        </div>
      </Transition>
    </nav>
  );
};

export default Navbar;