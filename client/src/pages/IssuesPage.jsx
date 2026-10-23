import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { issueService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LeafletMap from '../components/LeafletMap';
import StatusBadge from '../components/StatusBadge';
import CategoryBadge from '../components/CategoryBadge';
import SeverityBadge from '../components/SeverityBadge';
import {
  Search,
  Filter,
  Map as MapIcon,
  LayoutGrid,
  List as ListIcon,
  MapPin,
  Calendar,
  ThumbsUp,
  MessageSquare,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Garbage and Waste Management',
  'Public Cleanliness',
  'Water Leakage',
  'Damaged Public Facilities',
  'Environmental Problems',
  'Other Community Issues'
];

export default function IssuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang, translateCategory, translateStatus } = useLanguage();

  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state initialized from URL params if present
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [viewMode, setViewMode] = useState('split'); // 'split', 'grid', 'map'
  const [selectedIssueForMap, setSelectedIssueForMap] = useState(null);

  useEffect(() => {
    fetchIssues();
  }, [selectedCategory, selectedStatus, sortBy, searchParams]);

  const fetchIssues = async (page = 1) => {
    setLoading(true);
    try {
      const q = searchParams.get('q') || '';
      const category = selectedCategory !== 'All' ? selectedCategory : undefined;
      const status = selectedStatus !== 'All' ? selectedStatus : undefined;

      const res = await issueService.getPublicIssues({
        q,
        category,
        status,
        sort: sortBy,
        page,
        limit: 12
      });

      if (res.data.success) {
        setIssues(res.data.issues || []);
        setPagination(res.data.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set('q', searchTerm.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat !== 'All') newParams.set('category', cat);
    else newParams.delete('category');
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {lang === 'mr' ? 'सार्वजनिक नागरी नोंदवही' : 'Public Civic Ledger'}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {lang === 'mr' ? 'नागरी तक्रारी व नकाशा' : 'Community Reports & Issue Map'}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            {lang === 'mr'
              ? 'पुणे परिसरातील मंजूर समस्या शोधा, सक्रिय तक्रारींना पाठिंबा द्या आणि कामाची प्रगती तपासा.'
              : 'Explore approved community problems across Pune neighborhoods, confirm active issues, and follow progress.'}
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'split' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'mr' ? 'विभाजित दृश्य' : 'Split View'}</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'mr' ? 'ग्रिड सूची' : 'Grid Only'}</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'map' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'mr' ? 'केवळ नकाशा' : 'Map Only'}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Search Input and Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'mr' ? 'शीर्षक, पत्ता (उदा. फर्ग्युसन रस्ता, मंडई, डेक्कन) किंवा संदर्भ क्रमांकाने शोधा...' : 'Search by title, location (e.g. FC Road, Mandai, Deccan) or reference code...'}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 outline-hidden bg-white"
            >
              <option value="All">{lang === 'mr' ? 'सर्व स्थिती' : 'All Statuses'}</option>
              <option value="Approved">{lang === 'mr' ? 'मंजूर' : 'Approved'}</option>
              <option value="In Progress">{lang === 'mr' ? 'काम सुरू आहे' : 'In Progress'}</option>
              <option value="Resolved">{lang === 'mr' ? 'निकाली काढले' : 'Resolved'}</option>
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 outline-hidden bg-white"
            >
              <option value="newest">{lang === 'mr' ? 'क्रम: नवीन प्रथम' : 'Sort: Newest First'}</option>
              <option value="oldest">{lang === 'mr' ? 'क्रम: जुने प्रथम' : 'Sort: Oldest First'}</option>
              <option value="priority">{lang === 'mr' ? 'क्रम: निकड/प्राधान्य' : 'Sort: Priority / Severity'}</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-xs font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'श्रेणी:' : 'Category:'}</span>
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? (lang === 'mr' ? 'सर्व श्रेणी' : 'All') : translateCategory(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-4 py-2 rounded-xl text-xs flex items-center justify-between">
            <span>{lang === 'mr' ? `पुणे नकाशावर ${issues.length} मंजूर समस्या दर्शवित आहे` : `Showing ${issues.length} approved issues on Pune OpenStreetMap`}</span>
            <span className="font-semibold text-emerald-800">{lang === 'mr' ? 'तपशीलासाठी मार्करवर क्लिक करा' : 'Click any marker to inspect'}</span>
          </div>
          <LeafletMap issues={issues} height="650px" />
        </div>
      ) : viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Map */}
          <div className="lg:col-span-5 sticky top-24 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>{lang === 'mr' ? 'परिसर नकाशा' : 'Interactive Pune Map'}</span>
              <span className="text-emerald-700">{issues.length} {lang === 'mr' ? 'ठिकाणे' : 'Locations'}</span>
            </div>
            <LeafletMap issues={issues} selectedIssue={selectedIssueForMap} height="560px" />
          </div>

          {/* Right Column: Cards List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {lang === 'mr' ? `एकूण ` : `Found `}
                <strong>{pagination.total}</strong>
                {lang === 'mr' ? ` मंजूर नागरी तक्रारी सापडल्या` : ` approved community reports`}
              </span>
              <span>
                {lang === 'mr' ? `पृष्ठ ${pagination.page} / ${pagination.totalPages}` : `Page ${pagination.page} of ${pagination.totalPages}`}
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                {t('loadingReports')}
              </div>
            ) : issues.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <Search className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">{lang === 'mr' ? 'कोणतीही तक्रार आढळली नाही' : 'No Matching Reports Found'}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {lang === 'mr' ? 'कृपया शोध शब्द तपासा किंवा वेगळा परिसर निवडा.' : 'Try clearing search filters or search a different neighborhood in Pune.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {issues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onHighlight={() => setSelectedIssueForMap(issue)}
                    lang={lang}
                    t={t}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchIssues(pagination.page - 1)}
                  className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-700 px-3">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchIssues(pagination.page + 1)}
                  className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Grid Only View */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {lang === 'mr' ? `दर्शवित आहे: ` : `Showing `}
              <strong>{pagination.total}</strong>
              {lang === 'mr' ? ` तक्रारी` : ` community reports`}
            </span>
            <span>
              {lang === 'mr' ? `पृष्ठ ${pagination.page} / ${pagination.totalPages}` : `Page ${pagination.page} of ${pagination.totalPages}`}
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              {t('loadingReports')}
            </div>
          ) : issues.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              {lang === 'mr' ? 'कोणतीही तक्रार आढळली नाही.' : 'No reports match your selected criteria.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} lang={lang} t={t} />
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchIssues(pagination.page - 1)}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-700 px-3">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchIssues(pagination.page + 1)}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IssueCard({ issue, onHighlight, lang, t }) {
  return (
    <div
      onMouseEnter={onHighlight}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
    >
      <div className="h-40 bg-slate-100 relative overflow-hidden">
        <img
          src={issue.primary_photo || '/assets/drive_cleanliness_1.jpeg'}
          alt={issue.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = '/assets/drive_cleanliness_1.jpeg'; }}
        />
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={issue.status} />
        </div>
        <div className="absolute bottom-2.5 left-2.5">
          <span className="text-[10px] font-mono bg-slate-900/80 text-white px-2 py-0.5 rounded font-bold backdrop-blur-sm">
            {issue.reference_no}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-1">
            <CategoryBadge category={issue.category} />
            <SeverityBadge severity={issue.severity} />
          </div>

          <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {issue.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{issue.location_address || issue.area}</span>
          </div>

          {issue.municipal_referral_status && (
            <div className="text-[10px] bg-sky-50 text-sky-800 border border-sky-200 px-2 py-1 rounded truncate">
              🏛️ {issue.municipal_referral_status}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3 text-emerald-600" />
              <span>{issue.confirmations_count || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-slate-400" />
              <span>{issue.comments_count || 0}</span>
            </span>
          </div>

          <Link
            to={`/issues/${issue.id}`}
            className="font-bold text-emerald-700 hover:text-emerald-900 text-xs flex items-center gap-1 cursor-pointer"
          >
            <span>{t ? t('details') : (lang === 'mr' ? 'तपशील पहा' : 'View Details')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
