import toast from 'react-hot-toast';

/**
 * Global Toast Notification Utility
 * Provides consistent toast notifications across the app
 */

export const notificationToast = {
  /**
   * Show success notification
   */
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'bottom-right',
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '600',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      icon: '✅',
    });
  },

  /**
   * Show error notification
   */
  error: (message: string) => {
    toast.error(message, {
      duration: 3000,
      position: 'bottom-right',
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: '600',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      icon: '❌',
    });
  },

  /**
   * Show warning notification
   */
  warning: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'bottom-right',
      style: {
        background: '#f59e0b',
        color: '#fff',
        fontWeight: '600',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      icon: '⚠️',
    });
  },

  /**
   * Show info notification
   */
  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'bottom-right',
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: '600',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      icon: 'ℹ️',
    });
  },

  /**
   * Show loading notification (returns toast ID for updates)
   */
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'bottom-right',
      style: {
        background: '#6366f1',
        color: '#fff',
        fontWeight: '600',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    });
  },

  /**
   * Update an existing toast (useful for loading -> success/error)
   */
  update: (toastId: string, options: any) => {
    toast.remove(toastId);
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.removeAll();
  },
};

export default notificationToast;
