import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import { useLanguage } from '../context/LanguageContext';
import {
  Menu,
  X,
  PlusCircle,
  MapPin,
  Calendar,
  BarChart3,
  Info,
  PhoneCall,
  Bell,
  User,
  LogOut,
  Shield,
  Layers,
  ChevronDown,
  Languages
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isCoordinator, isVolunteer } = useAuth();
  const { unreadCount } = useNotifications();
  const { lang, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('issues'), path: '/issues', icon: MapPin },
    { name: t('activities'), path: '/activities', icon: Calendar },
    { name: t('impact'), path: '/impact', icon: BarChart3 },
    { name: t('aboutSevadeep'), path: '/about', icon: Info },
    { name: t('contact'), path: '/contact', icon: PhoneCall },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & NGO Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-xl bg-forest-dark flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <img
                src="/assets/sevadeep_logo.png"
                alt="Sevadeep NGO Logo"
                className="h-full w-full object-contain filter brightness-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="text-white font-bold text-xl hidden">SD</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-forest tracking-tight">Sevadeep</span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  CivicConnect
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {lang === 'mr' ? 'स्वयंसेवी संस्था, पुणे • नागरी कृती व्यासपीठ' : 'NGO Pune, Maharashtra • Community Action Platform'}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'text-emerald-800 bg-emerald-50/80 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions & Profile Area */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher Pill */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50 text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer shadow-2xs"
              title={lang === 'en' ? 'मराठी भाषेत वापरा' : 'Switch to English'}
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'en' ? 'मराठी' : 'English'}</span>
            </button>

            {/* Primary Action Button: Report an Issue */}
            <Link
              to="/report"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <PlusCircle className="w-4 h-4 text-emerald-200" />
              <span>{t('reportIssue')}</span>
            </Link>

            {/* Notification Bell (if logged in) */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notificationOpen && (
                  <NotificationDropdown onClose={() => setNotificationOpen(false)} />
                )}
              </div>
            )}

            {/* User Profile / Login Button */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[110px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {lang === 'mr' ? (user.role === 'coordinator' ? 'समन्वयक' : user.role === 'volunteer' ? 'स्वयंसेवक' : 'स्थानिक नागरिक') : (user.role === 'coordinator' ? 'Coordinator' : user.role === 'volunteer' ? 'Volunteer' : 'Resident')}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-800 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        {user.role} • {user.points || 0} {t('pts')}
                      </span>
                    </div>

                    {isCoordinator && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium"
                      >
                        <Shield className="w-4 h-4 text-emerald-700" />
                        <span>{t('coordinatorPanel')}</span>
                      </Link>
                    )}

                    {isVolunteer && (
                      <Link
                        to="/volunteer/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium"
                      >
                        <Layers className="w-4 h-4 text-emerald-700" />
                        <span>{t('volunteerWorkspace')}</span>
                      </Link>
                    )}

                    <Link
                      to="/my-reports"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium"
                    >
                      <User className="w-4 h-4 text-emerald-700" />
                      <span>{t('myReports')}</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-emerald-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-2 rounded-lg transition-colors"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/report"
              className="bg-emerald-700 text-white p-2 rounded-lg text-xs font-medium"
              title="Report an Issue"
            >
              <PlusCircle className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-emerald-800 bg-emerald-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-2 pb-1">
            <button
              type="button"
              onClick={toggleLanguage}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-emerald-600" />
                <span>भाषा बदला / Change Language</span>
              </span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                {lang === 'en' ? 'मराठी' : 'English'}
              </span>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold text-sm text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 capitalize">
                    Role: {user.role} ({user.points} pts)
                  </span>
                </div>

                {isCoordinator && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2 px-3 text-sm font-medium text-emerald-800 bg-emerald-50 rounded-lg"
                  >
                    {t('coordinatorPanel')}
                  </Link>
                )}

                {isVolunteer && (
                  <Link
                    to="/volunteer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2 px-3 text-sm font-medium text-emerald-800 bg-emerald-50 rounded-lg"
                  >
                    {t('volunteerWorkspace')}
                  </Link>
                )}

                <Link
                  to="/my-reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  {t('myReports')}
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
