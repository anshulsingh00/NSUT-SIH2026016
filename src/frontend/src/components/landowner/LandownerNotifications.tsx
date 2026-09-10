import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  IndianRupee, 
  FileText,
  Calendar,
  Check
} from 'lucide-react';
import { NotificationType, NotificationItem } from '../../types';

export const LandownerNotifications: React.FC = () => {
  const { 
    notifications, 
    currentUser, 
    currentRole, 
    markAllNotificationsRead, 
    markNotificationRead,
    navigate
  } = useApp();

  // Filter notifications for current landowner
  const relevantNotifications = notifications.filter(n => {
    if (n.targetRole === 'ALL') return true;
    if (n.targetRole === currentRole) return true;
    if (currentUser?.id && n.targetUserId === currentUser.id) return true;
    return false;
  });

  const getLandownerRoute = (notification: NotificationItem) => {
    if (notification.type === 'COMPENSATION_UPDATE') {
      return '/landowner/compensation';
    }
    if (notification.type === 'VERIFICATION_COMPLETED') {
      return '/landowner/documents';
    }
    if (notification.parcelId) {
      return `/landowner/my-land/${notification.parcelId}`;
    }
    return '/landowner/dashboard';
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'ACTION_REQUIRED':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'VERIFICATION_COMPLETED':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'COMPENSATION_UPDATE':
        return <IndianRupee className="h-5 w-5 text-blue-500" />;
      case 'PROJECT_UPDATE':
        return <Info className="h-5 w-5 text-indigo-500" />;
      case 'SYSTEM_ALERT':
        return <Bell className="h-5 w-5 text-slate-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original string like "2 hours ago" or "Just now"
    }
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const unreadCount = relevantNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notices & Alerts</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Stay updated on your land acquisition status, compensation, and required actions.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllNotificationsRead}
            className="inline-flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-md shadow-sm transition-colors text-sm font-medium text-slate-700 dark:text-slate-200 shrink-0"
          >
            <Check className="h-4 w-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
        {relevantNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No notifications yet</h3>
            <p className="text-slate-500 dark:text-slate-400">
              When there are updates about your land or compensation, they will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {relevantNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 sm:p-5 transition-colors ${
                  notification.read 
                    ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50' 
                    : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
                onClick={() => !notification.read && markNotificationRead(notification.id)}
              >
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <div className={`p-2 rounded-full ${
                      notification.read 
                        ? 'bg-slate-100 dark:bg-slate-800' 
                        : 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700'
                    }`}>
                      {getIconForType(notification.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1">
                      <h4 className={`text-base font-medium ${
                        notification.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                      }`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formatDate(notification.timestamp)}
                      </div>
                    </div>
                    
                    <p className={`text-sm ${
                      notification.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {notification.message}
                    </p>
                    
                    <div className="mt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!notification.read) markNotificationRead(notification.id);
                          navigate(getLandownerRoute(notification));
                        }}
                        className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                      >
                        View Details &rarr;
                      </button>
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <div className="shrink-0 self-center hidden sm:block">
                      <div className="h-2.5 w-2.5 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandownerNotifications;
