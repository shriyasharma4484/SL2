import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, UserCheck, Users, Sparkles, X, ChevronDown, ChevronUp, BrainCircuit, Compass } from 'lucide-react';

export default function DemoBanner() {
  const { user, switchDemo } = useAuth();
  const { t, lang } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (role) => {
    setSwitching(true);
    try {
      await switchDemo(role);
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(false);
    }
  };

  const getRoleDisplayName = (r) => {
    if (lang === 'mr') {
      if (r === 'coordinator') return 'समन्वयक';
      if (r === 'volunteer') return 'स्वयंसेवक';
      return 'नागरिक';
    }
    return r;
  };

  return (
    <div className="bg-gradient-to-r from-forest-dark via-forest to-emerald-900 text-white text-xs border-b border-emerald-700/50 relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-300 uppercase tracking-wider text-[11px]">
            {t('demonstrationMode')}
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden md:inline text-slate-200">
            {t('currentPersona')}: <strong className="text-white">{user ? `${user.name} (${getRoleDisplayName(user.role)})` : t('guestVisitor')}</strong>
          </span>
          <div className="hidden xl:flex items-center gap-1.5 ml-2 pl-2 border-l border-emerald-700/60">
            <Link
              to="/impact-intelligence"
              className="px-2 py-0.5 rounded bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-600/70 text-[10px] font-bold flex items-center gap-1 transition"
            >
              <BrainCircuit className="w-3 h-3 text-emerald-400" />
              <span>{lang === 'mr' ? 'इम्पॅक्ट इंटेलिजन्स' : 'Impact Intelligence'}</span>
            </Link>
            <Link
              to="/civicops"
              className="px-2 py-0.5 rounded bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-600/70 text-[10px] font-bold flex items-center gap-1 transition"
            >
              <Compass className="w-3 h-3 text-emerald-400" />
              <span>{lang === 'mr' ? 'सिविक-ऑप्स वितरण' : 'CivicOps Dispatch'}</span>
            </Link>
          </div>
        </div>

        {!collapsed && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-300 hidden lg:inline">{t('quickRoleSwitcher')}</span>
            <button
              onClick={() => handleSwitch('coordinator')}
              disabled={switching}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 font-medium cursor-pointer ${
                user?.role === 'coordinator'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-300'
                  : 'bg-emerald-950/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t('coordinatorRole')}</span>
            </button>

            <button
              onClick={() => handleSwitch('volunteer')}
              disabled={switching}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 font-medium cursor-pointer ${
                user?.role === 'volunteer'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-300'
                  : 'bg-emerald-950/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t('volunteerRole')}</span>
            </button>

            <button
              onClick={() => handleSwitch('community_member')}
              disabled={switching}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 font-medium cursor-pointer ${
                user?.role === 'community_member'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-300'
                  : 'bg-emerald-950/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t('residentRole')}</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-300 hover:text-white p-1 ml-auto sm:ml-0 cursor-pointer"
          title={collapsed ? "Expand demonstration toolbar" : "Collapse toolbar"}
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
