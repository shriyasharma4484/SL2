import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueService, adminService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import CategoryBadge from '../components/CategoryBadge';
import SeverityBadge from '../components/SeverityBadge';
import LeafletMap from '../components/LeafletMap';
import {
  ThumbsUp,
  MessageSquare,
  MapPin,
  Calendar,
  Clock,
  Shield,
  User,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Send,
  EyeOff,
  Star,
  Check,
  ArrowLeft,
  Loader2,
  Building
} from 'lucide-react';

export default function IssueDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated, isCoordinator, isVolunteer } = useAuth();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Confirmation state
  const [confirming, setConfirming] = useState(false);

  // New comment state
  const [commentText, setCommentText] = useState('');
  const [commentPhoto, setCommentPhoto] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Feedback on resolution
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackConfirmed, setFeedbackConfirmed] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Coordinator Quick Actions
  const [coordinatorStatus, setCoordinatorStatus] = useState('');
  const [coordinatorNotes, setCoordinatorNotes] = useState('');
  const [referralStatus, setReferralStatus] = useState('');
  const [assignVolunteerId, setAssignVolunteerId] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [volunteersList, setVolunteersList] = useState([]);
  const [updatingCoordinator, setUpdatingCoordinator] = useState(false);

  useEffect(() => {
    loadIssueDetails();
    if (isCoordinator) {
      loadVolunteers();
    }
  }, [id, isCoordinator]);

  const loadIssueDetails = async () => {
    setLoading(true);
    try {
      const res = await issueService.getIssueById(id);
      if (res.data.success) {
        setIssue(res.data.report);
        setCoordinatorStatus(res.data.report.status);
        setReferralStatus(res.data.report.municipal_referral_status || '');
        setCoordinatorNotes(res.data.report.coordinator_notes || '');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load report details.');
    } finally {
      setLoading(false);
    }
  };

  const loadVolunteers = async () => {
    try {
      const res = await adminService.getVolunteers();
      if (res.data.success) {
        setVolunteersList(res.data.volunteers || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleConfirm = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/issues/${id}`);
      return;
    }
    setConfirming(true);
    try {
      const res = await issueService.toggleConfirm(id);
      if (res.data.success) {
        setIssue((prev) => ({
          ...prev,
          user_has_confirmed: res.data.confirmed,
          confirmations_count: res.data.confirmations_count
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConfirming(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=/issues/${id}`);
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const formData = new FormData();
      formData.append('comment_text', commentText.trim());
      if (commentPhoto) {
        formData.append('photo', commentPhoto);
      }

      const res = await issueService.addComment(id, formData);
      if (res.data.success) {
        setCommentText('');
        setCommentPhoto(null);
        setIssue((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data.comment]
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleModerateComment = async (commentId, currentlyHidden) => {
    try {
      const res = await adminService.moderateComment(commentId, {
        is_hidden: !currentlyHidden,
        moderation_reason: 'Removed by Sevadeep Coordinator for compliance.'
      });
      if (res.data.success) {
        setIssue((prev) => ({
          ...prev,
          comments: prev.comments.map((c) =>
            c.id === commentId ? { ...c, is_hidden: !currentlyHidden } : c
          )
        }));
      }
    } catch (e) {
      alert('Failed to moderate comment.');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await issueService.submitFeedback(id, {
        confirmed_resolution: feedbackConfirmed,
        rating: feedbackRating,
        feedback: feedbackNotes
      });
      if (res.data.success) {
        alert(res.data.message);
        loadIssueDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleCoordinatorStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdatingCoordinator(true);
    try {
      const formData = new FormData();
      formData.append('status', coordinatorStatus);
      formData.append('coordinator_notes', coordinatorNotes);
      formData.append('notes', coordinatorNotes);
      if (referralStatus) {
        formData.append('municipal_referral_status', referralStatus);
      }
      if (assignVolunteerId) {
        formData.append('assigned_volunteer_id', assignVolunteerId);
      }
      if (resolutionPhoto) {
        formData.append('photo', resolutionPhoto);
      }

      const res = await issueService.updateStatus(id, formData);
      if (res.data.success) {
        alert(res.data.message);
        loadIssueDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingCoordinator(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500 text-sm">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
        <p>Loading community report details...</p>
      </div>
    );
  }

  if (errorMsg || !issue) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{errorMsg || 'Report Not Found'}</h2>
        <p className="text-xs text-slate-500">
          This report may be awaiting coordinator approval or does not exist.
        </p>
        <Link
          to="/issues"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Public Community Issues</span>
        </Link>
      </div>
    );
  }

  const isReporter = user && user.id === issue.reporter_id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/issues"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Community Issues</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
            {issue.reference_no}
          </span>
          <StatusBadge status={issue.status} />
        </div>
      </div>

      {/* Main Grid: Details (Left) + Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Title, Photos, Description, Status History, Comments */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={issue.category} />
                <SeverityBadge severity={issue.severity} />
                {issue.municipal_referral_status && (
                  <span className="text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    <span>{issue.municipal_referral_status}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {issue.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span className="font-medium text-slate-700">{issue.location_address} ({issue.area})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Reported on {new Date(issue.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Reporter: {issue.reporter_name || 'Community Resident'}</span>
                </div>
              </div>
            </div>

            {/* Photographs Carousel / Gallery */}
            {issue.photographs && issue.photographs.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Submitted Evidence & Photographs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {issue.photographs.map((photo) => (
                    <div key={photo.id} className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={photo.photo_url}
                        alt={photo.caption || 'Report photograph'}
                        className="w-full h-56 object-cover"
                        onError={(e) => { e.target.src = '/assets/drive_cleanliness_1.jpeg'; }}
                      />
                      <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-600 truncate">{photo.caption || 'Field evidence'}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {photo.photo_type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Problem Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                {issue.description}
              </p>
            </div>

            {/* Coordinator Resolution Notes (if resolved) */}
            {issue.status === 'Resolved' && (
              <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 space-y-3">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-teal-700" />
                  <span>Verified Outcome & Resolution Summary</span>
                </div>
                <p className="text-xs text-teal-950 leading-relaxed">
                  {issue.resolution_notes || 'Cleanup and remediation verified on-site by Sevadeep coordinator and neighborhood volunteer teams.'}
                </p>
                {issue.resolution_photo && (
                  <div className="pt-2">
                    <img
                      src={issue.resolution_photo}
                      alt="Verified Resolution"
                      className="rounded-xl h-48 w-full sm:w-80 object-cover border border-teal-300"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Community Confirmation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleConfirm}
                  disabled={confirming}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all ${
                    issue.user_has_confirmed
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${issue.user_has_confirmed ? 'text-white' : 'text-emerald-600'}`} />
                  <span>{issue.user_has_confirmed ? 'Confirmed by You' : 'Support / Confirm This Issue'}</span>
                </button>

                <span className="text-xs text-slate-600">
                  <strong>{issue.confirmations_count || 0}</strong> neighborhood residents confirmed
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                Duplicate confirmations prevented per account
              </div>
            </div>
          </div>

          {/* Reporter Resolution Feedback Section (If resolved & user is reporter) */}
          {issue.status === 'Resolved' && isReporter && !issue.reporter_confirmed_resolution && (
            <div className="bg-white rounded-3xl border-2 border-emerald-500/40 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Reporter Resolution Feedback
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Sevadeep coordinators marked this issue as resolved. As the original reporter, does the problem appear properly addressed on the ground?
              </p>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="confirmed"
                      checked={feedbackConfirmed === true}
                      onChange={() => setFeedbackConfirmed(true)}
                      className="text-emerald-600"
                    />
                    <span>Yes, problem is resolved satisfactorily</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="confirmed"
                      checked={feedbackConfirmed === false}
                      onChange={() => setFeedbackConfirmed(false)}
                      className="text-rose-600"
                    />
                    <span>No, further work needed</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rating (1 to 5 Stars):
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className={`p-1 text-lg ${star <= feedbackRating ? 'text-amber-400' : 'text-slate-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    rows="2"
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="Add your comments on the cleanup or repair quality..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-hidden"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
                >
                  Submit Reporter Verification
                </button>
              </form>
            </div>
          )}

          {/* Discussion & Comments Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Community Discussion & Updates ({issue.comments?.length || 0})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Coordinators moderate abusive or off-topic notes
              </span>
            </div>

            {/* Comments Stream */}
            <div className="space-y-4">
              {issue.comments?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No comments yet. Share on-site observations or coordinate cleanup tips.
                </p>
              ) : (
                issue.comments.map((cm) => (
                  <div
                    key={cm.id}
                    className={`p-4 rounded-2xl border ${
                      cm.is_hidden
                        ? 'bg-rose-50/50 border-rose-200'
                        : 'bg-slate-50 border-slate-200/80'
                    } space-y-2`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{cm.user_name}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {cm.user_role}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(cm.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className={`text-xs ${cm.is_hidden ? 'italic text-rose-700' : 'text-slate-700'} leading-relaxed`}>
                      {cm.is_hidden ? `[Hidden by Coordinator: ${cm.moderation_reason}]` : cm.comment_text}
                    </p>

                    {cm.photo_url && !cm.is_hidden && (
                      <div className="pt-1">
                        <img
                          src={cm.photo_url}
                          alt="Comment evidence"
                          className="h-36 rounded-lg object-cover border border-slate-200"
                        />
                      </div>
                    )}

                    {/* Moderator action button for Coordinator */}
                    {isCoordinator && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => handleModerateComment(cm.id, cm.is_hidden)}
                          className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                        >
                          <EyeOff className="w-3 h-3" />
                          <span>{cm.is_hidden ? 'Restore Comment' : 'Moderate / Hide Comment'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="pt-2 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Post an Update or Additional Evidence
              </h4>
              <textarea
                rows="3"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={isAuthenticated ? "Write an observation or update regarding this issue..." : "Please log in to post a comment."}
                disabled={!isAuthenticated}
                className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 outline-hidden"
              ></textarea>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer hover:text-emerald-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{commentPhoto ? commentPhoto.name : 'Attach photo proof (optional)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCommentPhoto(e.target.files[0] || null)}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={submittingComment || !isAuthenticated}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Comment</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (4 cols): Coordinator Controls (Top), Location Map, Status History Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coordinator Action Panel (Positioned Prominently at the TOP for immediate access) */}
          {isCoordinator && (
            <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-xl space-y-4 border-2 border-emerald-500/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Coordinator Decision Panel</span>
                </div>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-bold uppercase">
                  Staff Action
                </span>
              </div>

              <form onSubmit={handleCoordinatorStatusUpdate} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">
                    Update Workflow Status:
                  </label>
                  <select
                    value={coordinatorStatus}
                    onChange={(e) => setCoordinatorStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-white font-semibold text-xs outline-hidden focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="Submitted">Submitted (Pending Review)</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved (Public on Map)</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved (Outcome Verified) ✅</option>
                    <option value="Needs More Information">Needs More Information</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-emerald-200 mb-1">
                    Assign Volunteer (Optional):
                  </label>
                  <select
                    value={assignVolunteerId}
                    onChange={(e) => setAssignVolunteerId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-white outline-hidden text-xs"
                  >
                    <option value="">-- Select Volunteer --</option>
                    {volunteersList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.area} - {v.points} pts)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-emerald-200 mb-1">
                    Municipal / PMC Referral Note (Optional):
                  </label>
                  <input
                    type="text"
                    value={referralStatus}
                    onChange={(e) => setReferralStatus(e.target.value)}
                    placeholder="e.g. Docket #PMC-WTR-8821 with Ward 7"
                    className="w-full p-2 rounded-xl bg-emerald-900 border border-emerald-700 text-white outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-emerald-200 mb-1">
                    Coordinator Resolution / Progress Notes:
                  </label>
                  <textarea
                    rows="3"
                    value={coordinatorNotes}
                    onChange={(e) => setCoordinatorNotes(e.target.value)}
                    placeholder="Provide notes on action taken or verification findings..."
                    className="w-full p-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-white outline-hidden text-xs"
                  ></textarea>
                </div>

                {coordinatorStatus === 'Resolved' && (
                  <div className="p-3 bg-emerald-900/80 rounded-xl border border-emerald-700/80 space-y-1.5">
                    <label className="block text-[11px] font-bold text-emerald-300">
                      Upload Verified "After" Photo Proof:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setResolutionPhoto(e.target.files[0] || null)}
                      className="text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updatingCoordinator}
                  className="w-full py-3 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  {updatingCoordinator ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Status & Notify Reporter</span>
                </button>
              </form>
            </div>
          )}

          {/* Location Map Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Location in Pune</span>
            </h3>

            <LeafletMap
              issues={[issue]}
              center={[parseFloat(issue.latitude), parseFloat(issue.longitude)]}
              zoom={15}
              height="240px"
            />

            <p className="text-xs text-slate-600 font-medium">
              {issue.location_address}
            </p>
            <p className="text-[11px] text-slate-400">
              Coordinates: {parseFloat(issue.latitude).toFixed(5)}, {parseFloat(issue.longitude).toFixed(5)}
            </p>
          </div>

          {/* Status History Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Status History & Audit Timeline</span>
            </h3>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
              {issue.status_history?.map((step, idx) => (
                <div key={step.id || idx} className="relative flex items-start gap-3 pl-2">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] z-10 flex-shrink-0 shadow-xs">
                    ✓
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{step.new_status}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(step.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{step.notes || 'Status changed'}</p>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      By: {step.changed_by_name || 'System'} ({step.changed_by_role || 'Staff'})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
