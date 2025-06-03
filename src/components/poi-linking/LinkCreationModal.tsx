import React from 'react';
import { X, CheckCircle, AlertTriangle, Link2, ArrowRight } from 'lucide-react';

interface LinkPreview {
  poiId: string;
  entityId: string;
  poiTitle: string;
  entityName: string;
  exists: boolean;
}

interface LinkStats {
  newLinks: number;
  duplicates: number;
  totalAfter: number;
}

interface LinkCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  linkPreviews: LinkPreview[];
  linkStats: LinkStats;
  isProcessing: boolean;
}

const LinkCreationModal: React.FC<LinkCreationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  linkPreviews,
  linkStats,
  isProcessing
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link2 className="text-amber-400" size={24} />
              <h2 className="text-xl font-bold text-amber-200">Confirm Link Creation</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              disabled={isProcessing}
            >
              <X size={20} />
            </button>
          </div>

          {/* Statistics Summary */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{linkStats.newLinks}</div>
              <div className="text-sm text-slate-300">New Links</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">{linkStats.duplicates}</div>
              <div className="text-sm text-slate-300">Duplicates Skipped</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">{linkStats.totalAfter}</div>
              <div className="text-sm text-slate-300">Total Links After</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {linkPreviews.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
              <h3 className="text-lg font-semibold mb-2">No Links to Create</h3>
              <p>Please select POIs and Entities to create links.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-200 mb-4">
                Link Preview ({linkPreviews.length} total)
              </h3>
              
              <div className="grid gap-3">
                {linkPreviews.map((link, index) => (
                  <div 
                    key={`${link.poiId}-${link.entityId}`}
                    className={`p-3 rounded-lg border flex items-center justify-between transition-all
                      ${link.exists 
                        ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-200' 
                        : 'bg-green-900/20 border-green-500/30 text-green-200'
                      }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-1">
                        <div className="font-medium">{link.poiTitle}</div>
                        <div className="text-xs opacity-75">POI</div>
                      </div>
                      
                      <ArrowRight size={16} className="text-slate-400" />
                      
                      <div className="flex-1">
                        <div className="font-medium">{link.entityName}</div>
                        <div className="text-xs opacity-75">Entity</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {link.exists ? (
                        <>
                          <AlertTriangle size={16} className="text-yellow-500" />
                          <span className="text-xs font-medium">EXISTS</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="text-green-500" />
                          <span className="text-xs font-medium">NEW</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {linkStats.duplicates > 0 && (
                <div className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-yellow-200">
                    <AlertTriangle size={16} />
                    <span className="font-medium">Duplicate Links Detected</span>
                  </div>
                  <p className="text-sm text-yellow-200/80 mt-1">
                    {linkStats.duplicates} link(s) already exist and will be skipped.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-600 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {linkStats.newLinks > 0 
              ? `Ready to create ${linkStats.newLinks} new link${linkStats.newLinks !== 1 ? 's' : ''}`
              : 'No new links to create'
            }
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            
            <button
              onClick={onConfirm}
              disabled={linkStats.newLinks === 0 || isProcessing}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Links...</span>
                </>
              ) : (
                <>
                  <Link2 size={16} />
                  <span>Create {linkStats.newLinks} Link{linkStats.newLinks !== 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkCreationModal; 