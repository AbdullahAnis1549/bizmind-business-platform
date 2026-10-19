import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
  Check,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import GlobalSearchModal from './GlobalSearchModal';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, business, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    if (!notif.read) markAsRead(notif._id);
    setShowNotifMenu(false);
    if (notif.link) navigate(notif.link);
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'new_order':
        return <ShoppingCart className="w-4 h-4 text-brand-500" />;
      case 'payment_received':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const roleBadgeColor = {
    owner: 'bg-brand-50 text-brand-700 border-brand-200',
    manager: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    staff: 'bg-slate-100 text-slate-700 border-slate-200',
  }[user?.role] || 'bg-slate-100 text-slate-700';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md">
        {/* Left Section: Mobile Menu & Workspace Info */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition lg:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
              Workspace
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
              {business?.name || 'BizMind AI Workspace'}
            </h2>
          </div>
        </div>

        {/* Center: Global Search trigger button */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-100/70 transition text-sm shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search customers, products, orders...</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-medium text-slate-500 bg-white border border-slate-200 rounded-md shadow-xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Section: Mobile Search, AI Chip, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search icon */}
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition md:hidden"
            aria-label="Open search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* AI Assistant Quick Access */}
          {user?.role !== 'staff' && (
            <Link
              to="/ai-assistant"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 text-brand-700 text-xs font-semibold hover:shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
              <span>AI Copilot</span>
            </Link>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifMenu((prev) => !prev)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-in zoom-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-medium text-brand-600 hover:text-brand-800 transition"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition ${
                          !n.read ? 'bg-brand-50/30' : ''
                        }`}
                      >
                        <div className="mt-0.5 p-2 rounded-xl bg-slate-100 shrink-0">
                          {getNotifIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs sm:text-sm font-semibold truncate ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString()} at{' '}
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-brand-600 mt-2 shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            >
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff&bold=true`
                }
                alt={user?.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                  {user?.name}
                </div>
                <div className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider">
                  {user?.role}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-2">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                      Role: {user?.role?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Workspace Settings</span>
                  </Link>
                  {user?.role !== 'staff' && (
                    <Link
                      to="/ai-assistant"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-brand-700 hover:bg-brand-50/50 transition"
                    >
                      <Sparkles className="w-4 h-4 text-brand-600" />
                      <span>AI Assistant</span>
                    </Link>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};

export default Navbar;
