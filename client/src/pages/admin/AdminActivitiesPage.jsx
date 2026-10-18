import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/api';
import {
  Calendar,
  PlusCircle,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  Leaf,
  Loader2,
  Check
} from 'lucide-react';

const CATEGORIES = [
  'Cleanliness Drive',
  'Tree Plantation',
  'Lake Restoration',
  'Waste Collection',
  'Environmental Awareness',
  'Other Community Service'
];

export default function AdminActivitiesPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState(null);
  const [participants, setParticipants] = useState([]);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cleanliness Drive');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('07:30 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [locationName, setLocationName] = useState('');
  const [totalSlots, setTotalSlots] = useState(40);
  const [coverImage, setCoverImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getEvents();
      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('event_date', eventDate);
      formData.append('start_time', startTime);
      formData.append('end_time', endTime);
      formData.append('location_name', locationName.trim());
      formData.append('total_slots', totalSlots);
      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      const res = await eventService.createEvent(formData);
      if (res.data.success) {
        alert('Community activity published successfully!');
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setLocationName('');
        loadEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAttendance = async (event) => {
    setSelectedEventForAttendance(event);
    try {
      const res = await eventService.getEventById(event.id);
      if (res.data.success) {
        setParticipants(res.data.event.participants || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAttendance = async (userId, newStatus) => {
    try {
      const res = await eventService.recordAttendance(selectedEventForAttendance.id, {
        user_id: userId,
        registration_status: newStatus,
        hours_contributed: 3.5
      });
      if (res.data.success) {
        setParticipants((prev) =>
          prev.map((p) =>
            p.user_id === userId ? { ...p, registration_status: newStatus } : p
          )
        );
      }
    } catch (e) {
      alert('Failed to update attendance.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Event Coordination
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Community Activities & Drive Management
          </h1>
          <p className="text-xs text-slate-500">
            Publish weekend cleanliness drives, manage volunteer slots, and certify hours.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Community Activity</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
          <span>Loading activities...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
                    {ev.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    ev.status === 'Completed' ? 'bg-teal-100 text-teal-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {ev.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">{ev.title}</h3>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{new Date(ev.event_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} ({ev.start_time})</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="truncate">{ev.location_name}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Registrations: <strong>{ev.registered_count || 0} / {ev.total_slots}</strong></span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleOpenAttendance(ev)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Roster & Attendance
                </button>

                <span className="text-[11px] text-slate-400">
                  {ev.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Publish New Community Service Activity
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Activity Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Swachh Mutha Riverfront Cleanliness & Segregation Mission"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-hidden bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Volunteer Capacity Slots</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={totalSlots}
                    onChange={(e) => setTotalSlots(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description & Community Instructions</label>
                <textarea
                  rows="3"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail meeting point, safety gears provided, goals..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-hidden"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="07:30 AM"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="11:00 AM"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pune Meeting Location</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Near Baba Bhide Causeway, Deccan Gymkhana, Pune"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cover Photograph</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files[0] || null)}
                  className="w-full text-xs text-slate-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  {submitting ? 'Publishing...' : 'Publish Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Inspector Modal */}
      {selectedEventForAttendance && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Roster & Verified Attendance
                </h3>
                <p className="text-[11px] text-slate-500">{selectedEventForAttendance.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEventForAttendance(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Registered community members and volunteers. Mark "Attended" to certify service hours and credit impact points.
              </p>

              {participants.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No volunteers have registered for this event yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {participants.map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.email} • {p.role}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.registration_status === 'Attended'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.registration_status}
                        </span>

                        {p.registration_status !== 'Attended' ? (
                          <button
                            type="button"
                            onClick={() => handleMarkAttendance(p.user_id, 'Attended')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-800"
                          >
                            Mark Attended (+20 pts)
                          </button>
                        ) : (
                          <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
