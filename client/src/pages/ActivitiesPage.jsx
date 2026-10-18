import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/api';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  PlusCircle,
  Filter,
  ArrowRight,
  Leaf,
  Loader2,
  ShieldCheck
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Cleanliness Drive',
  'Tree Plantation',
  'Lake Restoration',
  'Waste Collection',
  'Environmental Awareness',
  'Other Community Service'
];

export default function ActivitiesPage() {
  const { user, isAuthenticated, isCoordinator } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Upcoming'); // 'Upcoming', 'Completed', 'All'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [selectedStatus, selectedCategory]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getEvents({
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      });
      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterToggle = async (event) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/activities');
      return;
    }
    setRegisteringId(event.id);
    try {
      if (event.is_user_registered) {
        const res = await eventService.cancelRegistration(event.id);
        if (res.data.success) {
          fetchEvents();
        }
      } else {
        const res = await eventService.register(event.id);
        if (res.data.success) {
          alert(res.data.message);
          fetchEvents();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed.');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Grassroots Mobilization
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Community Service & Volunteer Activities
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            Participate in Sevadeep cleanliness drives, native tree plantations, and environmental missions across Pune.
          </p>
        </div>

        {isCoordinator && (
          <Link
            to="/admin/activities"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage / Create Activity</span>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status buttons */}
          <div className="flex items-center gap-2">
            {['Upcoming', 'Completed', 'All'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedStatus === status
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status} Activities
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading Sevadeep community activities...
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Activities Found</h3>
          <p className="text-xs text-slate-500">
            There are no {selectedStatus.toLowerCase()} activities matching this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-48 bg-slate-100 relative">
                  <img
                    src={ev.cover_image || '/assets/drive_cleanliness_1.jpeg'}
                    alt={ev.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/assets/drive_cleanliness_1.jpeg'; }}
                  />
                  <div className="absolute top-3 left-3 bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    {ev.category}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase shadow-xs ${
                      ev.status === 'Completed'
                        ? 'bg-teal-100 text-teal-900 border border-teal-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {ev.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span className="font-semibold text-slate-800">
                        {new Date(ev.event_date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span>{ev.start_time} - {ev.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span className="truncate">{ev.location_name}</span>
                    </div>
                  </div>

                  {/* If completed, show impact badges */}
                  {ev.status === 'Completed' && (
                    <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-950 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-teal-800">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Completed Outcome</span>
                      </p>
                      <p className="text-[11px] text-teal-900">
                        {ev.waste_collected_kg > 0 && `♻️ ${ev.waste_collected_kg} kg waste collected. `}
                        {ev.trees_planted > 0 && `🌱 ${ev.trees_planted} native saplings planted. `}
                        {ev.completion_summary}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {ev.status === 'Upcoming' ? (
                    <span>
                      Slots: <strong className="text-emerald-700">{ev.available_slots}</strong> left
                    </span>
                  ) : (
                    <span className="text-teal-700 font-semibold">Drive Completed</span>
                  )}
                </div>

                {ev.status === 'Upcoming' ? (
                  <button
                    type="button"
                    onClick={() => handleRegisterToggle(ev)}
                    disabled={registeringId === ev.id}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                      ev.is_user_registered
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300'
                        : 'bg-emerald-700 text-white hover:bg-emerald-800'
                    }`}
                  >
                    {registeringId === ev.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : ev.is_user_registered ? (
                      <span>Cancel Registration</span>
                    ) : (
                      <span>Register to Volunteer</span>
                    )}
                  </button>
                ) : (
                  <Link
                    to={`/impact`}
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <span>View in Impact Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
