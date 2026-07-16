import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications';
import { Bell, Check, Share2, Layers, Image, UserPlus, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG = {
  BOARD_SHARED:          { icon: Share2,    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  BOARD_UPDATED:         { icon: Layers,    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  TILE_ADDED:            { icon: Image,     color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20' },
  TILE_DELETED:          { icon: AlertCircle, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  INVITATION_RECEIVED:   { icon: UserPlus,  color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
  INVITATION_ACCEPTED:   { icon: Check,     color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
  SYSTEM:                { icon: Bell,      color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll().then((r) => r.data.data),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Close on outside click
  useEffect(() => {
    const handle = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      markReadMutation.mutate();
    }
  };

  const handleNotifClick = (notif) => {
    if (notif.link) {
      navigate(notif.link);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        id="notification-bell"
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="notif-dot animate-scale-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 card shadow-2xl z-50 border border-slate-200 dark:border-slate-700 animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">You're all caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No new notifications</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const { icon: Icon, color } = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
                return (
                  <button
                    key={notif._id}
                    onClick={() => handleNotifClick(notif)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                      !notif.isRead ? 'bg-primary-50/40 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${!notif.isRead ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
