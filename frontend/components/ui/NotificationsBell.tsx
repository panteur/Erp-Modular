'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { notificationsAPI } from '@/lib/api';

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await notificationsAPI.getMine();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {}
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, [load]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAll = async () => {
    try { await notificationsAPI.markAllAsRead(); setUnreadCount(0); setNotifications(prev => prev.map(n => ({ ...n, is_read: true }))); } catch {}
  };

  const markOne = async (id: number) => {
    try { await notificationsAPI.markAsRead(id); setUnreadCount(prev => Math.max(0, prev - 1)); setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n)); } catch {}
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
        aria-label="Notificaciones"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-modal border border-slate-200 z-50 max-h-[70vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-slate-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <button onClick={markAll} className="text-xs font-medium text-accent-600 hover:text-accent-700 transition-colors">
                Marcar todas leídas
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="text-center text-slate-400 py-10 text-sm">Sin notificaciones</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markOne(n.id)}
                  className={`px-5 py-4 border-b border-slate-50 cursor-pointer transition-all duration-150 ${n.is_read ? 'opacity-60 hover:bg-slate-50' : 'bg-accent-50/40 hover:bg-accent-50'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">{n.icon || '🔔'}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.is_read ? 'text-slate-500' : 'text-slate-900 font-semibold'}`}>{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                        {new Date(n.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-accent-500 shrink-0 mt-2" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
