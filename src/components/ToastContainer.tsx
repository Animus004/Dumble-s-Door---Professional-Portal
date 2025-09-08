import React from 'react';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div 
        className="fixed bottom-4 right-4 z-50 space-y-3 w-full max-w-sm"
        role="status"
        aria-live="polite"
        aria-atomic="true"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
