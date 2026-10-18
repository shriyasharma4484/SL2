import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { impactService } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import {
  CheckCircle2,
  Calendar,
  Users,
  Leaf,
  Building,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  Info,
  Scale
} from 'lucide-react';

export default function ImpactPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await impactService.getStats();
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const stats = data?.stats;
  const showcases = data?.showcases || [];
  const referrals = data?.referrals || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Transparency & Measurable Results
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Social Impact & Public Accountability
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          Sevadeep NGO believes in complete civic transparency. Here you can inspect verified outcomes, before-and-after physical evidence, and our municipal escalation bridge with Pune Municipal Corporation (PMC).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-1">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {stats ? stats.reports_resolved : '...'}
          </div>
          <p className="text-xs font-bold text-slate-700">Grievances Resolved</p>
          <p className="text-[11px] text-slate-400">Verified by coordinator on site</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-1">
          <Calendar className="w-8 h-8 text-teal-600 mx-auto mb-2" />
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {stats ? stats.activities_completed : '...'}
          </div>
          <p className="text-xs font-bold text-slate-700">Drives Conducted</p>
          <p className="text-[11px] text-slate-400">Riverbed, parks & heritage spots</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-1">
          <Users className="w-8 h-8 text-sky-600 mx-auto mb-2" />
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {stats ? stats.active_volunteers_participated : '...'}
          </div>
          <p className="text-xs font-bold text-slate-700">Participating Volunteers</p>
          <p className="text-[11px] text-slate-400">Recorded and attendance-verified</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-1">
          <Leaf className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {stats ? `${Number(stats.total_waste_diverted_kg).toFixed(0)} kg` : '...'}
          </div>
          <p className="text-xs font-bold text-slate-700">Waste Diverted</p>
          <p className="text-[11px] text-slate-400">Sent to authorized recycling</p>
        </div>
      </div>

      {/* BEFORE & AFTER SHOWCASE */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Before & After Verified Outcomes
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
              Inspect physical transformations achieved through Sevadeep volunteers and community coordination.
            </p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            100% Photographic Evidence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {showcases.map((sc) => (
            <div
              key={sc.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {sc.reference_no}
                </span>
                <CategoryBadge category={sc.category} />
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 mb-1">{sc.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sc.location_address}</span>
                </div>
              </div>

              {/* Before and After Image Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 relative border border-slate-200">
                    <img
                      src={sc.before_photo || '/assets/drive_cleanliness_gps.png'}
                      alt="Before cleanup"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/assets/drive_cleanliness_gps.png'; }}
                    />
                    <span className="absolute top-2 left-2 bg-rose-700 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow-sm">
                      BEFORE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic truncate">Initial reported state</p>
                </div>

                <div className="space-y-1.5">
                  <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 relative border border-emerald-300">
                    <img
                      src={sc.after_photo || '/assets/drive_cleanliness_2.jpeg'}
                      alt="After cleanup"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/assets/drive_cleanliness_2.jpeg'; }}
                    />
                    <span className="absolute top-2 left-2 bg-emerald-700 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow-sm">
                      AFTER
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold truncate">Cleaned & disinfected</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-800">Resolution Summary:</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {sc.resolution_notes || 'Full cleanup completed with volunteer team and neighborhood sanitation inspection.'}
                </p>
                {sc.reporter_feedback && (
                  <p className="text-[11px] text-emerald-800 font-medium italic pt-1 border-t border-slate-200">
                    " {sc.reporter_feedback} " — Resident Verification ({sc.reporter_rating}/5 Stars)
                  </p>
                )}
              </div>

              <div className="text-right">
                <Link
                  to={`/issues/${sc.id}`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                >
                  <span>View Full Report Audit</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MUNICIPAL REFERRAL & ESCALATION TRANSPARENCY NOTICE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-sky-50 text-sky-800 border border-sky-200 flex-shrink-0">
            <Building className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900">
              Municipal Corporation Escalation Protocol (PMC Liaison)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Sevadeep does not claim direct administrative authority over municipal services. When community reports involve underground drainage, water main bursts, road re-tarring, or electrical transformers, our coordinators formally escalate the grievance to the respective ward office of <strong>Pune Municipal Corporation (PMC)</strong> and track docket numbers transparently.
            </p>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Reference No</th>
                <th className="p-3">Civic Issue</th>
                <th className="p-3">Location</th>
                <th className="p-3">Government Authority / Escalation Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {referrals.map((rf) => (
                <tr key={rf.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-mono font-bold text-emerald-800">{rf.reference_no}</td>
                  <td className="p-3 font-medium text-slate-900 max-w-xs truncate">{rf.title}</td>
                  <td className="p-3 text-slate-600">{rf.location_address}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 px-2.5 py-1 rounded-md font-semibold border border-sky-200">
                      🏛️ {rf.municipal_referral_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link to={`/issues/${rf.id}`} className="text-emerald-700 hover:underline font-bold">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
