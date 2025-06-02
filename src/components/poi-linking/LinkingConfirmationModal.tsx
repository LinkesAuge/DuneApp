import React, { useState, useEffect, useMemo } from 'react';
import { X, AlertTriangle, Clock, Zap, Settings, Check, Info } from 'lucide-react';
import type { LinkCreationOptions } from '../../lib/linkingUtils';
import type { LinkingValidation } from '../../hooks/useLinkingState';

interface LinkingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: LinkCreationOptions) => void;
  selectedPoiIds: Set<string>;
  selectedItemIds: Set<string>;
  selectedSchematicIds: Set<string>;
  totalLinks: number;
  validation: LinkingValidation;
}

interface PerformanceEstimate {
  estimatedSeconds: number;
  estimatedBatches: number;
  performanceLevel: 'fast' | 'moderate' | 'slow' | 'very-slow';
  warnings: string[];
}

const LinkingConfirmationModal: React.FC<LinkingConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedPoiIds,
  selectedItemIds,
  selectedSchematicIds,
  totalLinks,
  validation
}) => {
  // Form state
  const [linkType, setLinkType] = useState<'found_here' | 'crafted_here' | 'required_for' | 'material_source'>('found_here');
  const [defaultQuantity, setDefaultQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [batchSize, setBatchSize] = useState(25);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Performance estimation
  const performanceEstimate = useMemo((): PerformanceEstimate => {
    const estimatedBatches = Math.ceil(totalLinks / batchSize);
    const baseProcessingTime = estimatedBatches * 0.5; // 500ms per batch average
    const duplicateCheckTime = (selectedPoiIds.size + selectedItemIds.size + selectedSchematicIds.size) * 0.01; // 10ms per entity
    const estimatedSeconds = baseProcessingTime + duplicateCheckTime + 0.5; // Add 500ms overhead

    const warnings: string[] = [];
    let performanceLevel: 'fast' | 'moderate' | 'slow' | 'very-slow' = 'fast';

    if (totalLinks > 500) {
      performanceLevel = 'very-slow';
      warnings.push('Large number of links may take significant time to process');
    } else if (totalLinks > 200) {
      performanceLevel = 'slow';
      warnings.push('Moderate processing time expected due to link count');
    } else if (totalLinks > 50) {
      performanceLevel = 'moderate';
    }

    if (selectedPoiIds.size > 20) {
      warnings.push('Large POI selection may impact performance');
    }

    if (selectedItemIds.size + selectedSchematicIds.size > 50) {
      warnings.push('Large item/schematic selection may impact performance');
    }

    return {
      estimatedSeconds,
      estimatedBatches,
      performanceLevel,
      warnings
    };
  }, [totalLinks, batchSize, selectedPoiIds.size, selectedItemIds.size, selectedSchematicIds.size]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLinkType('found_here');
      setDefaultQuantity(1);
      setNotes('');
      setBatchSize(25);
      setShowAdvanced(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    const options: LinkCreationOptions = {
      linkType,
      defaultQuantity,
      notes: notes.trim() || undefined,
      batchSize
    };

    onConfirm(options);
    onClose();
  };

  const getPerformanceColor = () => {
    switch (performanceEstimate.performanceLevel) {
      case 'fast': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'slow': return 'text-orange-400';
      case 'very-slow': return 'text-red-400';
    }
  };

  const getPerformanceIcon = () => {
    switch (performanceEstimate.performanceLevel) {
      case 'fast': return <Zap className="w-4 h-4" />;
      case 'moderate': return <Clock className="w-4 h-4" />;
      case 'slow': return <AlertTriangle className="w-4 h-4" />;
      case 'very-slow': return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-600/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-amber-600/10 border-b border-slate-600/20 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Check className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-amber-200" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Confirm Link Creation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Selection Summary */}
          <div className="bg-slate-800/50 border border-slate-600/20 p-4">
            <h3 className="text-lg font-semibold text-amber-200 mb-3">Selection Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-amber-600/10 border border-amber-600/20 p-3">
                <div className="text-2xl font-bold text-amber-200">{selectedPoiIds.size}</div>
                <div className="text-sm text-amber-300">POIs</div>
              </div>
              <div className="bg-blue-600/10 border border-blue-600/20 p-3">
                <div className="text-2xl font-bold text-blue-200">{selectedItemIds.size}</div>
                <div className="text-sm text-blue-300">Items</div>
              </div>
              <div className="bg-purple-600/10 border border-purple-600/20 p-3">
                <div className="text-2xl font-bold text-purple-200">{selectedSchematicIds.size}</div>
                <div className="text-sm text-purple-300">Schematics</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-xl font-bold text-slate-200">Total: {totalLinks} Links</div>
              <div className="text-sm text-slate-400">
                {selectedPoiIds.size} × {selectedItemIds.size + selectedSchematicIds.size} = {totalLinks} combinations
              </div>
            </div>
          </div>

          {/* Link Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-200">Link Configuration</h3>
            
            {/* Link Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Link Type
              </label>
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-600 text-slate-200 px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="found_here">Found Here</option>
                <option value="crafted_here">Crafted Here</option>
                <option value="required_for">Required For</option>
                <option value="material_source">Material Source</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">
                {linkType === 'found_here' && 'POIs where these items/schematics can be found'}
                {linkType === 'crafted_here' && 'POIs where these items/schematics can be crafted'}
                {linkType === 'required_for' && 'Items/schematics required for activities at these POIs'}
                {linkType === 'material_source' && 'POIs that provide materials for these items/schematics'}
              </p>
            </div>

            {/* Default Quantity */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Default Quantity
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={defaultQuantity}
                onChange={(e) => setDefaultQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-800 border border-slate-600 text-slate-200 px-3 py-2 focus:outline-none focus:border-amber-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Default quantity for all links (can be edited individually later)
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes that will apply to all links..."
                className="w-full bg-slate-800 border border-slate-600 text-slate-200 px-3 py-2 h-20 resize-none focus:outline-none focus:border-amber-500"
                maxLength={500}
              />
              <p className="text-xs text-slate-400 mt-1">
                {notes.length}/500 characters
              </p>
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Advanced Settings</span>
              </button>
              
              {showAdvanced && (
                <div className="mt-3 p-3 bg-slate-800/30 border border-slate-600/20">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Batch Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={batchSize}
                      onChange={(e) => setBatchSize(parseInt(e.target.value) || 25)}
                      className="w-full bg-slate-800 border border-slate-600 text-slate-200 px-3 py-2 focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Number of links to create per batch (affects performance)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Performance Estimate */}
          <div className="bg-slate-800/50 border border-slate-600/20 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className={getPerformanceColor()}>
                {getPerformanceIcon()}
              </span>
              <h3 className="text-lg font-semibold text-slate-200">Performance Estimate</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Estimated Time:</span>
                <span className={`ml-2 font-medium ${getPerformanceColor()}`}>
                  {performanceEstimate.estimatedSeconds < 1 
                    ? '< 1 second' 
                    : `~${Math.ceil(performanceEstimate.estimatedSeconds)} seconds`}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Batches:</span>
                <span className="ml-2 font-medium text-slate-200">
                  {performanceEstimate.estimatedBatches}
                </span>
              </div>
            </div>

            {performanceEstimate.warnings.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-600/20">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    {performanceEstimate.warnings.map((warning, index) => (
                      <p key={index} className="text-sm text-yellow-300">{warning}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Validation Errors */}
          {!validation.isValid && (
            <div className="bg-red-900/20 border border-red-600/30 p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  {validation.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-300">{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Validation Warnings */}
          {validation.warnings.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-600/30 p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <p key={index} className="text-sm text-yellow-300">{warning}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800/30 border-t border-slate-600/20 p-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={!validation.canCreateLinks}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              validation.canCreateLinks
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-amber-600/25'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            Confirm & Create {totalLinks} Links
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkingConfirmationModal; 