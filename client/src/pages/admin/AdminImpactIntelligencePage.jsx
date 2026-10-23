import React, { useState, useEffect } from 'react';
import { intelligenceService } from '../../services/api';
import LeafletMap from '../../components/LeafletMap';
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Building,
  Users,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Plus,
  RefreshCw,
  FileText,
  Shield,
  HelpCircle,
  Eye,
  Camera,
  Layers,
  Sparkles,
  Check,
  X,
  Loader2,
  TrendingUp,
  AlertCircle,
  Activity
} from 'lucide-react';

export default function AdminImpactIntelligencePage() {
  const [metrics, setMetrics] = useState({
    recurringLocations: 12,
    followUpsDue: 4,
    interventionsVerified: 18,
    recurrenceFree: 7,
    activeRecurrence: 2
  });

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'map', 'matrix'

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Location for Intelligence Drawer
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [locationDetail, setLocationDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Intervention Modal
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [interventionForm, setInterventionForm] = useState({
    title: '',
    intervention_type: 'Municipal Infrastructure Escalation',
    responsible_party: 'Joint NGO-Municipal Action',
    action_plan: '',
    municipal_docket_no: '',
    scheduled_followup_days: 14
  });
  const [submittingIntervention, setSubmittingIntervention] = useState(false);

  // Inspection Modal
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionForm, setInspectionForm] = useState({
    inspection_id: null,
    outcome: 'Clean - Sustained Resolution',
    notes: '',
    evidence_photo_url: '/assets/drive_cleanliness_1.jpeg',
    next_check_days: 14
  });
  const [submittingInspection, setSubmittingInspection] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, lRes] = await Promise.all([
        intelligenceService.getMetrics(),
        intelligenceService.getLocations({
          status: statusFilter,
          priority: priorityFilter,
          search: searchQuery
        })
      ]);

      if (mRes.data?.success) {
        setMetrics(mRes.data.metrics);
      }
      if (lRes.data?.success) {
        setLocations(lRes.data.locations || []);
      }
    } catch (err) {
      console.error('Failed to load intelligence data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (id) => {
    setSelectedLocationId(id);
    setDetailLoading(true);
    try {
      const res = await intelligenceService.getLocationById(id);
      if (res.data?.success) {
        setLocationDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to load location details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedLocationId(null);
    setLocationDetail(null);
  };

  const handleOpenInterventionModal = (location) => {
    setInterventionForm({
      title: `${location.name} - Targeted Intervention`,
      intervention_type: location.category.includes('Waste') ? 'Municipal Infrastructure Escalation' : 'Structural Drainage Repair',
      responsible_party: location.recommended_party || 'Joint NGO-Municipal Action',
      action_plan: location.recommended_action || '',
      municipal_docket_no: `PMC-${location.area?.split(' ')?.[0]?.toUpperCase() || 'PUN'}-${Math.floor(1000 + Math.random() * 9000)}`,
      scheduled_followup_days: 14
    });
    setShowInterventionModal(true);
  };

  const handleSubmitIntervention = async (e) => {
    e.preventDefault();
    if (!selectedLocationId) return;
    setSubmittingIntervention(true);
    try {
      const res = await intelligenceService.createIntervention({
        location_id: selectedLocationId,
        ...interventionForm
      });
      if (res.data?.success) {
        alert(res.data.message);
        setShowInterventionModal(false);
        handleOpenDetail(selectedLocationId);
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit intervention');
    } finally {
      setSubmittingIntervention(false);
    }
  };

  const handleOpenInspectionModal = (location, inspection = null) => {
    setInspectionForm({
      inspection_id: inspection ? inspection.id : null,
      outcome: 'Clean - Sustained Resolution',
      notes: inspection ? inspection.notes : 'On-site verification performed. Verified whether chronic recurrence has ceased.',
      evidence_photo_url: '/assets/drive_cleanliness_2.jpeg',
      next_check_days: 14
    });
    setShowInspectionModal(true);
  };

  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    if (!selectedLocationId) return;
    setSubmittingInspection(true);
    try {
      const res = await intelligenceService.recordInspection({
        location_id: selectedLocationId,
        ...inspectionForm
      });
      if (res.data?.success) {
        alert(res.data.message);
        setShowInspectionModal(false);
        handleOpenDetail(selectedLocationId);
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record inspection');
    } finally {
      setSubmittingInspection(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Active Recurrence':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Active Recurrence</span>
          </span>
        );
      case 'Under Diagnosis':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Under Diagnosis</span>
          </span>
        );
      case 'Intervention Planned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Intervention Planned</span>
          </span>
        );
      case 'Follow-up Monitoring':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            <span>Follow-up Monitoring</span>
          </span>
        );
      case 'Sustained Resolution':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sustained Clean</span>
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <span>SEVADEEP · PUNE ENVIRONMENTAL OPERATIONS</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Civic Impact Intelligence Engine
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong>From recurring problem detection to lasting, evidence-backed resolution.</strong> Don't just track whether a complaint was closed. Track whether the underlying civic problem was solved sustainably across Pune's neighborhoods.
          </p>
        </div>
      </div>

      {/* 2. Top Metric Cards (Matches Exact Dataset Specification) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Recurring Locations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Recurring locations</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{metrics.recurringLocations}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Active problem nodes</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">Database verified</span>
          </p>
        </div>

        {/* Follow-ups Due */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Follow-ups due</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{metrics.followUpsDue}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Inspections pending</span>
            <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">SLA action</span>
          </p>
        </div>

        {/* Interventions Verified */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Interventions verified</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600">{metrics.interventionsVerified}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>NGO &amp; PMC executed</span>
            <span className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">Field audited</span>
          </p>
        </div>

        {/* Locations Remaining Recurrence-Free */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Locations remaining recurrence-free</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{metrics.recurrenceFree}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Sustained clean sites</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">Sustainable fix</span>
          </p>
        </div>
      </div>

      {/* 3. The 5-Step Civic Impact Intelligence Loop Explainer */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 sm:p-5">
        <h3 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>The Closed-Loop Intelligence Process: From Detection to Sustained Cleanliness</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="font-bold text-emerald-800">1. Detect</span>
            <p className="text-[11px] text-slate-600 mt-1">
              Identify recurring complaints at the same physical coordinates via spatial clustering &amp; history.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="font-bold text-amber-800">2. Diagnose</span>
            <p className="text-[11px] text-slate-600 mt-1">
              Analyze evidence for root causes (e.g. missing bins). Explicitly flags uncertainty when evidence is insufficient.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="font-bold text-blue-800">3. Recommend</span>
            <p className="text-[11px] text-slate-600 mt-1">
              Suggest an action plan, identifying whether it requires NGO volunteer action or PMC municipal escalation.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="font-bold text-purple-800">4. Mobilize</span>
            <p className="text-[11px] text-slate-600 mt-1">
              Create volunteer drives, coordinate municipal bins, assign owners, and capture verified field evidence.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="font-bold text-emerald-800">5. Verify &amp; Learn</span>
            <p className="text-[11px] text-slate-600 mt-1">
              Schedule follow-up inspections, track recurrence rate, and feed outcomes back into location memory.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar & View Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'queue' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Priority Location Queue ({locations.length})
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'map' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Recurrence Map View
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search recurring location or root cause..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs"
            >
              <option value="all">All Statuses ({metrics.recurringLocations})</option>
              <option value="Active Recurrence">Active Recurrence</option>
              <option value="Under Diagnosis">Under Diagnosis</option>
              <option value="Intervention Planned">Intervention Planned</option>
              <option value="Follow-up Monitoring">Follow-up Monitoring</option>
              <option value="Sustained Resolution">Sustained Resolution ({metrics.recurrenceFree})</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="ml-auto text-[11px] text-slate-400">
            Showing {locations.length} tracked civic problem histories
          </div>
        </div>
      </div>

      {/* 5. Main Content: Queue vs Map View */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          <p>Running spatial clustering and computing recurrence metrics...</p>
        </div>
      ) : activeTab === 'queue' ? (
        /* Queue View */
        <div className="space-y-4">
          {locations.map((loc) => {
            const isHighPriority = loc.priority === 'Critical' || loc.priority === 'High';
            return (
              <div
                key={loc.id}
                className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 shadow-xs hover:shadow-md ${
                  isHighPriority ? 'border-l-4 border-l-rose-500 border-slate-200' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Location & Recurrence Identity */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderStatusBadge(loc.status)}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {loc.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        loc.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                        loc.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {loc.priority} Priority
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {loc.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {loc.area}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        {loc.incident_count} reported incidents in history
                      </span>
                      {loc.days_recurrence_free > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                            {loc.days_recurrence_free} days recurrence-free
                          </span>
                        </>
                      )}
                    </div>

                    {/* System Observation Box */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <BrainCircuit className="w-3.5 h-3.5 text-emerald-600" />
                          <span>System Observation &amp; Diagnosis</span>
                        </span>
                        {/* Uncertainty meter */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          loc.root_cause_confidence === 'High'
                            ? 'bg-emerald-100 text-emerald-800'
                            : loc.root_cause_confidence === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {loc.root_cause_confidence === 'High' ? 'Confident Diagnosis' : 'Evidence Uncertain'}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {loc.system_observation}
                      </p>
                      {loc.suspected_root_cause && (
                        <p className="text-[11px] text-slate-700 pt-1 border-t border-slate-200">
                          <strong>Suspected Root Cause:</strong> {loc.suspected_root_cause}
                        </p>
                      )}
                    </div>

                    {/* Recommended Next Step Box */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Recommended Next Intervention</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-900 bg-emerald-200/60 px-2 py-0.5 rounded">
                          {loc.recommended_party}
                        </span>
                      </div>
                      <p className="text-emerald-900 text-[11px] leading-relaxed">
                        {loc.recommended_action}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 flex-shrink-0 pt-2 lg:pt-0">
                    <button
                      onClick={() => handleOpenDetail(loc.id)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Evidence &amp; History</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedLocationId(loc.id);
                        handleOpenInterventionModal(loc);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Plan Intervention</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedLocationId(loc.id);
                        handleOpenInspectionModal(loc);
                      }}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Verify Follow-up</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Map View */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Pune Civic Recurrence Spatial Map</h3>
              <p className="text-xs text-slate-500">
                12 persistent problem locations classified by recurrence state across Pune municipal wards
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-rose-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                Active Recurrence
              </span>
              <span className="flex items-center gap-1 text-amber-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                Under Diagnosis
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Sustained Clean
              </span>
            </div>
          </div>

          <LeafletMap
            issues={locations.map((l) => ({
              id: l.id,
              reference_no: `LOC-${l.id}`,
              title: l.name,
              category: l.category,
              status: l.status === 'Sustained Resolution' ? 'Resolved' : l.status === 'Active Recurrence' ? 'Critical' : 'Under Review',
              latitude: l.latitude,
              longitude: l.longitude,
              location_address: `${l.name}, ${l.area}`,
              area: l.area,
              description: l.system_observation
            }))}
            height="500px"
          />
        </div>
      )}

      {/* 6. Location Detail Drawer / Modal (Deep 5-Phase Inspection) */}
      {selectedLocationId && locationDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative">
            {/* Top Close Button */}
            <button
              onClick={handleCloseDetail}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-2 pr-10">
              <div className="flex flex-wrap items-center gap-2">
                {renderStatusBadge(locationDetail.location.status)}
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  LOC-PUNE-{locationDetail.location.id}
                </span>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  {locationDetail.location.incident_count} Incidents Linked
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {locationDetail.location.name}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{locationDetail.location.area}, Pune • Primary Category: {locationDetail.location.category}</span>
              </p>
            </div>

            {/* Diagnostic Panel with Uncertainty Flagging */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-amber-700" />
                  <span>Phase 2: Diagnosis &amp; Root-Cause Analysis</span>
                </h4>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-600 font-medium">Model Certainty:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    locationDetail.location.root_cause_confidence === 'High'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-200 text-amber-900'
                  }`}>
                    {locationDetail.location.root_cause_confidence}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {locationDetail.location.system_observation}
              </p>

              {locationDetail.location.root_cause_confidence !== 'High' && (
                <div className="p-2.5 rounded-xl bg-white/80 border border-amber-300 text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Uncertainty Notice:</strong> Evidence density is currently moderate. Physical inspection of nearby waste collection arrangements recommended before selecting final capital expenditure.
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-amber-200/80 text-xs">
                <strong>Recommended Action:</strong> {locationDetail.location.recommended_action}
                <div className="mt-1 text-[11px] text-slate-600">
                  <strong>Designated Execution Body:</strong> {locationDetail.location.recommended_party}
                </div>
              </div>
            </div>

            {/* Linked Reports Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Phase 1: Incident History &amp; Evidence ({locationDetail.reports?.length || 0} Reports)</span>
              </h4>

              <div className="space-y-2.5">
                {locationDetail.reports?.map((rep) => (
                  <div key={rep.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rep.title}</span>
                        <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {rep.reference_no}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1">{rep.description}</p>
                      <div className="text-[10px] text-slate-400">
                        Reported on {new Date(rep.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • Proximity: {rep.distance_meters}m from cluster center
                      </div>
                    </div>

                    {rep.primary_photo && (
                      <img
                        src={rep.primary_photo}
                        alt="Evidence"
                        className="h-14 w-20 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                        onError={(e) => { e.target.src = '/assets/drive_cleanliness_1.jpeg'; }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Interventions History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-700" />
                  <span>Phase 3 &amp; 4: Action Plans &amp; Interventions ({locationDetail.interventions?.length || 0})</span>
                </h4>
                <button
                  onClick={() => handleOpenInterventionModal(locationDetail.location)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Plan New Intervention</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {locationDetail.interventions?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No interventions recorded yet. Click above to plan.</p>
                ) : (
                  locationDetail.interventions?.map((inv) => (
                    <div key={inv.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{inv.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 whitespace-pre-line">{inv.action_plan}</p>
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                        <span><strong>Owner:</strong> {inv.responsible_party}</span>
                        {inv.municipal_docket_no && <span><strong>Docket #:</strong> {inv.municipal_docket_no}</span>}
                        {inv.completion_date && <span><strong>Completed:</strong> {new Date(inv.completion_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Inspections / Follow-up Audit History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-700" />
                  <span>Phase 5: Follow-up Verification &amp; Recurrence Tracking ({locationDetail.inspections?.length || 0})</span>
                </h4>
                <button
                  onClick={() => handleOpenInspectionModal(locationDetail.location)}
                  className="px-3 py-1.5 rounded-lg bg-purple-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Verification Inspection</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {locationDetail.inspections?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No inspections scheduled yet.</p>
                ) : (
                  locationDetail.inspections?.map((ins) => (
                    <div key={ins.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">
                          Scheduled: {new Date(ins.scheduled_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ins.outcome.includes('Clean') ? 'bg-emerald-100 text-emerald-800' :
                          ins.outcome.includes('Recurrence') ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {ins.outcome}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{ins.notes}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Plan Intervention Modal */}
      {showInterventionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Plan Targeted Environmental Intervention
              </h3>
              <button onClick={() => setShowInterventionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIntervention} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Intervention Title
                </label>
                <input
                  type="text"
                  required
                  value={interventionForm.title}
                  onChange={(e) => setInterventionForm({ ...interventionForm, title: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Designated Execution Body
                </label>
                <select
                  value={interventionForm.responsible_party}
                  onChange={(e) => setInterventionForm({ ...interventionForm, responsible_party: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                >
                  <option value="Sevadeep NGO Led">Sevadeep NGO Led (Volunteer Operations)</option>
                  <option value="Pune Municipal Corporation (PMC)">Pune Municipal Corporation (PMC) Escalation</option>
                  <option value="Joint NGO-Municipal Action">Joint NGO-Municipal Action</option>
                  <option value="Local Traders Association">Local Traders Association Dialogue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Action Plan &amp; Checklist
                </label>
                <textarea
                  rows="3"
                  required
                  value={interventionForm.action_plan}
                  onChange={(e) => setInterventionForm({ ...interventionForm, action_plan: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    PMC Docket # (If applicable)
                  </label>
                  <input
                    type="text"
                    value={interventionForm.municipal_docket_no}
                    onChange={(e) => setInterventionForm({ ...interventionForm, municipal_docket_no: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Automated Follow-up (Days)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="60"
                    value={interventionForm.scheduled_followup_days}
                    onChange={(e) => setInterventionForm({ ...interventionForm, scheduled_followup_days: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInterventionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingIntervention}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5"
                >
                  {submittingIntervention ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save &amp; Schedule Inspection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Record Follow-up Inspection Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Record Ground-Truth Inspection Outcome
              </h3>
              <button onClick={() => setShowInspectionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInspection} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Observed Outcome on Site
                </label>
                <select
                  value={inspectionForm.outcome}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, outcome: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                >
                  <option value="Clean - Sustained Resolution">Clean - Sustained Resolution (No Recurrence)</option>
                  <option value="Partial Recurrence">Partial Recurrence (Minor Waste/Issues Visible)</option>
                  <option value="Severe Recurrence - Intervene Again">Severe Recurrence - Intervene Again (Re-dumping Confirmed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Field Inspection Notes &amp; Evidence Findings
                </label>
                <textarea
                  rows="3"
                  required
                  value={inspectionForm.notes}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })}
                  placeholder="Detail on-site verification observations..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Inspection Evidence Photo URL
                </label>
                <input
                  type="text"
                  value={inspectionForm.evidence_photo_url}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, evidence_photo_url: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInspection}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center gap-1.5"
                >
                  {submittingInspection ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Verify &amp; Update Location State</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
