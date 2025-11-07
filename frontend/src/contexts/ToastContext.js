import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext deve ser usado dentro de ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const { toasts, hideToast, success, error, warning, info } = useToast();

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

