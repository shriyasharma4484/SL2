import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { MessageSquare, EyeOff, Eye, Shield, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminModerationPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await adminService.getComments();
      if (res.data.success) {
        setComments(res.data.comments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHide = async (comment) => {
    const shouldHide = !comment.is_hidden;
    const reason = shouldHide
      ? prompt('Enter moderation reason for hiding comment:', 'Violates community respectful speech standards.')
      : 'Restored by coordinator';

    if (shouldHide && !reason) return;

    try {
      const res = await adminService.moderateComment(comment.id, {
        is_hidden: shouldHide,
        moderation_reason: reason
      });
      if (res.data.success) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === comment.id
              ? { ...c, is_hidden: shouldHide, moderation_reason: reason }
              : c
          )
        );
      }
    } catch (e) {
      alert('Failed to update comment moderation status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wider bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            Content Safety
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Comments & Evidence Moderation Console
          </h1>
          <p className="text-xs text-slate-500">
            Moderate abusive, off-topic, or private contact leaks from public community reports.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
          <span>Loading comments for moderation...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          No comments in database yet.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Author</th>
                  <th className="p-4">Report Ref</th>
                  <th className="p-4">Comment Content</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderator Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comments.map((cm) => (
                  <tr key={cm.id} className={cm.is_hidden ? 'bg-rose-50/40' : 'hover:bg-slate-50'}>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{cm.user_name}</p>
                      <p className="text-[10px] text-slate-400">{cm.user_email}</p>
                    </td>

                    <td className="p-4">
                      <span className="font-mono font-bold text-emerald-800 text-[11px]">
                        {cm.reference_no}
                      </span>
                    </td>

                    <td className="p-4 max-w-md">
                      <p className={`text-xs ${cm.is_hidden ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {cm.comment_text}
                      </p>
                      {cm.is_hidden && (
                        <p className="text-[10px] text-rose-600 mt-1 italic">
                          Reason: {cm.moderation_reason}
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        cm.is_hidden ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {cm.is_hidden ? 'Hidden' : 'Public'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleHide(cm)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          cm.is_hidden
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {cm.is_hidden ? 'Restore' : 'Hide / Moderate'}
                      </button>
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
