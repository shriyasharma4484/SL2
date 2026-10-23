import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { issueService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import CategoryBadge from '../components/CategoryBadge';
import {
  PlusCircle,
  Clock,
  ThumbsUp,
  MessageSquare,
  ArrowRight,
  MapPin,
  Calendar,
  Award,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function MemberDashboardPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await issueService.getMyReports();
        if (res.data.success) {
          setReports(res.data.reports || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {t('residentWorkspaceBadge')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('welcomeBack')} {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('residentDesc')}
          </p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
            <div className="text-2xl font-extrabold text-emerald-800">{user?.points || 15}</div>
            <p className="text-[11px] font-semibold text-emerald-900">{t('civicPoints')}</p>
          </div>

          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-5 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-200" />
            <span>{t('reportNewIssue')}</span>
          </Link>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t('mySubmittedReports')} ({reports.length})
          </h2>
          <span className="text-xs text-slate-500">
            {t('includesStatuses')}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            <span>{t('loadingMyReports')}</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">{t('noReportsYet')}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('noReportsDesc')}
            </p>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('reportIssueNowBtn')}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 bg-slate-100 relative">
                    <img
                      src={rep.primary_photo || '/assets/drive_cleanliness_1.jpeg'}
                      alt={rep.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/assets/drive_cleanliness_1.jpeg'; }}
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <StatusBadge status={rep.status} />
                    </div>
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="text-[10px] font-mono bg-slate-900/80 text-white px-2 py-0.5 rounded font-bold">
                        {rep.reference_no}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <CategoryBadge category={rep.category} />
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                      {rep.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{rep.location_address}</span>
                    </div>

                    {/* Progress note */}
                    {rep.coordinator_notes && (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-emerald-950">
                        <span className="font-bold text-emerald-800 block text-[11px]">{t('coordinatorUpdate')}</span>
                        <p className="line-clamp-2 text-[11px] mt-0.5 text-slate-700">{rep.coordinator_notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <ThumbsUp className="w-3 h-3 text-emerald-600" />
                    <span>{rep.confirmations_count || 0} {t('confirmations')}</span>
                  </span>

                  <Link
                    to={`/issues/${rep.id}`}
                    className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{lang === 'mr' ? 'तक्रारीची प्रगती पहा' : 'View Progress'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
