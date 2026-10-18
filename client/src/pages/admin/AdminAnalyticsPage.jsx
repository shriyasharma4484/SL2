import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  Loader2,
  Download
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
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

const COLORS = ['#059669', '#0d9488', '#0284c7', '#8b5cf6', '#d97706', '#ef4444'];

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await adminService.getAnalytics();
        if (res.data.success) {
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
        <p>Generating real-time analytics from Sevadeep database records...</p>
      </div>
    );
  }

  const reportsPerMonth = analytics?.reports_per_month || [];
  const categories = analytics?.categories || [];
  const statuses = analytics?.status_distribution || [];
  const severities = analytics?.severity_distribution || [];
  const volunteers = analytics?.volunteers || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Real Database Metrics
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Impact & Resolution Analytics
          </h1>
          <p className="text-xs text-slate-500">
            All charts are computed directly from the MySQL relational tables. No mock data invented.
          </p>
        </div>
      </div>

      {/* Row 1: Monthly Trends & Open vs Resolved */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Reports Submitted vs Resolved Per Month</h3>
              <p className="text-xs text-slate-500">Historical trend across Pune reporting cycles</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportsPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month_label" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="total_submitted" name="Reports Filed" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved_count" name="Verified Resolved" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Workflow Status Ratios</h3>
            <p className="text-xs text-slate-500">Open vs Review vs In Progress vs Resolved</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statuses}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={30}
                  paddingAngle={3}
                >
                  {statuses.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={COLORS[index % COLORS.length]} />
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

      {/* Row 2: Categories and Severity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Issue Categories Breakdown</h3>
            <p className="text-xs text-slate-500">Breakdown of local civic grievances by sector</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={categories}>
                <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                <YAxis dataKey="category" type="category" width={140} fontSize={10} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" name="Reports" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Severity & Urgency Distribution</h3>
            <p className="text-xs text-slate-500">Critical vs High vs Medium vs Low priorities</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severities}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="severity" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" name="Report Count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Volunteer Leaderboard */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">
          Top Volunteer Champions (Civic Participation Rankings)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Volunteer</th>
                <th className="p-3">Pune Area</th>
                <th className="p-3 text-center">Cleanliness Drives Attended</th>
                <th className="p-3 text-center">Field Tasks Completed</th>
                <th className="p-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {volunteers.map((v, i) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-500">#{i + 1}</td>
                  <td className="p-3 font-bold text-slate-900">{v.name}</td>
                  <td className="p-3 text-slate-600">{v.area}</td>
                  <td className="p-3 text-center font-semibold text-teal-800">{v.drives_attended}</td>
                  <td className="p-3 text-center font-semibold text-blue-800">{v.assigned_tasks}</td>
                  <td className="p-3 text-right font-extrabold text-emerald-800">{v.points} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
