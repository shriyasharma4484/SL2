import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import CategoryBadge from '../components/CategoryBadge';
import {
  CheckCircle2,
  Clock,
  Upload,
  Calendar,
  MapPin,
  Award,
  AlertCircle,
  ArrowRight,
  Send,
  Loader2,
  Sparkles
} from 'lucide-react';

export default function VolunteerDashboardPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / submission state for volunteer progress
  const [selectedTask, setSelectedTask] = useState(null);
  const [progressStatus, setProgressStatus] = useState('In Progress');
  const [completionNotes, setCompletionNotes] = useState('');
  const [progressPhoto, setProgressPhoto] = useState(null);
  const [submittingProgress, setSubmittingProgress] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await issueService.getAssignedToMe();
      if (res.data.success) {
        setAssignments(res.data.assignments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmittingProgress(true);
    try {
      const formData = new FormData();
      formData.append('progress_status', progressStatus);
      formData.append('completion_notes', completionNotes);
      if (progressPhoto) {
        formData.append('photo', progressPhoto);
      }

      const res = await issueService.submitVolunteerProgress(selectedTask.report_id, formData);
      if (res.data.success) {
        alert(res.data.message);
        setSelectedTask(null);
        setCompletionNotes('');
        setProgressPhoto(null);
        loadAssignments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit update.');
    } finally {
      setSubmittingProgress(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Volunteer Welcome Card */}
      <div className="bg-gradient-to-r from-forest-dark via-emerald-950 to-forest text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sevadeep Volunteer Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Volunteer Dashboard: {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Manage your assigned field actions, upload completion photographs, and track your volunteer service hours in Pune.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="bg-white/10 border border-white/20 p-4 rounded-2xl text-center backdrop-blur-sm">
            <div className="text-2xl font-extrabold text-emerald-300">{user?.points || 75}</div>
            <p className="text-[11px] text-slate-300 font-semibold">Impact Points</p>
          </div>
          <div className="bg-white/10 border border-white/20 p-4 rounded-2xl text-center backdrop-blur-sm">
            <div className="text-2xl font-extrabold text-teal-300">{assignments.length}</div>
            <p className="text-[11px] text-slate-300 font-semibold">Assigned Tasks</p>
          </div>
        </div>
      </div>

      {/* Assigned Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            My Assigned Community Tasks ({assignments.length})
          </h2>
          <span className="text-xs text-slate-500">
            Coordinator reviews required before ticket closure
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            <span>Loading assigned tasks...</span>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">All Caught Up!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You currently have no pending assigned tasks. Explore upcoming weekend community drives!
            </p>
            <Link
              to="/activities"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              <Calendar className="w-4 h-4" />
              <span>Browse Volunteer Activities</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 bg-slate-100 relative">
                    <img
                      src={item.primary_photo || '/assets/drive_cleanliness_1.jpeg'}
                      alt={item.report_title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/assets/drive_cleanliness_1.jpeg'; }}
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <StatusBadge status={item.report_status} />
                    </div>
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="text-[10px] font-mono bg-slate-900/80 text-white px-2 py-0.5 rounded font-bold">
                        {item.reference_no}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <CategoryBadge category={item.report_category} />
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                      {item.report_title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{item.location_address}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                      <p className="font-bold text-slate-700">Coordinator Instructions:</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {item.assignment_notes || 'Please visit location, assess situation, and coordinate cleanup.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Task Status:</span>
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] uppercase">
                        {item.progress_status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
                  <Link
                    to={`/issues/${item.report_id}`}
                    className="text-xs font-bold text-slate-600 hover:text-emerald-700"
                  >
                    View Details
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTask(item);
                      setProgressStatus(item.progress_status);
                      setCompletionNotes(item.completion_notes || '');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                  >
                    Update Progress
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Submit Field Progress & Proof
                </h3>
                <p className="text-[11px] text-slate-500">{selectedTask.reference_no}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProgressSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Task Status
                </label>
                <select
                  value={progressStatus}
                  onChange={(e) => setProgressStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-hidden bg-white"
                >
                  <option value="In Progress">In Progress (Action Ongoing)</option>
                  <option value="Work Submitted">Work Submitted (Awaiting Coordinator Review)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Field Progress Notes
                </label>
                <textarea
                  rows="3"
                  required
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Detail actions taken (e.g. Cleared 4 sacks of debris, distributed leaflets, disinfected drain...)"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-hidden"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Upload Photographic Proof (Required for verification)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProgressPhoto(e.target.files[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                ⚠️ <strong>Quality Verification Rule:</strong> A report is not marked as resolved solely because a photograph is uploaded. A Sevadeep coordinator will verify the work before closing the ticket.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProgress}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5"
                >
                  {submittingProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Submit for Coordinator Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
