import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, AlertCircle, Loader2, Users, UserCheck } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'community_member',
    area: 'Shivajinagar'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await register(form);
      if (res.success) {
        if (res.user.role === 'volunteer') navigate('/volunteer/dashboard');
        else navigate('/my-reports');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-14 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Join Sevadeep CivicConnect
        </h1>
        <p className="text-xs text-slate-500">
          Become part of Pune's active community movement for cleaner, safer neighborhoods.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Choose Role */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Select Your Role in the Platform
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'community_member' })}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  form.role === 'community_member'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Users className="w-5 h-5 text-emerald-700 mb-1" />
                <p className="text-xs font-bold">Community Member</p>
                <p className="text-[10px] text-slate-500">Report problems, vote & track</p>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'volunteer' })}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  form.role === 'volunteer'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <UserCheck className="w-5 h-5 text-emerald-700 mb-1" />
                <p className="text-xs font-bold">Field Volunteer</p>
                <p className="text-[10px] text-slate-500">Join drives & execute action</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@domain.com"
                className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pune Neighborhood</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="e.g. Kothrud, Deccan"
                  className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
