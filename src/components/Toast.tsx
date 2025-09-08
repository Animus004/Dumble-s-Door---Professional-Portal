import React, { useEffect, useState } from 'react';
import { ToastMessage, useToast } from '../hooks/useToast';
import clsx from 'clsx';

interface ToastProps {
  toast: ToastMessage;
}

const ICONS = {
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => removeToast(toast.id), 300);
    }, toast.duration || 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast, removeToast]);
  
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 300);
  }

  const baseClasses = 'w-full max-w-sm p-4 rounded-lg shadow-lg flex items-center space-x-4 transition-all duration-300 ease-in-out';
  const typeClasses = {
    success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  };
  const animationClasses = isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0';


  return (
    <div className={clsx(baseClasses, typeClasses[toast.type], animationClasses)} role="alert">
      <div className="flex-shrink-0">{ICONS[toast.type]}</div>
      <div className="flex-grow text-sm font-medium">{toast.message}</div>
      <button onClick={handleClose} className="p-1 rounded-full hover:bg-black hover:bg-opacity-10" aria-label="Dismiss">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
