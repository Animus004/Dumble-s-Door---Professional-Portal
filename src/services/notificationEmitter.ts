import { Notification } from '../types';

type Listener = (data: Notification) => void;
const listeners: Listener[] = [];

export const notificationEmitter = {
  subscribe: (listener: Listener): (() => void) => {
    listeners.push(listener);
    // Return an unsubscribe function
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  },
  emit: (data: Notification) => {
    listeners.forEach(listener => listener(data));
  },
};