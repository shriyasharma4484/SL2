import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import {
  Inbox,
  Clock,
  CheckCircle2,
  Users,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers,
  Shield,
  Loader2,
  Leaf
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#059669', '#0d9488', '#0284c7', '#8b5cf6', '#d97706', '#64748b'];

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [overviewRes, analyticsRes] = await Promise.all([
          adminService.getOverview(),
          adminService.getAnalytics()
        ]);

        if (overviewRes.data.success) {
          setData(overviewRes.data);
        }
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.analytics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
        <p>Loading Sevadeep coordinator administration console...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const incoming = data?.incoming_reports || [];
  const audits = data?.recent_audits || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
            Pune Central Coordination Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Coordinator Overview & Triage Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time telemetry and management controls for Sevadeep NGO, Pune.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/incoming"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Inbox className="w-4 h-4" />
            <span>Review Incoming Reports ({stats.pending_review || 0})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Pending Review */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Triage Needed</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.pending_review || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Submitted or under review</p>
          <div className="h-1 bg-amber-400 absolute bottom-0 left-0 right-0"></div>
        </div>

        {/* Card 2: Active / In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Active Action</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.in_progress || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Volunteer squads on site</p>
          <div className="h-1 bg-blue-500 absolute bottom-0 left-0 right-0"></div>
        </div>

        {/* Card 3: Resolved */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Verified Resolved</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.resolved || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Confirmed with photos & citizen</p>
          <div className="h-1 bg-emerald-600 absolute bottom-0 left-0 right-0"></div>
        </div>

        {/* Card 4: Total Volunteers */}
        <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Volunteers</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.total_volunteers || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Enrolled grassroots members</p>
          <div className="h-1 bg-teal-500 absolute bottom-0 left-0 right-0"></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Reports Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Monthly Civic Grievance Volume</h3>
              <p className="text-[11px] text-slate-500">Submitted vs Resolved tickets per month</p>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Actual DB Records
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.reports_per_month || []}>
                <XAxis dataKey="month_label" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="total_submitted" name="Submitted" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved_count" name="Resolved" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue Categories Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Reports by Category</h3>
            <p className="text-[11px] text-slate-500">Distribution across 6 civic domains</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categories || []}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={35}
                  paddingAngle={3}
                >
                  {analytics?.categories?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Incoming Triage Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Incoming Reports Needing Coordinator Action
            </h3>
            <p className="text-xs text-slate-500">
              Submitted issues awaiting approval, assignment, or municipal escalation
            </p>
          </div>
          <Link
            to="/admin/incoming"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>Open Triage Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {incoming.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No pending reports in inbox! All reports have been evaluated.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Reference No</th>
                  <th className="p-3">Problem Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incoming.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-emerald-800">{rep.reference_no}</td>
                    <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">{rep.title}</td>
                    <td className="p-3">
                      <CategoryBadge category={rep.category} />
                    </td>
                    <td className="p-3 text-slate-600 truncate max-w-[150px]">{rep.location_address}</td>
                    <td className="p-3">
                      <StatusBadge status={rep.status} />
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/issues/${rep.id}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Audit Trail Stream */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">
          Recent Coordinator & System Audit Logs
        </h3>
        <div className="divide-y divide-slate-100 text-xs">
          {audits.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {log.action}
                </span>
                <span className="text-slate-800">{log.details}</span>
              </div>
              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
