import React from 'react';
import { Check, AlertCircle, ArrowLeft } from 'lucide-react';

interface LinkingActionBarProps {
  canCreateLinks: boolean;
  isLinkingInProgress: boolean;
  totalLinks: number;
  onCreateLinks: () => void;
  onCancel?: () => void;
  className?: string;
}

const LinkingActionBar: React.FC<LinkingActionBarProps> = ({
  canCreateLinks,
  isLinkingInProgress,
  totalLinks,
  onCreateLinks,
  onCancel,
  className = ''
}) => {
  return (
    <div className={`bg-slate-900 border-t border-slate-700 px-6 py-4 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Status Message */}
        <div className="flex items-center space-x-2 text-sm">
          {!canCreateLinks ? (
            <>
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">
                Select at least one POI and one item or schematic to create links
              </span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">
                Ready to create <span className="font-medium text-amber-300">{totalLinks}</span> link{totalLinks !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isLinkingInProgress}
              className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
          
          <button
            onClick={onCreateLinks}
            disabled={!canCreateLinks || isLinkingInProgress}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              canCreateLinks && !isLinkingInProgress
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-amber-600/25 transform hover:scale-[1.02]'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLinkingInProgress ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Creating Links...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Create Links</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkingActionBar; 