import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  type?: 'success' | 'error' | 'warning' | 'danger';
  variant?: 'info' | 'danger';
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type = 'success',
  variant = 'info',
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    if (type === 'success') return CheckCircle;
    if (type === 'warning' || variant === 'danger') return AlertCircle;
    return AlertCircle;
  };

  const getIconColor = () => {
    if (type === 'success') return 'text-green-400';
    if (type === 'warning' || variant === 'danger') return 'text-red-400';
    return 'text-red-400';
  };

  const getTitleColor = () => {
    if (type === 'success') return 'text-green-300';
    if (type === 'warning' || variant === 'danger') return 'text-red-300';
    return 'text-red-300';
  };

  const Icon = getIcon();
  const iconColor = getIconColor();
  const titleColor = getTitleColor();

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-slate-800 border border-amber-300/30 rounded-lg shadow-2xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 ${iconColor}`} />
            <h3 className={`text-lg font-light ${titleColor}`} style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-amber-300 hover:bg-amber-600/10 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <p className="text-slate-200 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
            {message}
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-600/50">
          {onConfirm ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-600 text-slate-200 rounded-lg hover:bg-slate-500 transition-colors font-light"
                style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
              >
                {cancelButtonText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  // Note: onClose() is intentionally NOT called here anymore
                  // The onConfirm function should handle modal closure if needed
                }}
                className={`px-4 py-2 rounded-lg transition-colors font-light ${
                  variant === 'danger' 
                    ? 'bg-red-600 text-white hover:bg-red-500' 
                    : 'bg-amber-600 text-slate-900 hover:bg-amber-500'
                }`}
                style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
              >
                {confirmButtonText}
              </button>
            </>
          ) : (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-600 text-slate-900 rounded-lg hover:bg-amber-500 transition-colors font-light"
            style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
          >
            OK
          </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}; 