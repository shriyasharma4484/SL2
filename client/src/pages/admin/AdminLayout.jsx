import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DemoBanner from '../../components/DemoBanner';
import {
  LayoutDashboard,
  BrainCircuit,
  Compass,
  Inbox,
  CheckCircle,
  Clock,
  CheckCheck,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
  ArrowLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function AdminLayout() {
  const { user, login, logout, isCoordinator } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Guard: strictly enforce coordinator role on frontend as well
  if (!user || user.role !== 'coordinator') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <DemoBanner />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 text-center p-8 space-y-4 shadow-lg">
            <Shield className="w-12 h-12 text-rose-600 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Coordinator Access Required</h2>
            <p className="text-xs text-slate-600">
              This administration console is restricted to verified Sevadeep coordinators. Click below to instantly log in as the default coordinator.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                disabled={switching}
                onClick={async () => {
                  setSwitching(true);
                  try {
                    await login('coordinator@sevadeep.org', 'Password@123');
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setSwitching(false);
                  }
                }}
                className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
              >
                {switching ? 'Logging In...' : '1-Click Switch to Coordinator (Dr. Ananya Joshi)'}
              </button>
              <Link to="/" className="text-xs text-slate-500 hover:underline">
                Return to Public Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Impact Intelligence', path: '/admin/impact-intelligence', icon: BrainCircuit, badge: 'New' },
    { name: 'CivicOps Dispatch', path: '/admin/civicops', icon: Compass, badge: 'AI Engine' },
    { name: 'Incoming Reports', path: '/admin/incoming', icon: Inbox },
    { name: 'Approved & Active', path: '/admin/active', icon: Clock },
    { name: 'Resolved Archive', path: '/admin/resolved', icon: CheckCheck },
    { name: 'Volunteer Roster', path: '/admin/volunteers', icon: Users },
    { name: 'Community Activities', path: '/admin/activities', icon: Calendar },
    { name: 'Comments & Moderation', path: '/admin/moderation', icon: MessageSquare },
    { name: 'Analytics & Charts', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Audit Logs & Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path) => {
    if (path === '/admin' && location.pathname !== '/admin') return false;
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Topbar */}
      <div className="lg:hidden bg-forest-dark text-white p-4 flex items-center justify-between border-b border-emerald-800">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span className="font-extrabold text-sm tracking-tight">Sevadeep Admin Console</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-forest"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-forest-dark text-white flex flex-col justify-between p-4 border-r border-forest transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo / Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-10 w-10 rounded-xl bg-emerald-950 p-1 flex items-center justify-center border border-emerald-700/60 flex-shrink-0">
              <img
                src="/assets/sevadeep_logo.png"
                alt="Sevadeep Logo"
                className="h-full w-full object-contain filter brightness-110"
              />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-extrabold text-sm text-white tracking-tight truncate">
                Sevadeep Pune
              </h2>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Coordinator Console
              </p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-forest-light hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-emerald-400'}`} />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-400 text-slate-950 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                  {active && <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="pt-4 border-t border-forest-light/60 space-y-3">
          <div className="px-2 py-1">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-emerald-400 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[9px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded uppercase">
              Coordinator Role
            </span>
          </div>

          <div className="space-y-1">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-forest-light rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Public Portal</span>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 rounded-lg transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <DemoBanner />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
