import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/api';
import LocationPickerMap from '../components/LocationPickerMap';
import {
  Upload,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Info,
  Calendar,
  Clock,
  ArrowRight,
  Compass
} from 'lucide-react';

const CATEGORIES = [
  'Garbage and Waste Management',
  'Public Cleanliness',
  'Water Leakage',
  'Damaged Public Facilities',
  'Environmental Problems',
  'Other Community Issues'
];

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

// Haversine distance calculator between two coordinates in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function ReportIssuePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Garbage and Waste Management',
    severity: 'Medium',
    location_address: '',
    area: 'Pune',
    latitude: 18.520428,
    longitude: 73.840214
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Proximity duplicate detection state
  const [existingIssues, setExistingIssues] = useState([]);
  const [nearbyDuplicate, setNearbyDuplicate] = useState(null);

  useEffect(() => {
    // Load existing active public issues to detect nearby duplicates
    const fetchExisting = async () => {
      try {
        const res = await issueService.getPublicIssues({ limit: 100 });
        if (res.data?.success && res.data.issues) {
          setExistingIssues(res.data.issues);
        }
      } catch (e) {
        console.error('Failed to load existing issues for proximity check:', e);
      }
    };
    fetchExisting();
  }, []);

  // Check for nearby duplicates whenever coordinates change
  useEffect(() => {
    if (!existingIssues.length || !formData.latitude || !formData.longitude) return;

    let closest = null;
    let minDistance = Infinity;

    for (const issue of existingIssues) {
      if (issue.latitude && issue.longitude) {
        const dist = getDistanceMeters(
          formData.latitude,
          formData.longitude,
          parseFloat(issue.latitude),
          parseFloat(issue.longitude)
        );
        // Alert if within 100 meters
        if (dist <= 100 && dist < minDistance) {
          minDistance = dist;
          closest = {
            id: issue.id,
            title: issue.title,
            reference_no: issue.reference_no,
            category: issue.category,
            location_address: issue.location_address,
            distance: dist
          };
        }
      }
    }

    setNearbyDuplicate(closest);
  }, [formData.latitude, formData.longitude, existingIssues]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size exceeds 5MB limit. Please upload a smaller photograph.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/report');
      return;
    }

    if (!formData.title.trim()) {
      setErrorMsg('Please enter an issue title.');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMsg('Please describe the problem.');
      return;
    }
    if (!formData.location_address.trim()) {
      setErrorMsg('Please specify the street address or landmark in Pune.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('category', formData.category);
      payload.append('severity', formData.severity);
      payload.append('location_address', formData.location_address.trim());
      payload.append('area', formData.area.trim());
      payload.append('latitude', formData.latitude);
      payload.append('longitude', formData.longitude);

      if (photoFile) {
        payload.append('photo', photoFile);
      }

      const res = await issueService.createIssue(payload);
      if (res.data.success) {
        setSubmissionSuccess({
          reference_no: res.data.reference_no,
          report_id: res.data.report_id,
          title: formData.title
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Report Successfully Submitted
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Thank You for Making Pune Cleaner
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto">
              Your community report has been logged in the Sevadeep database.
            </p>
          </div>

          {/* Reference Badge Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Unique Reference Code:</span>
              <span className="text-sm font-mono font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                {submissionSuccess.reference_no}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Title:</span>
              <span className="font-semibold text-slate-900 truncate max-w-[240px]">
                {submissionSuccess.title}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Initial Status:</span>
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Submitted (Pending Review)
              </span>
            </div>
          </div>

          {/* Workflow Notice */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-left text-xs text-blue-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Coordinator Verification Notice:</strong> To ensure high-quality, verified civic records, this report will remain in pending review status until evaluated by a Sevadeep coordinator. Once approved, it will be mapped publicly and scheduled for volunteer or municipal action.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={`/issues/${submissionSuccess.report_id}`}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
            >
              <span>View Report Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/my-reports"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-300 transition-all flex items-center justify-center"
            >
              My Submitted Reports
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <span>Pune Community Grievance Reporting</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Local Community Issue
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Report garbage accumulation, broken infrastructure, water leaks, or environmental hazards. Sevadeep coordinators review every submission to organize grassroots volunteer action or escalate to Pune Municipal Corporation.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>You need to be logged in to submit a report so you can track progress and receive resolution alerts.</span>
          </div>
          <Link
            to="/login?redirect=/report"
            className="text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-lg flex-shrink-0"
          >
            Log In Now
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Row 1: Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Issue Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g. Overflowing garbage dumpster blocking pedestrian walkway on FC Road"
            className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all outline-hidden"
            required
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Provide a clear, brief summary of the issue.
          </p>
        </div>

        {/* Row 2: Category and Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all outline-hidden bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Severity / Urgency Level
            </label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all outline-hidden bg-white"
            >
              {SEVERITIES.map((sev) => (
                <option key={sev} value={sev}>
                  {sev} {sev === 'Critical' ? '(Immediate hazard / flood)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Description */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Detailed Problem Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what you observed, how long the issue has persisted, and any immediate impact on community members or traffic..."
            className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all outline-hidden"
            required
          ></textarea>
        </div>

        {/* Row 4: Photograph Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Photograph Proof (Recommended)
          </label>
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
            {photoPreview ? (
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Issue preview"
                  className="max-h-56 rounded-xl object-cover shadow-sm mx-auto"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 text-xs shadow hover:bg-rose-700"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs text-slate-600">
                  <label className="font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer">
                    Click to upload a photograph
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>{' '}
                  or drag and drop
                </div>
                <p className="text-[11px] text-slate-400">
                  JPEG, PNG, WebP up to 5MB. Photos help coordinators evaluate equipment needed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Row 5: Location Details & Interactive Pune Map Pin */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Location & Map Pin in Pune <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Interactive Leaflet OpenStreetMap</span>
            </span>
          </div>

          <LocationPickerMap
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationChange={handleLocationChange}
            height="320px"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="sm:col-span-2">
              <input
                type="text"
                name="location_address"
                value={formData.location_address}
                onChange={handleInputChange}
                placeholder="Street address or nearby landmark (e.g. Opposite FC Main Gate, Shivajinagar)"
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden"
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                placeholder="Neighborhood / Area (e.g. Kothrud, Deccan)"
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden"
              />
            </div>
          </div>

          {/* Proximity Duplicate Warning Alert */}
          {nearbyDuplicate && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Possible Duplicate Detected within ~{nearbyDuplicate.distance} meters!</span>
                </div>
                <span className="text-[10px] font-mono bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-bold">
                  {nearbyDuplicate.reference_no}
                </span>
              </div>

              <p className="text-xs text-amber-900/90 leading-relaxed">
                A neighbor has already reported: <strong>"{nearbyDuplicate.title}"</strong> ({nearbyDuplicate.category}) at {nearbyDuplicate.location_address}.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to={`/issues/${nearbyDuplicate.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors"
                >
                  <span>View &amp; Support Existing Report Instead</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-amber-800 font-medium">
                  Supporting an existing issue consolidates neighborhood upvotes!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Date and Time Note */}
        <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Today's Date: {new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Submission Policy Notice */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 space-y-1">
          <p className="font-semibold flex items-center gap-1.5 text-emerald-800">
            <Info className="w-4 h-4 text-emerald-700" />
            <span>Platform Review & Public Visibility Policy</span>
          </p>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            In accordance with Sevadeep quality standards, reports initially enter <strong>Pending Review</strong> and will not be displayed on the public map until verified by a Sevadeep coordinator. Personal phone numbers or sensitive private addresses are never shown to the public.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Recording Report in Sevadeep Database...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>Submit Report to Sevadeep</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
