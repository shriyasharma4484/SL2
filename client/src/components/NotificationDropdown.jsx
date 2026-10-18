import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';

export default function NotificationDropdown({ onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-700" />
          <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 stroke-1 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.is_read && markAsRead(item.id)}
              className={`p-3.5 hover:bg-slate-50 transition-colors ${
                !item.is_read ? 'bg-emerald-50/40' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className={`text-xs font-semibold ${!item.is_read ? 'text-emerald-950 font-bold' : 'text-slate-800'}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {item.link && (
                      <Link
                        to={item.link}
                        onClick={onClose}
                        className="text-[11px] text-emerald-700 hover:underline flex items-center gap-0.5 font-medium ml-auto"
                      >
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
                {!item.is_read && (
                  <span className="h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0 mt-1"></span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
        <span className="text-[11px] text-slate-500">
          Sevadeep CivicConnect Real-time Alerts
        </span>
      </div>
    </div>
  );
}
