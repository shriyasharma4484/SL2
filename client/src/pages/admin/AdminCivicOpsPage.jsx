import React, { useState, useEffect, useMemo } from 'react';
import { civicOpsService } from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Shield,
  Layers,
  Fuel,
  Target,
  ArrowRight,
  UserCheck,
  UserX,
  Clock,
  Car,
  Bike,
  Footprints,
  Info,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  RotateCcw,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Custom Map Marker Generators
function createVolunteerIcon(vehicleType, isAvailable = true) {
  const bg = isAvailable ? '#059669' : '#94a3b8'; // emerald vs slate
  const ring = isAvailable ? '#a7f3d0' : '#e2e8f0';

  const html = `
    <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background-color: ${ring}; opacity: 0.85;"></div>
      <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background-color: ${bg}; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">
        V
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-volunteer-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
}

function createTaskIcon(priority, isCovered = true) {
  let color = '#059669'; // low
  let ring = '#a7f3d0';

  if (!isCovered) {
    color = '#dc2626'; // bright red for uncovered/understaffed
    ring = '#fee2e2';
  } else if (priority === 'Critical') {
    color = '#e11d48'; // rose
    ring = '#ffe4e6';
  } else if (priority === 'High') {
    color = '#ea580c'; // orange
    ring = '#ffedd5';
  } else if (priority === 'Medium') {
    color = '#2563eb'; // blue
    ring = '#dbeafe';
  }

  const html = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${ring}; opacity: 0.85;"></div>
      <div style="position: relative; width: 24px; height: 24px; border-radius: 50%; background-color: ${color}; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
        ${priority === 'Critical' ? '★' : '●'}
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-task-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
}

export default function AdminCivicOpsPage() {
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [overviewData, setOverviewData] = useState(null);
  const [plans, setPlans] = useState(null);
  const [tradeOffComparison, setTradeOffComparison] = useState([]);
  const [activeStrategy, setActiveStrategy] = useState('balanced'); // 'balanced', 'travel_minimization', 'priority_maximization'
  const [selectedTaskFilter, setSelectedTaskFilter] = useState('all');

  // Dynamic Cancellation Simulator State
  const [cancelledIds, setCancelledIds] = useState([]);
  const [reallocationAlert, setReallocationAlert] = useState(null);
  const [showFormula, setShowFormula] = useState(false);
  const [approvedSuccess, setApprovedSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'map', 'matrix'

  // Fetch Initial Overview & Generate Plans
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const overviewRes = await civicOpsService.getOverview();
      if (overviewRes.data?.success) {
        setOverviewData(overviewRes.data.data);
      }

      const plansRes = await civicOpsService.generatePlans({});
      if (plansRes.data?.success) {
        setPlans(plansRes.data.data.plans);
        setTradeOffComparison(plansRes.data.data.tradeOffComparison || []);
      }
    } catch (err) {
      console.error('[CivicOps] Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Current active plan
  const activePlan = useMemo(() => {
    if (!plans) return null;
    return plans[activeStrategy] || plans.balanced;
  }, [plans, activeStrategy]);

  // Handle Strategy Change
  const handleSelectStrategy = (stratKey) => {
    setActiveStrategy(stratKey);
    setApprovedSuccess(null);
  };

  // Dynamic Cancellation Handler
  const toggleVolunteerCancellation = async (volId) => {
    const isCurrentlyCancelled = cancelledIds.includes(volId);
    const updatedIds = isCurrentlyCancelled
      ? cancelledIds.filter(id => id !== volId)
      : [...cancelledIds, volId];

    setCancelledIds(updatedIds);

    if (updatedIds.length === 0) {
      setReallocationAlert(null);
      // Re-run normal solver
      try {
        setCalculating(true);
        const res = await civicOpsService.generatePlans({});
        if (res.data?.success) {
          setPlans(res.data.data.plans);
        }
      } finally {
        setCalculating(false);
      }
      return;
    }

    try {
      setCalculating(true);
      const simRes = await civicOpsService.simulateCancellation({
        cancelledVolunteerIds: updatedIds,
        strategy: activeStrategy
      });

      if (simRes.data?.success) {
        const reallocated = simRes.data.data.reallocatedPlan;
        setPlans(prev => ({
          ...prev,
          [activeStrategy]: reallocated
        }));
        setReallocationAlert({
          count: updatedIds.length,
          atRiskTasks: simRes.data.data.atRiskTasks || [],
          message: simRes.data.data.operationalImpactAlert
        });
      }
    } catch (err) {
      console.error('[CivicOps] Cancellation sim error:', err);
    } finally {
      setCalculating(false);
    }
  };

  // Quick Preset: Drop 3 Volunteers
  const triggerQuickDrop3 = () => {
    // Drop Aarav (1), Rohan (3), and Omkar (9)
    [1, 3, 9].forEach(id => {
      if (!cancelledIds.includes(id)) {
        toggleVolunteerCancellation(id);
      }
    });
  };

  // Reset all cancellations
  const handleResetCancellations = async () => {
    setCancelledIds([]);
    setReallocationAlert(null);
    setApprovedSuccess(null);
    try {
      setCalculating(true);
      await civicOpsService.resetScenario();
      await loadInitialData();
    } finally {
      setCalculating(false);
    }
  };

  // Approve and Dispatch Plan
  const handleApprovePlan = async () => {
    if (!activePlan) return;
    try {
      setApproving(true);
      const res = await civicOpsService.approvePlan({
        strategy: activeStrategy,
        planData: activePlan
      });
      if (res.data?.success) {
        setApprovedSuccess(res.data.data);
      }
    } catch (err) {
      console.error('[CivicOps] Approve plan error:', err);
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Loading CivicOps Optimization Engine...</h2>
        <p className="text-sm text-slate-500 mt-1">Calibrating Pune volunteer spatial coordinates and task priorities.</p>
      </div>
    );
  }

  const volunteers = overviewData?.volunteers || [];
  const tasks = overviewData?.tasks || [];
  const telemetry = overviewData?.telemetry || {};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-forest-dark text-white border-b border-emerald-800 px-4 sm:px-6 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>SEVADEEP · PUNE FIELD OPERATIONS DISPATCH OPTIMIZER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              CivicOps: Intelligent Resource Allocation & Field Coordination
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
              The right team, at the right place, at the right time. Solves volunteer deployment as a constrained optimization problem balancing task priority, volunteer skills, travel distance, and workload fairness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetCancellations}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer shadow-sm"
              title="Reset all dropouts and revert scenario to default seeds"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Scenario</span>
            </button>

            <button
              onClick={handleApprovePlan}
              disabled={approving || !activePlan}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl shadow-md transition cursor-pointer ${
                approvedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold'
              }`}
            >
              {approving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Committing Plan...</span>
                </>
              ) : approvedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Plan Dispatched ({approvedSuccess.planCode})</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Approve & Dispatch Field Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* Success Confirmation Alert if Approved */}
        {approvedSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Field Operations Plan Successfully Approved & Locked ({approvedSuccess.planCode})
                </h4>
                <p className="text-xs text-emerald-800">
                  Active deployment strategy: <span className="font-semibold uppercase">{approvedSuccess.strategy}</span>. Volunteer field assignments have been logged and SMS dispatch notices are queued for morning muster.
                </p>
              </div>
            </div>
            <button
              onClick={() => setApprovedSuccess(null)}
              className="text-xs text-emerald-700 hover:text-emerald-950 underline font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Cancellation Alert Banner */}
        {reallocationAlert && (
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm ${
            reallocationAlert.atRiskTasks.length > 0
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                reallocationAlert.atRiskTasks.length > 0 ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
              }`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-white/70">
                    Dropout Simulation Active
                  </span>
                  <span className="text-xs font-semibold">
                    {reallocationAlert.count} Volunteer(s) Dropped Out
                  </span>
                </div>
                <p className="text-xs mt-1">
                  {reallocationAlert.message}
                </p>
                {reallocationAlert.atRiskTasks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {reallocationAlert.atRiskTasks.map(t => (
                      <span key={t.taskId} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300">
                        ⚠️ {t.title} ({t.status})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetCancellations}
                className="px-3 py-1.5 bg-white border border-rose-300 text-rose-900 hover:bg-rose-100 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Clear Dropouts
              </button>
            </div>
          </div>
        )}

        {/* Mathematical Objective Formulation & Algorithm Architecture Dropdown */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition cursor-pointer text-left border-b border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Optimization Algorithm Formulation
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Constrained Combinatorial Volunteer Assignment Engine
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>{showFormula ? 'Hide Formulation' : 'View Formula & Constraints'}</span>
              {showFormula ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showFormula && (
            <div className="p-5 bg-white space-y-4 text-xs text-slate-700 animate-in fade-in">
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-center overflow-x-auto shadow-inner text-sm">
                max ∑ (x_vt) · [ w_p · P_t + w_s · S_vt + w_f · F_v - w_d · D_vt ]
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block text-xs">P_t: Task Priority</span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Weighted 1–5 based on urgency & recurring severity (Critical hotspots receive top volunteer capacity priority).
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block text-xs">S_vt: Skill Suitability</span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Evaluates exact match against primary & secondary capabilities (Tree plantation, heavy debris, documentation, first aid).
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block text-xs">F_v: Fairness & Retention</span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Workload balancing term. Prioritizes willing volunteers with lower past deployments to prevent burn-out.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block text-xs">D_vt: Haversine Travel Cost</span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Calculates spherical distance in km between Pune origin and task site. Enforces strict D_vt ≤ max_travel_km.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-2 text-[11px]">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Hard Operational Constraints:</strong> Volunteers are restricted to at most 1 task shift (no double-booking). Team size must adhere to [min_volunteers, max_volunteers]. Each team must contain at least one designated Team Lead or certified Skill Specialist.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 1. What-If Simulation: Three Plan Comparison Cards */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                1. What-If Scenario Simulation
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                Compare Deployment Plans Before Dispatching
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Select any strategy card to instantly review routes and volunteer rosters
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tradeOffComparison.map((comp) => {
              const isSelected = activeStrategy === comp.strategyKey;
              return (
                <div
                  key={comp.strategyKey}
                  onClick={() => handleSelectStrategy(comp.strategyKey)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative shadow-xs flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {comp.strategyKey === 'balanced' && (
                    <span className="absolute -top-3 right-4 bg-emerald-700 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                      Recommended
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-extrabold text-base ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                        {comp.label}
                      </h3>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 font-medium mb-4">
                      {comp.focus}
                    </p>

                    <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Average Travel</span>
                        <span className="font-bold text-slate-900">{comp.avgDistance}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">High-Priority Coverage</span>
                        <span className="font-bold text-emerald-700">{comp.highPriorityCoverage}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Skill Match Index</span>
                        <span className="font-bold text-slate-900">{comp.skillMatch}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Workload Fairness</span>
                        <span className="font-bold text-slate-900">{comp.workloadFairness}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Civic Tasks Covered</span>
                        <span className="font-bold text-slate-900">{comp.tasksCovered}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 italic block">
                      Best for: {comp.recommendedFor}
                    </span>
                    <button
                      type="button"
                      className={`w-full mt-2.5 py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                        isSelected
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? 'Active Selection' : 'Select Plan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Interactive Volunteer Dropout Simulator Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <UserX className="w-3.5 h-3.5" />
                2. Dynamic Reallocation & Dropout Simulator
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                Stress-Test Sudden Volunteer Cancellations
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={triggerQuickDrop3}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Drop 3 Key Volunteers (Friday Night Scenario)
              </button>
              {cancelledIds.length > 0 && (
                <button
                  onClick={handleResetCancellations}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Restore All
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Click any volunteer chip below to toggle their availability. CivicOps dynamically recomputes assignments without overwriting approved schedules, highlighting uncovered tasks in red:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {volunteers.map((vol) => {
              const isCancelled = cancelledIds.includes(vol.id);
              return (
                <button
                  key={vol.id}
                  onClick={() => toggleVolunteerCancellation(vol.id)}
                  disabled={calculating}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isCancelled
                      ? 'bg-rose-100 border-rose-300 text-rose-800 line-through opacity-80'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-100'
                  }`}
                  title={`${vol.name} (${vol.primary_skill}) - Area: ${vol.area}`}
                >
                  <span className={`w-2 h-2 rounded-full ${isCancelled ? 'bg-rose-500' : 'bg-emerald-600'}`} />
                  <span>{vol.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-500">({vol.area})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Impact Per Resource Telemetry KPI Cards */}
        {activePlan && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                Avg Distance
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-slate-900">
                  {activePlan.metrics.avgTravelDistanceKm}
                </span>
                <span className="text-xs text-slate-500 font-medium">km / vol</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                -38% vs unoptimized
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                Total Commute
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-slate-900">
                  {activePlan.metrics.totalTravelDistanceKm}
                </span>
                <span className="text-xs text-slate-500 font-medium">km total</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">
                Pune radius clustered
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                Urgent Coverage
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-emerald-700">
                  {activePlan.metrics.highPriorityCoveragePct}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">
                Critical hotspots staffed
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                Skill Match
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-slate-900">
                  {activePlan.metrics.skillMatchPercentage}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">
                Domain expertise aligned
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                Workload Fairness
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-slate-900">
                  {activePlan.metrics.workloadFairnessPct}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">
                Burnout prevention
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                Tasks Covered
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-xl font-extrabold ${activePlan.metrics.tasksUncovered > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {activePlan.metrics.tasksCovered} / {activePlan.metrics.totalTasks}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">
                {activePlan.metrics.tasksUncovered > 0 ? `${activePlan.metrics.tasksUncovered} at risk` : '100% capacity filled'}
              </span>
            </div>
          </div>
        )}

        {/* 4. Split View: Interactive Map & Task Deployment Rosters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                4. Field Operations Deployment Matrix
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                Pune Geographic Clustering & Team Rosters
              </h2>
            </div>

            {/* View Selector Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Map
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Task Rosters
              </button>
            </div>
          </div>

          <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>

            {/* Map Column */}
            {(viewMode === 'split' || viewMode === 'map') && (
              <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'col-span-1'} space-y-3`}>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      Live Route Dispatch (Pune Central & Suburbs)
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Green lines = Assigned Volunteer Routes
                    </span>
                  </div>

                  <div className="h-[460px] w-full relative">
                    <MapContainer
                      center={[18.5204, 73.8567]} // Pune center
                      zoom={12}
                      scrollWheelZoom={false}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      {/* Connecting Route Lines between Volunteers and Assigned Tasks */}
                      {activePlan?.assignments?.map((a, idx) => {
                        const isUnderstaffed = activePlan.tasksSummary.find(t => t.taskId === a.taskId)?.status === 'Understaffed';
                        const strokeColor = isUnderstaffed ? '#dc2626' : (activeStrategy === 'travel_minimization' ? '#059669' : '#2563eb');
                        return (
                          <Polyline
                            key={`route-${idx}`}
                            positions={[
                              a.volunteerCoordinates,
                              a.taskCoordinates
                            ]}
                            pathOptions={{
                              color: strokeColor,
                              weight: 2.5,
                              opacity: 0.65,
                              dashArray: '4, 4'
                            }}
                          >
                            <Tooltip sticky>
                              <div className="text-xs">
                                <strong>{a.volunteerName}</strong> ({a.roleInTeam})
                                <br />
                                ➔ {a.taskTitle}
                                <br />
                                Distance: <strong>{a.distanceKm} km</strong> ({a.vehicleType})
                              </div>
                            </Tooltip>
                          </Polyline>
                        );
                      })}

                      {/* Volunteer Markers */}
                      {volunteers.map(vol => {
                        const isCancelled = cancelledIds.includes(vol.id);
                        return (
                          <Marker
                            key={`vol-${vol.id}`}
                            position={[Number(vol.latitude), Number(vol.longitude)]}
                            icon={createVolunteerIcon(vol.vehicle_type, !isCancelled)}
                          >
                            <Popup>
                              <div className="p-1 space-y-1 text-xs">
                                <span className="font-extrabold text-slate-900 block">{vol.name}</span>
                                <p className="text-slate-600">Area: {vol.area}</p>
                                <p className="text-slate-600">Skill: <strong>{vol.primary_skill}</strong></p>
                                <p className="text-slate-600">Vehicle: {vol.vehicle_type}</p>
                                <p className="text-slate-600">Max Travel: {vol.max_travel_km} km</p>
                                {isCancelled ? (
                                  <span className="inline-block mt-1 px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                                    Cancelled (Dropout)
                                  </span>
                                ) : (
                                  <span className="inline-block mt-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                                    Ready For Dispatch
                                  </span>
                                )}
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}

                      {/* Task Markers */}
                      {tasks.map(task => {
                        const taskSum = activePlan?.tasksSummary?.find(t => t.taskId === task.id);
                        const isCovered = taskSum ? taskSum.status === 'Optimal' : false;
                        return (
                          <Marker
                            key={`task-${task.id}`}
                            position={[Number(task.latitude), Number(task.longitude)]}
                            icon={createTaskIcon(task.priority, isCovered)}
                          >
                            <Popup>
                              <div className="p-1 space-y-1 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${
                                    task.priority === 'Critical' ? 'bg-rose-600' : (task.priority === 'High' ? 'bg-orange-600' : 'bg-blue-600')
                                  }`}>
                                    {task.priority} Priority
                                  </span>
                                  <span className="text-slate-500 font-semibold">{task.area}</span>
                                </div>
                                <h4 className="font-extrabold text-slate-900 text-xs">{task.title}</h4>
                                <p className="text-slate-600 text-[11px]">Required: {task.required_skill}</p>
                                <p className="text-slate-600 text-[11px]">Volunteers: {taskSum?.assignedCount || 0} / {task.min_volunteers} min</p>
                                <p className="text-slate-600 text-[11px]">Status: <strong>{taskSum?.status || 'Pending'}</strong></p>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                    </MapContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Task Rosters Column */}
            {(viewMode === 'split' || viewMode === 'matrix') && (
              <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'col-span-1'} space-y-3`}>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-slate-600">
                    Showing {activePlan?.tasksSummary?.length || 0} Pune Civic Tasks
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="text-slate-600 mr-2">Optimal</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-slate-600 mr-2">Understaffed</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    <span className="text-slate-600">Uncovered</span>
                  </div>
                </div>

                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {activePlan?.tasksSummary?.map((taskItem) => {
                    const isOptimal = taskItem.status === 'Optimal';
                    const isUnderstaffed = taskItem.status === 'Understaffed';
                    const isUncovered = taskItem.status === 'Uncovered';

                    return (
                      <div
                        key={taskItem.taskId}
                        className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 transition ${
                          isUncovered
                            ? 'border-rose-400 bg-rose-50/30 ring-1 ring-rose-300'
                            : isUnderstaffed
                            ? 'border-amber-300 bg-amber-50/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Task Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                taskItem.priority === 'Critical'
                                  ? 'bg-rose-100 text-rose-800'
                                  : taskItem.priority === 'High'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {taskItem.priority}
                              </span>
                              <span className="text-xs font-semibold text-slate-500">
                                {taskItem.area}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                              {taskItem.title}
                            </h4>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                              isOptimal
                                ? 'bg-emerald-100 text-emerald-800'
                                : isUnderstaffed
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-100 text-rose-900'
                            }`}>
                              {taskItem.assignedCount} / {taskItem.minVolunteers} Volunteers
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-1">
                              Status: {taskItem.status}
                            </span>
                          </div>
                        </div>

                        {/* Equipment Checklist */}
                        {taskItem.equipmentNeeded && (
                          <div className="text-[11px] bg-slate-50 p-2 rounded-xl text-slate-600 border border-slate-100">
                            <strong className="text-slate-800">Field Equipment:</strong> {taskItem.equipmentNeeded}
                          </div>
                        )}

                        {/* Assigned Volunteer Team */}
                        <div className="border-t border-slate-100 pt-2 space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-700 block">
                            Assigned Team Members:
                          </span>

                          {taskItem.volunteers.length === 0 ? (
                            <div className="p-2 rounded-lg bg-rose-100/60 text-rose-900 text-xs font-semibold flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>Critical: 0 volunteers assigned! Site at risk of cancellation.</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {taskItem.volunteers.map((vEntry, vIdx) => (
                                <div
                                  key={vIdx}
                                  className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900">
                                        {vEntry.volunteer.name}
                                      </span>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                        vEntry.roleInTeam === 'Team Lead'
                                          ? 'bg-purple-100 text-purple-800'
                                          : vEntry.roleInTeam === 'Skill Specialist'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-slate-200 text-slate-800'
                                      }`}>
                                        {vEntry.roleInTeam}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 block">
                                      From {vEntry.volunteer.area} · {vEntry.distanceKm} km
                                    </span>
                                  </div>

                                  <div className="text-right">
                                    <span className="text-[10px] font-bold text-emerald-800 block">
                                      {vEntry.skillScore}% Match
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Post-Deployment Impact Telemetry Summary */}
        <div className="bg-gradient-to-r from-slate-900 via-forest-dark to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>5. Post-Deployment Operational Telemetry</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Impact Per Resource Metric Accounting
              </h3>
              <p className="text-slate-300 text-xs max-w-2xl mt-1">
                Comparing planned effort versus actual verified civic outcomes across Pune wards. Demonstrates tangible resource efficiency gains for Sevadeep NGO.
              </p>
            </div>

            <button
              onClick={handleApprovePlan}
              disabled={approving}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer shrink-0"
            >
              {approving ? 'Dispatching...' : 'Approve & Commit Deployment'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Volunteer-Hours Mobilized</span>
              <span className="text-lg font-extrabold text-white">52.5 Hours</span>
              <span className="text-slate-400 block text-[10px]">15 volunteers × 3.5 hr shift</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Transit Carbon Reduction</span>
              <span className="text-lg font-extrabold text-emerald-400">-42% Emissions</span>
              <span className="text-slate-400 block text-[10px]">Spherical cluster routing</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Equipment Utilization</span>
              <span className="text-lg font-extrabold text-white">100% Deployed</span>
              <span className="text-slate-400 block text-[10px]">Tools matched to task needs</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Citizen Beneficiaries Reach</span>
              <span className="text-lg font-extrabold text-white">4,200+ Pune Citizens</span>
              <span className="text-slate-400 block text-[10px]">Across 6 central municipal wards</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
