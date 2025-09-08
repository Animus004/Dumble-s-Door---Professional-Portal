import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Notification } from '../types';
import clsx from 'clsx';
import Skeleton from './Skeleton';

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const NotificationItem: React.FC<{ notification: Notification; onRead: (id: string) => void }> = ({ notification, onRead }) => (
    <li
        onClick={() => onRead(notification.id)}
        className={clsx(
            "p-3 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer",
            { 'font-semibold': !notification.is_read }
        )}
    >
        {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" aria-label="Unread"></div>}
        <div className={clsx("flex-grow", { 'pl-5': notification.is_read })}>
            <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timeSince(notification.created_at)}</p>
        </div>
    </li>
);

const NotificationPanel: React.FC<{ onClose: () => void; }> = () => {
    const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

    return (
        <div 
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 border border-gray-200 dark:border-gray-700"
            aria-modal="true"
            role="dialog"
        >
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Notifications</h3>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                        Mark all as read
                    </button>
                )}
            </div>
            <ul className="p-2 space-y-1 max-h-96 overflow-y-auto">
                {isLoading ? (
                    Array.from({length: 3}).map((_, i) => <li key={i} className="p-3"><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-3 w-1/3" /></li>)
                ) : notifications.length === 0 ? (
                    <li className="text-center text-gray-500 dark:text-gray-400 p-8">You're all caught up!</li>
                ) : (
                    notifications.map(n => <NotificationItem key={n.id} notification={n} onRead={markAsRead} />)
                )}
            </ul>
        </div>
    );
};

export default NotificationPanel;