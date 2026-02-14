'use client';

import React, { useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  icon?: React.ReactNode;
}

/**
 * Reusable Confirmation Modal Component
 * Used for delete confirmations, destructive actions, and user confirmations
 * 
 * @example
 * const [showConfirm, setShowConfirm] = useState(false);
 * 
 * <ConfirmationModal
 *   isOpen={showConfirm}
 *   title="Delete User"
 *   message="Are you sure you want to delete this user? This action cannot be undone."
 *   confirmText="Delete"
 *   cancelText="Cancel"
 *   isDangerous={true}
 *   onConfirm={() => handleDelete()}
 *   onCancel={() => setShowConfirm(false)}
 *   icon="⚠️"
 * />
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
  icon,
}) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmButtonColor = isDangerous
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white';

  const confirmButtonDisabledColor = isDangerous
    ? 'bg-red-400 text-white'
    : 'bg-blue-400 text-white';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
        onClick={onCancel}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-200 scale-100 opacity-100"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            {icon && (
              <span className="text-3xl flex-shrink-0">{icon}</span>
            )}
            <h2
              id="modal-title"
              className={`text-lg font-bold ${
                isDangerous ? 'text-red-700' : 'text-gray-900'
              }`}
            >
              {title}
            </h2>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isLoading ? confirmButtonDisabledColor : confirmButtonColor
              }`}
              type="button"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;
