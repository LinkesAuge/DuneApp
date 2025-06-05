import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, AlertCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
  autoCloseDelay?: number; // in milliseconds, default 3000
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoCloseDelay = 3000
}) => {
  // Auto-close after delay
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const Icon = isSuccess ? Check : AlertCircle;
  const bgColor = isSuccess ? 'bg-green-500/20' : 'bg-red-500/20';
  const borderColor = isSuccess ? 'border-green-500/50' : 'border-red-500/50';
  const textColor = isSuccess ? 'text-green-300' : 'text-red-300';
  const iconBgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]" onClick={onClose}>
      <div 
        className={`bg-slate-900 border ${borderColor} rounded-xl shadow-2xl w-full max-w-md p-6 ${bgColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon */}
        <div className="flex items-center space-x-4 mb-4">
          <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold ${textColor}`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {title}
            </h3>
            <p className="text-amber-200/80 text-sm mt-1">
              {message}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-amber-200 rounded-lg transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FeedbackModal; 