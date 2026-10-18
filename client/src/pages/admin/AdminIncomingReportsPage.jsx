import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, issueService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import SeverityBadge from '../../components/SeverityBadge';
import {
  Inbox,
  Check,
  X,
  UserCheck,
  Building,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';

export default function AdminIncomingReportsPage() {
  const [reports, setReports] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal
  const [activeReport, setActiveReport] = useState(null);
  const [newStatus, setNewStatus] = useState('Approved');
  const [coordinatorNotes, setCoordinatorNotes] = useState('');
  const [referralStatus, setReferralStatus] = useState('');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, volRes] = await Promise.all([
        adminService.getIncomingReports(),
        adminService.getVolunteers()
      ]);
      if (reportsRes.data.success) {
        setReports(reportsRes.data.reports || []);
      }
      if (volRes.data.success) {
        setVolunteers(volRes.data.volunteers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = (report) => {
    setActiveReport(report);
    setNewStatus('Approved');
    setCoordinatorNotes(`Approved by coordinator for public tracking and volunteer assignment.`);
  };

  const handleQuickReject = (report) => {
    setActiveReport(report);
    setNewStatus('Rejected');
    setCoordinatorNotes('Rejected: Does not meet civic guidelines or duplicate entry.');
  };

  const handleSaveDecision = async (e) => {
    e.preventDefault();
    if (!activeReport) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      formData.append('coordinator_notes', coordinatorNotes);
      formData.append('notes', coordinatorNotes);
      if (referralStatus) {
        formData.append('municipal_referral_status', referralStatus);
      }
      if (selectedVolunteerId) {
        formData.append('assigned_volunteer_id', selectedVolunteerId);
      }

      const res = await issueService.updateStatus(activeReport.id, formData);
      if (res.data.success) {
        alert(res.data.message);
        setActiveReport(null);
        setCoordinatorNotes('');
        setReferralStatus('');
        setSelectedVolunteerId('');
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Triage & Evaluation Queue
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Incoming Community Reports ({reports.length})
          </h1>
          <p className="text-xs text-slate-500">
            Review citizen complaints before publishing them to the public map or dispatching volunteers.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
          <span>Loading incoming reports...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Inbox className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">Inbox Zero!</h3>
          <p className="text-xs text-slate-500">
            All submitted community reports have been evaluated and approved.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row gap-5 items-start justify-between"
            >
              <div className="flex gap-4 items-start flex-1">
                <img
                  src={report.primary_photo || '/assets/drive_cleanliness_1.jpeg'}
                  alt={report.title}
                  className="w-24 h-24 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  onError={(e) => { e.target.src = '/assets/drive_cleanliness_1.jpeg'; }}
                />

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {report.reference_no}
                    </span>
                    <CategoryBadge category={report.category} />
                    <SeverityBadge severity={report.severity} />
                    <StatusBadge status={report.status} />
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">
                    {report.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {report.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-700" />
                      <span>{report.location_address} ({report.area})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(report.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </span>
                    <span>Reporter: <strong>{report.reporter_name}</strong></span>
                  </div>
                </div>
              </div>

              {/* Coordinator Decision Actions */}
              <div className="flex sm:flex-col items-center gap-2 w-full md:w-auto flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => handleQuickApprove(report)}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickReject(report)}
                  className="w-full sm:w-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                <Link
                  to={`/issues/${report.id}`}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1"
                >
                  <span>Full Inspector</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Coordinator Decision: {activeReport.reference_no}
                </h3>
                <p className="text-[11px] text-slate-500 truncate max-w-xs">{activeReport.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDecision} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Selected Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-hidden bg-white"
                >
                  <option value="Approved">Approved (Publish publicly on map)</option>
                  <option value="In Progress">In Progress (Assign volunteer squad)</option>
                  <option value="Needs More Information">Needs More Information</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Assign to Field Volunteer (Optional)
                </label>
                <select
                  value={selectedVolunteerId}
                  onChange={(e) => setSelectedVolunteerId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-hidden bg-white"
                >
                  <option value="">-- No volunteer assigned yet --</option>
                  {volunteers.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.area} - {v.points} pts)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Government / PMC Referral Docket (Optional)
                </label>
                <input
                  type="text"
                  value={referralStatus}
                  onChange={(e) => setReferralStatus(e.target.value)}
                  placeholder="e.g. Referred to PMC Solid Waste Dept Ward 7"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Coordinator Progress Notes
                </label>
                <textarea
                  rows="3"
                  required
                  value={coordinatorNotes}
                  onChange={(e) => setCoordinatorNotes(e.target.value)}
                  placeholder="Enter evaluation notes explaining this decision..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-hidden"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Commit Decision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
