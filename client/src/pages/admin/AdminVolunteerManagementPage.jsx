import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Users, Award, MapPin, Phone, Mail, CheckCircle, Clock, Loader2 } from 'lucide-react';

export default function AdminVolunteerManagementPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getVolunteers();
      if (res.data.success) {
        setVolunteers(res.data.volunteers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Field Force
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Volunteer Roster & Performance ({volunteers.length})
          </h1>
          <p className="text-xs text-slate-500">
            Registered volunteers, verified service hours, and on-site task assignments across Pune.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
          <span>Loading volunteer roster...</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Volunteer</th>
                  <th className="p-4">Neighborhood</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-center">Attended Drives</th>
                  <th className="p-4 text-center">Assigned Tasks</th>
                  <th className="p-4 text-right">Impact Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {volunteers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                          {v.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{v.name}</p>
                          <p className="text-[10px] text-slate-400">
                            Member since {new Date(v.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{v.area || 'Pune'}</span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-600">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{v.email}</span>
                        </p>
                        {v.phone && (
                          <p className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{v.phone}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-center font-bold text-slate-800">
                      <span className="inline-block bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200">
                        {v.attended_drives || 0}
                      </span>
                    </td>

                    <td className="p-4 text-center font-bold text-slate-800">
                      <span className="inline-block bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                        {v.completed_assignments || 0} / {v.total_assignments || 0}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <span className="font-extrabold text-sm text-emerald-800">
                        {v.points || 0} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
