import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Settings, Shield, Clock, Search, Filter, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('All');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs();
      if (res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filterAction === 'All'
    ? logs
    : logs.filter((l) => l.action.toLowerCase().includes(filterAction.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-200 px-2.5 py-0.5 rounded-full">
            Security & Accountability
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            System Settings & Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Immutable log of all coordinator decisions, status transitions, and user actions.
          </p>
        </div>
      </div>

      {/* System Configuration Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Settings className="w-4 h-4 text-emerald-700" />
          <span>Platform Operational Configuration</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800">Public Visibility Policy</span>
            <p className="text-slate-600">Requires coordinator approval prior to public map indexing.</p>
            <span className="inline-block mt-2 font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              ENFORCED
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800">Municipal Escalation</span>
            <p className="text-slate-600">Pune Municipal Corporation (PMC) ward referral tracking.</p>
            <span className="inline-block mt-2 font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
              ACTIVE (Ward 7 / Zone 3)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800">Relational Database Engine</span>
            <p className="text-slate-600">MySQL Server 8.0 on localhost:3306 (utf8mb4).</p>
            <span className="inline-block mt-2 font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
              CONNECTED
            </span>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Immutable Audit Trail</h3>
            <p className="text-[11px] text-slate-500">Chronological history of security and workflow actions</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 outline-hidden bg-white"
            >
              <option value="All">All Audit Events</option>
              <option value="REPORT">Report Events</option>
              <option value="STATUS">Status Updates</option>
              <option value="EVENT">Activity Registrations</option>
              <option value="USER">User Registrations</option>
              <option value="COMMENT">Moderation Events</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            <span>Loading audit records...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No audit records match the filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800 text-[11px]">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-900">
                      {log.user_name || 'System / Guest'}
                    </td>
                    <td className="p-3 text-slate-600">
                      {log.target_type} #{log.target_id || ''}
                    </td>
                    <td className="p-3 text-slate-700 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
