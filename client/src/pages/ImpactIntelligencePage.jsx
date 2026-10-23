import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllScenarios, getScenarioById } from '../services/scenarioData';
import {
  analyzeRecurrence,
  calculatePriorityScore,
  calculateDataSufficiency,
  generateInterventionRecommendation,
  generateAnalyticalExplanation,
  calculateDashboardMetrics,
  DEFAULT_WEIGHTS,
  DEFAULT_SETTINGS
} from '../services/intelligenceEngine';
import IntelligenceMap from '../components/IntelligenceMap';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import CategoryBadge from '../components/CategoryBadge';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import {
  Sparkles,
  MapPin,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Shield,
  Filter,
  Sliders,
  RotateCcw,
  Search,
  ArrowUpDown,
  FileText,
  ChevronRight,
  TrendingUp,
  Info,
  CheckSquare,
  Building,
  UserCheck,
  Send,
  Eye,
  X,
  PlusCircle,
  HelpCircle,
  BarChart3,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export default function ImpactIntelligencePage() {
  const { user, isCoordinator } = useAuth();

  // Baseline scenarios & active modified scenario state
  const baseScenarios = useMemo(() => getAllScenarios(), []);
  const [selectedScenarioId, setSelectedScenarioId] = useState('SCN-01');
  const [scenarioOverrides, setScenarioOverrides] = useState({}); // Overrides per scenario
  const [toastMessage, setToastMessage] = useState(null);

  // Configuration settings & priority weights
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [analysisWindowDays, setAnalysisWindowDays] = useState(60);
  const [observationWindowDays, setObservationWindowDays] = useState(30);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Search & Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [recurrenceFilter, setRecurrenceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('priority'); // 'priority', 'incidents', 'recency'

  // Selected Location Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [evidenceReviewedMap, setEvidenceReviewedMap] = useState({});

  // Simulated inspection form state
  const [inspectionInspector, setInspectionInspector] = useState('Dr. Ananya Joshi (Coordinator)');
  const [inspectionFindings, setInspectionFindings] = useState('On-site inspection completed. Site cleared and no fresh debris observed.');
  const [inspectionOutcome, setInspectionOutcome] = useState('Clean & Sustained');

  // Trigger toast helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Get active scenario object (incorporating any local user overrides)
  const getActiveScenario = (id) => {
    const base = getScenarioById(id);
    const override = scenarioOverrides[id];
    return override ? { ...base, ...override } : base;
  };

  // Compile active scenario list
  const activeScenarios = useMemo(() => {
    return baseScenarios.map(s => getActiveScenario(s.id));
  }, [baseScenarios, scenarioOverrides]);

  // Current selected scenario
  const currentScenario = useMemo(() => {
    return getActiveScenario(selectedScenarioId);
  }, [selectedScenarioId, scenarioOverrides]);

  // Compute intelligence metrics for all locations
  const locationsIntelligence = useMemo(() => {
    return activeScenarios.map(scn => {
      const recurrence = analyzeRecurrence(scn, analysisWindowDays);
      const physicalIncidents = (scn.incidents || []).filter(i => !i.isDuplicate);
      const sufficiency = calculateDataSufficiency(scn, physicalIncidents);
      const priority = calculatePriorityScore(scn, recurrence, sufficiency, weights);
      const recommendation = generateInterventionRecommendation(scn, recurrence, priority, sufficiency);

      return {
        id: scn.id,
        scenario: scn,
        recurrence,
        sufficiency,
        priority,
        recommendation
      };
    });
  }, [activeScenarios, analysisWindowDays, weights]);

  // Global Dashboard Metrics
  const dashboardMetrics = useMemo(() => {
    return calculateDashboardMetrics(
      baseScenarios,
      selectedScenarioId,
      scenarioOverrides[selectedScenarioId] || null,
      observationWindowDays
    );
  }, [baseScenarios, selectedScenarioId, scenarioOverrides, observationWindowDays]);

  // Current selected location intelligence
  const currentIntelligence = useMemo(() => {
    return locationsIntelligence.find(l => l.id === selectedScenarioId) || locationsIntelligence[0];
  }, [locationsIntelligence, selectedScenarioId]);

  // Explainability Breakdown for current location
  const analyticalExplanation = useMemo(() => {
    if (!currentIntelligence) return null;
    return generateAnalyticalExplanation(
      currentIntelligence.scenario,
      currentIntelligence.recurrence,
      currentIntelligence.priority,
      currentIntelligence.recommendation,
      currentIntelligence.sufficiency
    );
  }, [currentIntelligence]);

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return locationsIntelligence.filter(loc => {
      const scn = loc.scenario;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = scn.title.toLowerCase().includes(query);
        const matchesArea = (scn.area || '').toLowerCase().includes(query);
        const matchesSubtitle = (scn.subtitle || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesArea && !matchesSubtitle) return false;
      }
      if (categoryFilter !== 'All' && scn.category !== categoryFilter) return false;
      if (severityFilter !== 'All' && loc.priority.priorityTier !== severityFilter) return false;
      if (recurrenceFilter !== 'All') {
        if (recurrenceFilter === 'Chronic' && !loc.recurrence.isChronic) return false;
        if (recurrenceFilter === 'Relapse' && !loc.recurrence.recurrenceAfterIntervention) return false;
        if (recurrenceFilter === 'Emerging' && loc.recurrence.recurrenceCategory !== 'Rapid Emerging Hotspot') return false;
        if (recurrenceFilter === 'Isolated' && loc.recurrence.recurrenceCategory !== 'Isolated Single Event') return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'priority') return b.priority.finalScore - a.priority.finalScore;
      if (sortBy === 'incidents') return b.recurrence.physicalIncidentCount - a.recurrence.physicalIncidentCount;
      if (sortBy === 'recency') {
        const aDays = a.recurrence.daysSinceLast ?? 999;
        const bDays = b.recurrence.daysSinceLast ?? 999;
        return aDays - bDays;
      }
      return 0;
    });
  }, [locationsIntelligence, searchTerm, categoryFilter, severityFilter, recurrenceFilter, sortBy]);

  // Action: Reset current scenario to baseline
  const handleResetScenario = (id) => {
    setScenarioOverrides(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    triggerToast(`Scenario ${id} reset to original baseline dataset.`);
  };

  // Action: Reset all weights to default
  const handleResetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
    setAnalysisWindowDays(60);
    setObservationWindowDays(30);
    triggerToast('Analytical weights reset to algorithmic defaults.');
  };

  // Action: Record Simulated Follow-up Inspection
  const handleRecordInspection = () => {
    const cur = currentScenario;
    const newFollowUp = {
      id: `FLP-SIM-${Date.now()}`,
      scheduledDate: new Date().toISOString(),
      completedDate: new Date().toISOString(),
      inspector: inspectionInspector,
      findings: inspectionFindings,
      status: inspectionOutcome
    };

    const updatedFollowUpHistory = [...(cur.followUpHistory || []), newFollowUp];
    const updatedPending = {
      isDue: inspectionOutcome === 'Recurrence Detected',
      dueDate: inspectionOutcome === 'Recurrence Detected' ? new Date(Date.now() + 7 * 86400000).toISOString() : null,
      assignedTo: cur.pendingFollowUp?.assignedTo || 'Field Coordinator'
    };

    setScenarioOverrides(prev => ({
      ...prev,
      [cur.id]: {
        ...cur,
        followUpHistory: updatedFollowUpHistory,
        pendingFollowUp: updatedPending
      }
    }));

    triggerToast(`Simulated inspection recorded by ${inspectionInspector}. State recalculated.`);
  };

  // Action: Mark Evidence Reviewed toggle
  const toggleEvidenceReviewed = (reportId) => {
    setEvidenceReviewedMap(prev => {
      const current = !!prev[reportId];
      const updated = { ...prev, [reportId]: !current };
      triggerToast(!current ? `Evidence for ${reportId} marked as coordinator-reviewed.` : `Evidence review cleared.`);
      return updated;
    });
  };

  // Action: Simulate Adding a Quick Volunteer Intervention
  const handleAddIntervention = () => {
    const cur = currentScenario;
    const newInt = {
      id: `INT-SIM-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'Rapid Community Intervention',
      executor: 'Sevadeep Field Taskforce',
      wasteCollectedKg: 120,
      notes: 'Coordinator dispatched tactical cleanup team with municipal bags.',
      evidencePhoto: '/assets/drive_cleanliness_1.jpeg',
      outcomeStatus: 'Completed',
      costInr: 1500
    };

    setScenarioOverrides(prev => ({
      ...prev,
      [cur.id]: {
        ...cur,
        previousInterventions: [...(cur.previousInterventions || []), newInt]
      }
    }));

    triggerToast('Simulated intervention added. Priority and recurrence scores recalculated.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-emerald-950 via-forest-dark to-slate-900 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-emerald-900">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deterministic Geospatial &amp; Recurrence Analytics</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Civic Impact Intelligence Engine
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
                Empowering Sevadeep NGO to answer: Which environmental problem locations need attention first? Why might they be recurring? What intervention should be deployed, and did it create a lasting, evidence-supported outcome?
              </p>
            </div>

            {/* Top Action Toolbar */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-bold text-xs shadow-md border border-emerald-600/50 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-emerald-300" />
                <span>Engine Tuning &amp; Weights</span>
              </button>

              <button
                type="button"
                onClick={() => handleResetScenario(selectedScenarioId)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-md border border-slate-700 transition-all cursor-pointer"
                title="Reset current scenario data to baseline"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Reset Baseline</span>
              </button>
            </div>
          </div>

          {/* Scenario Selector Ribbon (12 End-to-End Scenarios) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-2">
                <span>Select Curated Scenario Dossier:</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (12 distinct operational cases in Pune)
                </span>
              </span>
              <span className="text-[11px] text-emerald-300/80 hidden sm:inline">
                Active Case: <strong>{currentScenario.title}</strong>
              </span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-emerald-800">
              {baseScenarios.map(s => {
                const isSelected = s.id === selectedScenarioId;
                const isOverridden = !!scenarioOverrides[s.id];
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(s.id)}
                    className={`flex-shrink-0 text-left px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-300 shadow-lg ring-2 ring-emerald-400/50 scale-[1.02]'
                        : 'bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-100 border-emerald-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
                      <span className="uppercase tracking-wider text-emerald-300">{s.id}</span>
                      {isOverridden && (
                        <span className="bg-amber-400 text-slate-900 text-[9px] px-1.5 py-0.2 rounded font-extrabold">
                          MODIFIED
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-xs mt-1 truncate max-w-[200px] text-white">
                      {s.title}
                    </div>
                    <div className="text-[10px] text-emerald-200/70 truncate max-w-[200px]">
                      {s.area} • {s.category}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* KPI Intelligence Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Tracked Locations
            </span>
            <div className="text-2xl font-black text-slate-900">
              {dashboardMetrics.totalTrackedLocations}
            </div>
            <p className="text-[10px] text-slate-400">All Pune civic clusters</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              Intervention Required
            </span>
            <div className="text-2xl font-black text-rose-600">
              {dashboardMetrics.requiringInterventionCount}
            </div>
            <p className="text-[10px] text-slate-400">Active non-remediated sites</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Recurring Black Spots
            </span>
            <div className="text-2xl font-black text-amber-600">
              {dashboardMetrics.recurringCount}
            </div>
            <p className="text-[10px] text-slate-400">Multi-incident hotspots</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-violet-700 uppercase tracking-wider block">
              Follow-Ups Due
            </span>
            <div className="text-2xl font-black text-violet-600">
              {dashboardMetrics.followUpDueCount}
            </div>
            <p className="text-[10px] text-slate-400">Scheduled verification checks</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
              Interventions Done
            </span>
            <div className="text-2xl font-black text-teal-700">
              {dashboardMetrics.interventionsCompletedCount}
            </div>
            <p className="text-[10px] text-slate-400">Volunteer &amp; municipal actions</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-emerald-300 shadow-xs space-y-1 bg-emerald-50/50">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Sustained Resolution
            </span>
            <div className="text-2xl font-black text-emerald-700 flex items-baseline gap-1.5">
              <span>{dashboardMetrics.sustainedResolutionRate}%</span>
              <span className="text-[11px] text-emerald-600 font-bold">
                ({dashboardMetrics.sustainedNumerator}/{dashboardMetrics.sustainedDenominator})
              </span>
            </div>
            <p className="text-[10px] text-emerald-700/80">
              {observationWindowDays}-day clean observation window
            </p>
          </div>
        </div>

        {/* Environmental Provenance Strip */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-900">Supported Environmental Metrics:</span>
            <span className="bg-emerald-100 text-emerald-900 font-extrabold px-2 py-0.5 rounded-md">
              {dashboardMetrics.environmentalImpact.totalWasteCollectedKg.toLocaleString()} kg Solid Waste Diverted
            </span>
            <span className="bg-teal-100 text-teal-900 font-extrabold px-2 py-0.5 rounded-md">
              ₹{dashboardMetrics.environmentalImpact.totalInterventionCostInr.toLocaleString()} Volunteer Resources
            </span>
            <span className="bg-blue-100 text-blue-900 font-extrabold px-2 py-0.5 rounded-md">
              {dashboardMetrics.environmentalImpact.totalCommunityConfirmations} Citizen Confirmations
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium italic">
            *Data Provenance: Ground weighing logs &amp; verified receipts; synthetic scenario testbed.
          </div>
        </div>

        {/* Engine Tuning Drawer Modal / Accordion */}
        {showSettingsDrawer && (
          <div className="bg-white rounded-3xl p-6 border border-emerald-300 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Analytical Engine Weighting &amp; Threshold Configuration
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetWeights}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettingsDrawer(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Severity Weight */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>Severity Weight</span>
                  <span className="text-emerald-700 font-black">{Math.round(weights.severityWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights.severityWeight}
                  onChange={(e) => setWeights({ ...weights, severityWeight: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Impact of critical &amp; high hazard classifications</p>
              </div>

              {/* Recurrence Weight */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>Recurrence Frequency Weight</span>
                  <span className="text-emerald-700 font-black">{Math.round(weights.recurrenceWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.05"
                  value={weights.recurrenceWeight}
                  onChange={(e) => setWeights({ ...weights, recurrenceWeight: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Weight given to chronic and repeat black spots</p>
              </div>

              {/* Time Unresolved */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>Time Unresolved Weight</span>
                  <span className="text-emerald-700 font-black">{Math.round(weights.timeUnresolvedWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={weights.timeUnresolvedWeight}
                  onChange={(e) => setWeights({ ...weights, timeUnresolvedWeight: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Aging urgency for open complaints</p>
              </div>

              {/* Community Confirmations */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>Community Confirmations Weight</span>
                  <span className="text-emerald-700 font-black">{Math.round(weights.confirmationsWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.05"
                  value={weights.confirmationsWeight}
                  onChange={(e) => setWeights({ ...weights, confirmationsWeight: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Citizen upvotes &amp; neighbor corroborations</p>
              </div>

              {/* Environmental Sensitivity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>Environmental Sensitivity Weight</span>
                  <span className="text-emerald-700 font-black">{Math.round(weights.environmentalWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.05"
                  value={weights.environmentalWeight}
                  onChange={(e) => setWeights({ ...weights, environmentalWeight: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Riverbed, forest, &amp; lake buffer protection</p>
              </div>

              {/* Urgency */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>Intervention Urgency Weight</span>
                  <span className="text-emerald-700 font-black">{Math.round(weights.urgencyWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.05"
                  value={weights.urgencyWeight}
                  onChange={(e) => setWeights({ ...weights, urgencyWeight: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Overdue follow-up inspections penalty</p>
              </div>
            </div>

            {/* Analysis Window & Observation Window Controls */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700">Analysis Lookback Window:</span>
                {[14, 30, 60, 90, 180].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setAnalysisWindowDays(days)}
                    className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer transition-colors ${
                      analysisWindowDays === days
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700">Sustained Resolution Window:</span>
                {[14, 30, 60, 90].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setObservationWindowDays(days)}
                    className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer transition-colors ${
                      observationWindowDays === days
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Geospatial Map + Active Scenario Spotlight Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Interactive Geospatial Map (Pune Wards)
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Click pins to inspect location intelligence
              </span>
            </div>

            <IntelligenceMap
              locations={locationsIntelligence}
              selectedLocationId={selectedScenarioId}
              onSelectLocation={(id) => {
                setSelectedScenarioId(id);
                setDetailModalOpen(true);
              }}
              height="480px"
            />
          </div>

          {/* Active Location Dossier Quick Spotlight */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active Spotlight Dossier
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {currentScenario.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {currentScenario.subtitle || currentScenario.area}
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-slate-900">
                  {currentIntelligence.priority.finalScore}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentIntelligence.priority.priorityTier === 'Critical'
                      ? 'bg-rose-100 text-rose-800'
                      : currentIntelligence.priority.priorityTier === 'High'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {currentIntelligence.priority.priorityTier} Priority
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">Physical Incidents</span>
                <span className="text-base font-black text-slate-800">
                  {currentIntelligence.recurrence.physicalIncidentCount}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">Recurrence Risk</span>
                <span className="text-xs font-black text-slate-800 line-clamp-1 mt-0.5">
                  {currentIntelligence.recurrence.recurrenceCategory}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">Confidence</span>
                <span className="text-xs font-black text-emerald-700 mt-0.5 block">
                  {currentIntelligence.sufficiency.score}%
                </span>
              </div>
            </div>

            {/* Recommended Action Card */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Recommended Intervention:</span>
              </div>
              <p className="text-xs font-bold text-slate-900 leading-snug">
                {currentIntelligence.recommendation.title}
              </p>
              <div className="text-[11px] text-slate-600">
                Responsible: <strong>{currentIntelligence.recommendation.responsibleParty}</strong>
              </div>
              <div className="text-[11px] text-emerald-800 font-semibold">
                Timeline: {currentIntelligence.recommendation.urgencyWindow}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDetailModalOpen(true)}
                className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Open Full Intelligence Dossier</span>
              </button>
              <button
                type="button"
                onClick={handleAddIntervention}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
                title="Simulate adding volunteer intervention"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Priority Intervention Queue Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Priority Intervention Queue
              </h3>
              <p className="text-xs text-slate-500">
                Deterministic prioritization ranking based on severity, recurrence intervals, and environmental sensitivity
              </p>
            </div>

            {/* Controls: Search, Category, Severity, Sorting */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search location or area..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none w-44"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Garbage & Waste">Garbage &amp; Waste</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Illegal Dumping">Illegal Dumping</option>
                <option value="Damaged Public Facilities">Damaged Facilities</option>
                <option value="Stormwater & Drainage">Stormwater &amp; Drainage</option>
                <option value="Tree & Park Maintenance">Tree &amp; Park</option>
              </select>

              {/* Severity Filter */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
              >
                <option value="All">All Tiers</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Sorting */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
              >
                <option value="priority">Sort: Priority Score</option>
                <option value="incidents">Sort: Incident Count</option>
                <option value="recency">Sort: Most Recent</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Location &amp; Area</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Incidents / Window</th>
                  <th className="pb-3">Recurrence Classification</th>
                  <th className="pb-3">Priority Score</th>
                  <th className="pb-3">Suggested Next Action</th>
                  <th className="pb-3">Responsible Party</th>
                  <th className="pb-3">Follow-Up State</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map(item => {
                  const scn = item.scenario;
                  const isCurrent = scn.id === selectedScenarioId;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCurrent ? 'bg-emerald-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 pl-2">
                        <div className="font-extrabold text-slate-900">{scn.title}</div>
                        <div className="text-[11px] text-slate-500">{scn.subtitle || scn.area}</div>
                      </td>
                      <td className="py-3">
                        <CategoryBadge category={scn.category} />
                      </td>
                      <td className="py-3 font-semibold text-slate-700">
                        {item.recurrence.physicalIncidentCount} physical
                        {item.recurrence.duplicateCount > 0 && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            (+{item.recurrence.duplicateCount} dupes)
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.recurrence.isChronic
                              ? 'bg-rose-100 text-rose-800'
                              : item.recurrence.recurrenceAfterIntervention
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.recurrence.isChronic && <Flame className="w-3 h-3 text-rose-600" />}
                          <span>{item.recurrence.recurrenceCategory}</span>
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">
                            {item.priority.finalScore}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                              item.priority.priorityTier === 'Critical'
                                ? 'bg-rose-600 text-white'
                                : item.priority.priorityTier === 'High'
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {item.priority.priorityTier}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 max-w-[200px]">
                        <div className="truncate text-slate-800 font-semibold" title={item.recommendation.title}>
                          {item.recommendation.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {item.recommendation.urgencyWindow}
                        </div>
                      </td>
                      <td className="py-3 text-[11px] text-slate-600 max-w-[150px] truncate" title={item.recommendation.responsibleParty}>
                        {item.recommendation.responsibleParty}
                      </td>
                      <td className="py-3">
                        {scn.pendingFollowUp?.isDue ? (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Inspection Due
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">
                            Routine Monitoring
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedScenarioId(scn.id);
                            setDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI-Style Explainability Panel (Deterministic Rationale) */}
        {analyticalExplanation && (
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Explainable Civic Intelligence Engine
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Transparent, verifiable algorithmic justification for {currentScenario.title}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                Zero Black-Box Reliance • 100% Deterministic Rule Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    1. What The Field Data Demonstrates
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                    {analyticalExplanation.dataSummary}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    2. Priority Scoring Rationale &amp; Activated Rules
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                    {analyticalExplanation.priorityRationale}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    3. Uncertainty &amp; Data Gaps (Distinguishing Hypotheses)
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                    {analyticalExplanation.uncertaintyStatement}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    4. Recommended Action &amp; Success Verification Criteria
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                    {analyticalExplanation.recommendationRationale}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Location Intelligence Detail Modal (11 Prescribed Sections) */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center p-3 sm:p-6">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white p-5 flex items-start justify-between gap-4 border-b border-emerald-900">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-900/90 px-2 py-0.5 rounded">
                    Dossier {currentScenario.id}
                  </span>
                  <CategoryBadge category={currentScenario.category} />
                  <span className="text-xs text-slate-300">
                    [{currentScenario.coordinates[0].toFixed(4)}, {currentScenario.coordinates[1].toFixed(4)}]
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1">
                  {currentScenario.title}
                </h2>
                <p className="text-xs text-emerald-200/80">
                  {currentScenario.subtitle || currentScenario.area}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <div className="text-2xl font-black text-white">
                    {currentIntelligence.priority.finalScore}/100
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300">
                    {currentIntelligence.priority.priorityTier} Priority
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-emerald-900/60 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-6 space-y-8 text-xs text-slate-700">
              {/* Section 1: Location Overview */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">1</span>
                  <span>Location Overview &amp; Environmental Sensitivity</span>
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px]">Ward / Zone</span>
                    <strong className="text-slate-800">{currentScenario.area}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px]">Geographic Coordinates</span>
                    <strong className="text-slate-800 font-mono">
                      {currentScenario.coordinates[0]}, {currentScenario.coordinates[1]}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px]">Environmental Zone</span>
                    <strong className="text-slate-800">{currentScenario.environmentalSensitivity}</strong>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed px-1">
                  {currentScenario.description}
                </p>
              </div>

              {/* Section 2: Incident History (Distinguishing Duplicates) */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">2</span>
                  <span>Incident History ({currentScenario.incidents.length} Submissions)</span>
                </h4>
                <div className="space-y-2">
                  {currentScenario.incidents.map((inc) => {
                    const isReviewed = !!evidenceReviewedMap[inc.id];
                    return (
                      <div
                        key={inc.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          inc.isDuplicate
                            ? 'bg-slate-50 border-dashed border-slate-300 opacity-75'
                            : 'bg-white border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">{inc.id}</span>
                            <SeverityBadge severity={inc.severity} />
                            {inc.isDuplicate ? (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                Consolidated Duplicate of {inc.duplicateOf}
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                Primary Physical Incident
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(inc.reportedAt).toLocaleString()}
                          </span>
                        </div>

                        <p className="font-bold text-slate-800">{inc.title}</p>
                        <p className="text-slate-600 mt-0.5">{inc.description}</p>

                        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                          <div className="flex items-center gap-3 text-slate-500">
                            <span>Reporter: <strong>{inc.reporter}</strong></span>
                            <span>Community Corroborations: <strong>{inc.confirmations}</strong></span>
                            <span>Photo Evidence: <strong>{inc.photo ? 'Attached' : 'Missing'}</strong></span>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleEvidenceReviewed(inc.id)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                              isReviewed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {isReviewed ? '✓ Evidence Verified' : 'Mark Evidence Reviewed'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Timeline of Previous Interventions */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">3</span>
                  <span>Previous Interventions History ({currentScenario.previousInterventions.length} Records)</span>
                </h4>
                {currentScenario.previousInterventions.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 italic">
                    No documented historical interventions on record for this specific location.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentScenario.previousInterventions.map((int) => (
                      <div key={int.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900">{int.type} ({int.id})</span>
                          <span className="text-slate-400 text-[11px]">{new Date(int.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600">{int.notes}</p>
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                          <span>Executor: <strong>{int.executor}</strong></span>
                          <span>Waste Diverted: <strong>{int.wasteCollectedKg} kg</strong></span>
                          <span>Audited Cost: <strong>₹{int.costInr}</strong></span>
                          <span className="text-emerald-700 font-bold">Status: {int.outcomeStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Before-and-After Evidence */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">4</span>
                  <span>Before-and-After Visual Evidence Proof</span>
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <BeforeAfterSlider
                    beforeUrl="/assets/drive_cleanliness_1.jpeg"
                    afterUrl="/assets/drive_cleanliness_1.jpeg"
                    beforeLabel="Baseline Initial Obstacle Photo"
                    afterLabel="Field Remediation Inspection Photo"
                    height="h-64 sm:h-72"
                  />
                </div>
              </div>

              {/* Section 5: Recurrence Analysis */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">5</span>
                  <span>Recurrence &amp; Temporal Analysis</span>
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px]">Classification</span>
                    <strong className="text-slate-800">{currentIntelligence.recurrence.recurrenceCategory}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px]">Days Since Last Incident</span>
                    <strong className="text-slate-800">
                      {currentIntelligence.recurrence.daysSinceLast !== null ? `${currentIntelligence.recurrence.daysSinceLast} Days` : 'N/A'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px]">Average Recurrence Span</span>
                    <strong className="text-slate-800">
                      {currentIntelligence.recurrence.averageIntervalDays ? `Every ${currentIntelligence.recurrence.averageIntervalDays} Days` : 'N/A'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px]">Relapse Post-Resolution</span>
                    <strong className={currentIntelligence.recurrence.recurrenceAfterIntervention ? 'text-rose-600' : 'text-emerald-700'}>
                      {currentIntelligence.recurrence.recurrenceAfterIntervention ? `Yes (within ${currentIntelligence.recurrence.recurrenceLagDays} days)` : 'No Relapse'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Section 6: Likely Contributing Factors (Confirmed vs Hypotheses) */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">6</span>
                  <span>Contributing Factors (Confirmed Facts vs. Working Hypotheses)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1.5">
                    <span className="font-extrabold text-emerald-900 block text-[11px] uppercase tracking-wider">
                      ✓ Confirmed Field Observations (Facts)
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {(currentScenario.knownFacts || []).map((fact, idx) => (
                        <li key={idx}>{fact}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1.5">
                    <span className="font-extrabold text-amber-900 block text-[11px] uppercase tracking-wider">
                      ? Analytical Hypotheses (Requires Verification)
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {(currentScenario.hypotheses || []).map((hyp, idx) => (
                        <li key={idx}>{hyp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 7: Recommended Intervention */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">7</span>
                  <span>Recommended Intervention Strategy</span>
                </h4>
                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-sm text-emerald-950">
                      {currentIntelligence.recommendation.title}
                    </h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      {currentIntelligence.recommendation.urgencyWindow}
                    </span>
                  </div>
                  <p className="text-slate-800">
                    <strong>Rationale:</strong> {currentIntelligence.recommendation.reasonForRecommendation}
                  </p>
                  <p className="text-slate-800">
                    <strong>Action:</strong> {currentIntelligence.recommendation.proposedNextAction}
                  </p>
                  <p className="text-slate-800">
                    <strong>Verification Required:</strong> {currentIntelligence.recommendation.requiredVerification}
                  </p>
                </div>
              </div>

              {/* Section 8: Stakeholder Matrix & Resources */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">8</span>
                  <span>Required Resources &amp; Stakeholder Responsibilities</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px]">Primary Lead</span>
                    <strong className="text-slate-900">{currentIntelligence.recommendation.stakeholderMatrix.primary}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px]">Municipal / External Liaison</span>
                    <strong className="text-slate-900">{currentIntelligence.recommendation.stakeholderMatrix.secondary}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px]">Community Role</span>
                    <strong className="text-slate-900">{currentIntelligence.recommendation.stakeholderMatrix.communityRole}</strong>
                  </div>
                </div>
                <div className="pt-1">
                  <span className="font-bold text-slate-700">Requisite Field Materials: </span>
                  <span className="text-slate-600">
                    {currentIntelligence.recommendation.requiredResources.join(' • ')}
                  </span>
                </div>
              </div>

              {/* Section 9: Follow-Up Plan & Simulation Console */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">9</span>
                  <span>Follow-Up Plan &amp; Simulated Field Inspection Console</span>
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">Scheduled Follow-up Due</span>
                      <strong>
                        {currentScenario.pendingFollowUp?.dueDate
                          ? new Date(currentScenario.pendingFollowUp.dueDate).toLocaleString()
                          : 'None Pending'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">Inspector Assigned</span>
                      <strong>{currentScenario.pendingFollowUp?.assignedTo || 'Field Volunteer'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">Overdue Status</span>
                      <strong className={currentIntelligence.recurrence.isFollowUpOverdue ? 'text-rose-600' : 'text-emerald-700'}>
                        {currentIntelligence.recurrence.isFollowUpOverdue ? 'Inspection Overdue' : 'On Schedule'}
                      </strong>
                    </div>
                  </div>

                  {/* Interactive Simulation Form */}
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <span className="font-extrabold text-slate-900 block text-xs">
                      Simulate Coordinator Field Inspection Sign-Off:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        placeholder="Inspector Name"
                        value={inspectionInspector}
                        onChange={(e) => setInspectionInspector(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Inspection Findings"
                        value={inspectionFindings}
                        onChange={(e) => setInspectionFindings(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                      />
                      <select
                        value={inspectionOutcome}
                        onChange={(e) => setInspectionOutcome(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                      >
                        <option value="Clean & Sustained">Clean &amp; Sustained</option>
                        <option value="Recurrence Detected">Recurrence Detected</option>
                        <option value="Municipal Dependency Active">Municipal Dependency Active</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleRecordInspection}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Record Simulated Inspection
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 10: Outcome Verification Stepper */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">10</span>
                  <span>Outcome Verification Lifecycle Stepper</span>
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[10px]">
                    <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl font-bold">
                      1. Reported
                    </div>
                    <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl font-bold">
                      2. Verified
                    </div>
                    <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl font-bold">
                      3. Intervened
                    </div>
                    <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl font-bold">
                      4. Photo Proof
                    </div>
                    <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl font-bold">
                      5. Inspected
                    </div>
                    <div className={`p-2 rounded-xl font-bold ${
                      currentScenario.code === 'sustained_resolution_success'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      6. Sustained
                    </div>
                    <div className={`p-2 rounded-xl font-bold ${
                      currentIntelligence.recurrence.recurrenceAfterIntervention
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      7. Relapse Watch
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 11: Impact Summary & Audit History */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">11</span>
                  <span>Impact Summary &amp; Immutable Audit Trail</span>
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-600 space-y-1">
                  <p>
                    <strong>Location UID:</strong> SVD-GEO-{currentScenario.id} • 
                    <strong> Active Window:</strong> {analysisWindowDays} Days • 
                    <strong> Confidence Factor:</strong> {currentIntelligence.sufficiency.score}%
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    All analytics strictly evaluated via deterministic Sevadeep algorithms with zero black-box LLM dependencies.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Logged in as: <strong>{user?.name || 'Dr. Ananya Joshi (Coordinator)'}</strong>
              </span>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
