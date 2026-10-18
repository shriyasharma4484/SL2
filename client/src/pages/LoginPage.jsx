import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Shield, UserCheck, Users, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, switchDemo } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'coordinator') navigate('/admin');
        else if (res.user.role === 'volunteer') navigate('/volunteer/dashboard');
        else navigate(redirectPath);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await switchDemo(role);
      if (res.success) {
        if (role === 'coordinator') navigate('/admin');
        else if (role === 'volunteer') navigate('/volunteer/dashboard');
        else navigate(redirectPath);
      }
    } catch (err) {
      setErrorMsg('Failed to switch demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-forest-dark mx-auto p-1.5 flex items-center justify-center shadow-md">
          <img
            src="/assets/sevadeep_logo.png"
            alt="Sevadeep Logo"
            className="h-full w-full object-contain filter brightness-110"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sevadeep CivicConnect
        </h1>
        <p className="text-xs text-slate-500">
          Sign in to report civic problems or join community volunteer drives in Pune.
        </p>
      </div>

      {/* 1-Click Quick Demo Login Switcher */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
        <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider text-center">
          ⚡ 1-Click Demonstration Login
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('coordinator')}
            className="p-2 rounded-xl bg-white hover:bg-emerald-100/70 border border-emerald-200 text-center transition-all shadow-2xs"
          >
            <Shield className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-slate-800">Coordinator</p>
            <p className="text-[9px] text-slate-500">Dr. Ananya</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('volunteer')}
            className="p-2 rounded-xl bg-white hover:bg-emerald-100/70 border border-emerald-200 text-center transition-all shadow-2xs"
          >
            <UserCheck className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-slate-800">Volunteer</p>
            <p className="text-[9px] text-slate-500">Aarav K.</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('community_member')}
            className="p-2 rounded-xl bg-white hover:bg-emerald-100/70 border border-emerald-200 text-center transition-all shadow-2xs"
          >
            <Users className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-slate-800">Resident</p>
            <p className="text-[9px] text-slate-500">Sunita D.</p>
          </button>
        </div>
      </div>

      {/* Main Login Form */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@sevadeep.org"
                className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-3.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Default demo password for seeded accounts: <strong>Password@123</strong></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Account</span>}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-emerald-700 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
