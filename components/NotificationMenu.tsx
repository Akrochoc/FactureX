
import React from 'react';
import { Notification } from '../types';

interface NotificationMenuProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-sm dark:text-white">Notifications</h3>
        {unread.length > 0 && (
          <button 
            onClick={onMarkAllAsRead}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 uppercase tracking-tight"
          >
            Tout marquer lu
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-xs text-slate-400 font-medium">Aucune notification pour le moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {/* Notifications non lues */}
            {unread.map(n => (
              <NotificationItem key={n.id} notification={n} onClick={() => onMarkAsRead(n.id)} />
            ))}
            
            {/* Séparateur si mélange lu/non-lu */}
            {unread.length > 0 && read.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Précédentes</p>
              </div>
            )}

            {/* Notifications lues */}
            {read.map(n => (
              <NotificationItem key={n.id} notification={n} onClick={() => onMarkAsRead(n.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationItem: React.FC<{ notification: Notification; onClick: () => void }> = ({ notification, onClick }) => {
  const colors = {
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  return (
    <div 
      onClick={onClick}
      className={`p-4 flex gap-3 transition-colors group cursor-pointer ${
        notification.read 
          ? 'opacity-60 grayscale-[0.5] hover:opacity-80' 
          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colors[notification.type]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <p className="text-xs font-bold dark:text-white truncate pr-2">{notification.title}</p>
          <span className="text-[9px] text-slate-400 whitespace-nowrap">{new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {notification.description}
        </p>
      </div>
    </div>
  );
};

export default NotificationMenu;
