'use client';

import { useToast } from '@/app/context/ToastContext';

/**
 * Toast Display Component
 * Renders all active toasts in a fixed position
 * Place this in your root layout or a wrapper component
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getStyles = (type: string) => {
    const base = 'flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border-2 font-semibold text-sm';

    switch (type) {
      case 'success':
        return `${base} bg-green-50 border-green-300 text-green-700`;
      case 'error':
        return `${base} bg-red-50 border-red-300 text-red-700`;
      case 'warning':
        return `${base} bg-yellow-50 border-yellow-300 text-yellow-700`;
      case 'info':
        return `${base} bg-blue-50 border-blue-300 text-blue-700`;
      default:
        return base;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '';
      case 'error':
        return '';
      case 'warning':
        return '';
      case 'info':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-md pointer-events-auto">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${getStyles(toast.type)} animate-in slide-in-from-right-5 fade-in`}
          role="alert"
        >
          <span className="text-lg flex-shrink-0">{getIcon(toast.type)}</span>
          <span className="flex-1 break-words">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-lg hover:opacity-70 transition ml-2"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
