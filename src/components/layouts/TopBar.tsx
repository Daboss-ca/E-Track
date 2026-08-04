// src/components/layouts/TopHeader.tsx
import React, { useState } from 'react';
import { Search, Bell, HelpCircle, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { NotificationItem } from '../../types/app';

interface TopHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({
  searchValue,
  onSearchChange,
  notifications,
  onMarkAllRead,
}) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-6 py-3.5">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search requests, tracking codes, departments..."
          className="w-full rounded-full bg-[#EAECEF] py-2.5 pl-9 pr-4 text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
      </div>

      <div className="flex-1" />

      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Help"
      >
        <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowNotifications((s) => !s)}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <p className="text-[13px] font-semibold text-gray-800">Notifications</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="text-[11.5px] font-medium text-emerald-600 hover:underline"
                >
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-300 hover:text-gray-500"
                  aria-label="Close notifications"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-[12.5px] text-gray-400">You're all caught up</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`border-b border-gray-50 px-4 py-3 last:border-0 ${!n.read ? 'bg-emerald-50/30' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12.5px] font-medium text-gray-800">{n.title}</p>
                      {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />}
                    </div>
                    <p className="mt-0.5 text-[12px] text-gray-500">{n.message}</p>
                    <p className="mt-1 text-[11px] text-gray-400">{n.timestamp}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-[12px] font-semibold text-white">
        {initials}
      </div>
    </header>
  );
};

export default TopHeader;