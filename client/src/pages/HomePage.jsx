import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issueService, eventService, impactService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import StatusBadge from '../components/StatusBadge';
import CategoryBadge from '../components/CategoryBadge';
import {
  AlertCircle,
  PlusCircle,
  Calendar,
  MapPin,
  CheckCircle2,
  Users,
  TrendingUp,
  ArrowRight,
  Shield,
  ThumbsUp,
  Leaf,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';

export default function HomePage() {
  const { t, lang } = useLanguage();
  const [recentIssues, setRecentIssues] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [impactStats, setImpactStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [issuesRes, eventsRes, impactRes] = await Promise.all([
          issueService.getPublicIssues({ limit: 4, sort: 'newest' }),
          eventService.getEvents({ status: 'Upcoming' }),
          impactService.getStats()
        ]);

        if (issuesRes.data.success) {
          setRecentIssues(issuesRes.data.issues || []);
        }
        if (eventsRes.data.success) {
          setUpcomingEvents(eventsRes.data.events.slice(0, 3) || []);
        }
        if (impactRes.data.success) {
          setImpactStats(impactRes.data.stats || null);
        }
      } catch (err) {
        console.warn('Error loading homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-dark via-forest to-emerald-950 text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                <Leaf className="w-3.5 h-3.5" />
                <span>{t('heroBadge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                {t('heroTitle1')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white">
                  {t('heroTitle2')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/report"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 hover:-translate-y-0.5 transition-all"
                >
                  <PlusCircle className="w-5 h-5 text-emerald-200" />
                  <span>{t('reportIssueHero')}</span>
                </Link>

                <Link
                  to="/activities"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm hover:-translate-y-0.5 transition-all"
                >
                  <Calendar className="w-4 h-4 text-emerald-300" />
                  <span>{t('exploreActivitiesHero')}</span>
                </Link>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-emerald-200/90 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('verifiedCoordinatorReview')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('openStreetMapGeo')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('communityVolunteerAction')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Card with Authentic Cleanliness Drive Photo */}
                <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/30 bg-emerald-950/50 backdrop-blur-sm">
                  <img
                    src="/assets/drive_cleanliness_1.jpeg"
                    alt="Sevadeep NGO volunteers conducting cleanliness drive in Pune"
                    className="w-full h-80 object-cover"
                  />
                  <div className="p-4 bg-emerald-950/80 border-t border-emerald-800/40 text-xs">
                    <p className="font-bold text-white flex items-center gap-2">
                      <SparklingDot />
                      <span>{t('missionPhotoTitle')}</span>
                    </p>
                    <p className="text-slate-300 text-[11px] mt-1">
                      {t('missionPhotoDesc')}
                    </p>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white text-slate-800 px-4 py-3 rounded-xl shadow-xl border border-slate-200 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-sm">
                    SD
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t('floatingBadgeTitle')}</p>
                    <p className="text-[11px] text-emerald-700 font-semibold">{t('floatingBadgeSub')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (4 STEPS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {t('howItWorksBadge')}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('howItWorksTitle')}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {t('howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg mb-4 border border-amber-200">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">{t('step1Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('step1Desc')}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-amber-700 font-medium">
              {t('step1Status')}
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg mb-4 border border-blue-200">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">{t('step2Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('step2Desc')}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-blue-700 font-medium">
              {t('step2Status')}
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg mb-4 border border-indigo-200">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">{t('step3Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('step3Desc')}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-indigo-700 font-medium">
              {t('step3Status')}
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4 border border-emerald-200">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">{t('step4Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('step4Desc')}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-medium">
              {t('step4Status')}
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMMUNITY IMPACT SECTION (STATISTICS) */}
      <section className="bg-slate-900 text-white py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {t('impactBadge')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {t('impactTitle')}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                {t('impactSubtitle')}
              </p>
            </div>

            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-amber-300">
              {t('liveDbBadge')}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                {impactStats ? impactStats.reports_resolved : '...'}
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">{t('grievancesResolved')}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t('verifiedOnSite')}</p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 text-center">
              <Calendar className="w-8 h-8 text-teal-400 mx-auto mb-2" />
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                {impactStats ? impactStats.activities_completed : '...'}
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">{t('cleanupDrivesCompleted')}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t('drivesLocation')}</p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 text-center">
              <Users className="w-8 h-8 text-sky-400 mx-auto mb-2" />
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                {impactStats ? impactStats.active_volunteers_participated : '...'}
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">{t('activeVolunteers')}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t('citizenChampions')}</p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 text-center">
              <Leaf className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                {impactStats ? `${Number(impactStats.total_waste_diverted_kg).toFixed(0)} kg` : '...'}
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">{t('wasteDiverted')}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t('recycledPmc')}</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/impact"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              <span>{t('viewFullImpact')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. RECENT COMMUNITY ISSUES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t('recentIssuesTitle')}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
              {t('recentIssuesSubtitle')}
            </p>
          </div>
          <Link
            to="/issues"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>{t('exploreAllIssues')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentIssues.length === 0 ? (
            <div className="col-span-4 py-8 text-center text-slate-400 text-xs">
              {t('loadingReports')}
            </div>
          ) : (
            recentIssues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Photo Thumbnail */}
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  {issue.primary_photo ? (
                    <img
                      src={issue.primary_photo}
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = '/assets/drive_cleanliness_1.jpeg'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      {t('noPhotoEvidence')}
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    <StatusBadge status={issue.status} />
                  </div>
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="text-[10px] font-mono bg-slate-900/80 text-white px-2 py-0.5 rounded font-semibold backdrop-blur-sm">
                      {issue.reference_no}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <CategoryBadge category={issue.category} />
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                      {issue.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{issue.location_address || issue.area}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <ThumbsUp className="w-3 h-3 text-emerald-600" />
                      <span>{issue.confirmations_count || 0} {t('confirmations')}</span>
                    </span>

                    <Link
                      to={`/issues/${issue.id}`}
                      className="font-bold text-emerald-700 hover:text-emerald-800 text-xs flex items-center gap-1"
                    >
                      <span>{t('details')}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. UPCOMING VOLUNTEER ACTIVITIES */}
      <section className="bg-emerald-50/60 border-y border-emerald-100 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {t('communityDrivesBadge')}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                {t('upcomingActivitiesTitle')}
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                {t('upcomingActivitiesSubtitle')}
              </p>
            </div>
            <Link
              to="/activities"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950"
            >
              <span>{t('viewAllActivities')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-emerald-200/80 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="h-44 bg-slate-100 relative">
                  <img
                    src={event.cover_image || '/assets/drive_cleanliness_1.jpeg'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/assets/drive_cleanliness_1.jpeg'; }}
                  />
                  <div className="absolute top-2.5 left-2.5 bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {event.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        {new Date(event.event_date).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} • {event.start_time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                      <span className="truncate">{event.location_name}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {t('slotsRemaining')} <strong className="text-emerald-700">{event.available_slots} / {event.total_slots}</strong>
                    </span>
                    <Link
                      to={`/activities/${event.id}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors"
                    >
                      {t('registerNow')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ABOUT SEVADEEP NGO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {t('aboutBadge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('aboutTitle')}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {t('aboutP1')}
            </p>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {t('aboutP2')}
            </p>

            <div className="pt-3 flex flex-wrap gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 transition-colors"
              >
                <span>{t('readMission')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <span>{t('contactCoordinators')}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
              <img
                src="/assets/team_conclusion.png"
                alt="Sevadeep coordinators and volunteer team"
                className="w-full h-64 object-cover"
                onError={(e) => { e.target.src = '/assets/drive_cleanliness_2.jpeg'; }}
              />
              <div className="p-3 text-[11px] text-slate-500 text-center">
                {t('teamPhotoCaption')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-forest-dark via-emerald-950 to-forest text-white p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('ctaTitle')}
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
              {t('ctaSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/report"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-md transition-all"
            >
              {t('ctaReportNow')}
            </Link>
            <Link
              to="/register"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-6 py-3.5 rounded-xl border border-white/20 transition-all"
            >
              {t('ctaVolunteer')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SparklingDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
    </span>
  );
}
