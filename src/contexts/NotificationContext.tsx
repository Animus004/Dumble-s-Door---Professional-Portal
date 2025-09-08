import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Notification } from '../types';
import * as ApiService from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { supabase } from '../supabaseClient';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await ApiService.getNotificationsForUser(user.auth_user_id);
    if (error) {
      addToast('Failed to load notifications', 'error');
    } else if (data) {
      setNotifications(data as Notification[]);
    }
    setIsLoading(false);
  }, [user, addToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    // Listen for real-time notifications via Supabase Realtime
    const channel = supabase
      .channel(`public:notifications:user_id=eq.${user.auth_user_id}`)
      .on<Notification>(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.auth_user_id}`
        },
        (payload) => {
          const newNotification = payload.new;
          setNotifications(prev => [newNotification, ...prev]);
          addToast("You have a new notification!", 'success');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, addToast]);

  const markAsRead = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.is_read) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
        await ApiService.markNotificationAsRead(notificationId);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount > 0 && user) {
        setNotifications(prev => prev.map(n => ({...n, is_read: true})));
        await ApiService.markAllNotificationsAsRead(user.auth_user_id);
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
