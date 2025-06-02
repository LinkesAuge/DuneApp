import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  X, 
  Download, 
  Copy, 
  BarChart3, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Trash2
} from 'lucide-react';
import type { LinkingStats, LinkingValidation } from '../../hooks/useLinkingState';

interface SelectionSummaryProps {
  selectedPois: number;
  selectedItems: number;
  selectedSchematics: number;
  totalLinks: number;
  validation: LinkingValidation;
  onClearAll: () => void;
  showClearButton?: boolean;
  className?: string;
  
  // Enhanced props for detailed analytics
  selectedPoiIds?: Set<string>;
  selectedItemIds?: Set<string>;
  selectedSchematicIds?: Set<string>;
  
  // Optional data for entity names and analytics
  poisData?: Array<{ id: string; title: string; poi_type?: { name: string; category?: { name: string } } }>;
  itemsData?: Array<{ id: string; name: string; category?: { name: string }; type?: { name: string } }>;
  schematicsData?: Array<{ id: string; name: string; category?: { name: string }; type?: { name: string } }>;
  
  // Export and sharing functionality
  onExportSelection?: () => void;
  onShareSelection?: () => void;
}

interface SelectionAnalytics {
  poiCategories: Record<string, number>;
  poiTypes: Record<string, number>;
  itemCategories: Record<string, number>;
  itemTypes: Record<string, number>;
  schematicCategories: Record<string, number>;
  schematicTypes: Record<string, number>;
  estimatedTime: {
    seconds: number;
    display: string;
  };
  performanceLevel: 'fast' | 'moderate' | 'slow' | 'very-slow';
}

const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  selectedPois,
  selectedItems,
  selectedSchematics,
  totalLinks,
  validation,
  onClearAll,
  showClearButton = true,
  className = '',
  selectedPoiIds = new Set(),
  selectedItemIds = new Set(),
  selectedSchematicIds = new Set(),
  poisData = [],
  itemsData = [],
  schematicsData = [],
  onExportSelection,
  onShareSelection
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Calculate analytics
  const analytics: SelectionAnalytics = useMemo(() => {
    const poiCategories: Record<string, number> = {};
    const poiTypes: Record<string, number> = {};
    const itemCategories: Record<string, number> = {};
    const itemTypes: Record<string, number> = {};
    const schematicCategories: Record<string, number> = {};
    const schematicTypes: Record<string, number> = {};

    // Analyze selected POIs
    poisData
      .filter(poi => selectedPoiIds.has(poi.id))
      .forEach(poi => {
        const category = poi.poi_type?.category?.name || 'Unknown';
        const type = poi.poi_type?.name || 'Unknown';
        poiCategories[category] = (poiCategories[category] || 0) + 1;
        poiTypes[type] = (poiTypes[type] || 0) + 1;
      });

    // Analyze selected items
    itemsData
      .filter(item => selectedItemIds.has(item.id))
      .forEach(item => {
        const category = item.category?.name || 'Unknown';
        const type = item.type?.name || 'Unknown';
        itemCategories[category] = (itemCategories[category] || 0) + 1;
        itemTypes[type] = (itemTypes[type] || 0) + 1;
      });

    // Analyze selected schematics
    schematicsData
      .filter(schematic => selectedSchematicIds.has(schematic.id))
      .forEach(schematic => {
        const category = schematic.category?.name || 'Unknown';
        const type = schematic.type?.name || 'Unknown';
        schematicCategories[category] = (schematicCategories[category] || 0) + 1;
        schematicTypes[type] = (schematicTypes[type] || 0) + 1;
      });

    // Estimate creation time (rough calculation based on total links)
    const baseTimePerLink = 0.05; // 50ms per link
    const batchOverhead = Math.ceil(totalLinks / 25) * 0.2; // 200ms per batch
    const totalSeconds = (totalLinks * baseTimePerLink) + batchOverhead;
    
    const estimatedTime = {
      seconds: totalSeconds,
      display: totalSeconds < 1 
        ? '< 1 second'
        : totalSeconds < 60 
          ? `${Math.ceil(totalSeconds)} second${Math.ceil(totalSeconds) > 1 ? 's' : ''}`
          : `${Math.ceil(totalSeconds / 60)} minute${Math.ceil(totalSeconds / 60) > 1 ? 's' : ''}`
    };

    // Determine performance level
    let performanceLevel: SelectionAnalytics['performanceLevel'] = 'fast';
    if (totalLinks > 500) performanceLevel = 'very-slow';
    else if (totalLinks > 200) performanceLevel = 'slow';
    else if (totalLinks > 50) performanceLevel = 'moderate';

    return {
      poiCategories,
      poiTypes,
      itemCategories,
      itemTypes,
      schematicCategories,
      schematicTypes,
      estimatedTime,
      performanceLevel
    };
  }, [selectedPoiIds, selectedItemIds, selectedSchematicIds, poisData, itemsData, schematicsData, totalLinks]);

  const hasSelections = selectedPois > 0 || selectedItems > 0 || selectedSchematics > 0;

  const getValidationIcon = () => {
    if (!validation.isValid) {
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
    if (validation.warnings.length > 0) {
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };

  const getPerformanceColor = () => {
    switch (analytics.performanceLevel) {
      case 'fast': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'slow': return 'text-orange-400';
      case 'very-slow': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const handleClearAll = () => {
    if (confirmClear) {
      onClearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const handleExportSelection = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      selections: {
        pois: Array.from(selectedPoiIds),
        items: Array.from(selectedItemIds),
        schematics: Array.from(selectedSchematicIds)
      },
      analytics,
      totalLinks,
      validation
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poi-linking-selection-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onExportSelection?.();
  };

  const handleCopyUrl = async () => {
    const params = new URLSearchParams();
    if (selectedPoiIds.size > 0) params.set('poi_ids', Array.from(selectedPoiIds).join(','));
    if (selectedItemIds.size > 0) params.set('item_ids', Array.from(selectedItemIds).join(','));
    if (selectedSchematicIds.size > 0) params.set('schematic_ids', Array.from(selectedSchematicIds).join(','));
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }

    onShareSelection?.();
  };

  const renderCategoryBreakdown = (categories: Record<string, number>, title: string, color: string) => (
    <div className="space-y-1">
      <h5 className={`text-xs font-medium ${color}`}>{title}</h5>
      <div className="space-y-0.5">
        {Object.entries(categories)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([category, count]) => (
            <div key={category} className="flex justify-between text-xs">
              <span className="text-slate-400 truncate">{category}</span>
              <span className="text-slate-300 ml-2">{count}</span>
            </div>
          ))}
        {Object.keys(categories).length > 3 && (
          <div className="text-xs text-slate-500">
            +{Object.keys(categories).length - 3} more categories
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`bg-slate-800 border border-slate-600 rounded-lg ${className}`}>
      {/* Main Summary Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          {/* Validation Status */}
          <div className="flex items-center space-x-2">
            {getValidationIcon()}
            <span className="text-sm font-medium text-slate-200">
              {validation.canCreateLinks ? 'Ready to Create Links' : 'Selection Incomplete'}
            </span>
          </div>

          {/* Selection Counts */}
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-slate-400">POIs:</span>
              <span className="text-amber-300 font-medium">{selectedPois}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-slate-400">Items:</span>
              <span className="text-blue-300 font-medium">{selectedItems}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-slate-400">Schematics:</span>
              <span className="text-purple-300 font-medium">{selectedSchematics}</span>
            </div>
          </div>

          {/* Total Links with Performance Indicator */}
          {totalLinks > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-700 rounded-lg">
              <span className="text-slate-400">Total Links:</span>
              <span className="text-amber-200 font-bold">{totalLinks}</span>
              <Clock className={`w-3 h-3 ${getPerformanceColor()}`} />
              <span className={`text-xs ${getPerformanceColor()}`}>
                {analytics.estimatedTime.display}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {hasSelections && (
            <>
              <button
                onClick={handleCopyUrl}
                className="flex items-center space-x-1 px-3 py-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                title="Copy shareable URL"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>

              {onExportSelection && (
                <button
                  onClick={handleExportSelection}
                  className="flex items-center space-x-1 px-3 py-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Export selection data"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Export</span>
                </button>
              )}

              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
                  showAnalytics 
                    ? 'bg-violet-600 text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Analytics</span>
              </button>

              {showClearButton && (
                <button
                  onClick={handleClearAll}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
                    confirmClear
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:text-red-300 hover:bg-slate-700'
                  }`}
                  title={confirmClear ? 'Click again to confirm' : 'Clear all selections'}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">
                    {confirmClear ? 'Confirm Clear' : 'Clear All'}
                  </span>
                </button>
              )}
            </>
          )}

          {hasSelections && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 px-3 py-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span className="text-sm">Details</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Validation Messages */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="px-4 pb-2">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center space-x-2 text-red-300 text-sm mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{error}</span>
            </div>
          ))}
          {validation.warnings.map((warning, index) => (
            <div key={index} className="flex items-center space-x-2 text-yellow-300 text-sm mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Section */}
      {showAnalytics && hasSelections && (
        <div className="border-t border-slate-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* POI Analytics */}
            {selectedPois > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-amber-300 flex items-center space-x-2">
                  <span>POI Breakdown</span>
                  <span className="text-xs text-slate-400">({selectedPois} selected)</span>
                </h4>
                {renderCategoryBreakdown(analytics.poiCategories, 'Top Categories', 'text-amber-400')}
                {renderCategoryBreakdown(analytics.poiTypes, 'Top Types', 'text-amber-400')}
              </div>
            )}

            {/* Item Analytics */}
            {selectedItems > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-blue-300 flex items-center space-x-2">
                  <span>Item Breakdown</span>
                  <span className="text-xs text-slate-400">({selectedItems} selected)</span>
                </h4>
                {renderCategoryBreakdown(analytics.itemCategories, 'Top Categories', 'text-blue-400')}
                {renderCategoryBreakdown(analytics.itemTypes, 'Top Types', 'text-blue-400')}
              </div>
            )}

            {/* Schematic Analytics */}
            {selectedSchematics > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-purple-300 flex items-center space-x-2">
                  <span>Schematic Breakdown</span>
                  <span className="text-xs text-slate-400">({selectedSchematics} selected)</span>
                </h4>
                {renderCategoryBreakdown(analytics.schematicCategories, 'Top Categories', 'text-purple-400')}
                {renderCategoryBreakdown(analytics.schematicTypes, 'Top Types', 'text-purple-400')}
              </div>
            )}
          </div>

          {/* Performance Impact */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className={`w-4 h-4 ${getPerformanceColor()}`} />
                <span className="text-sm text-slate-300">Estimated Creation Time:</span>
                <span className={`text-sm font-medium ${getPerformanceColor()}`}>
                  {analytics.estimatedTime.display}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {totalLinks} links in ~{Math.ceil(totalLinks / 25)} batches
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Selection List */}
      {isExpanded && hasSelections && (
        <div className="border-t border-slate-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
            {/* Selected POIs */}
            {selectedPois > 0 && (
              <div>
                <h4 className="text-sm font-medium text-amber-300 mb-2">Selected POIs ({selectedPois})</h4>
                <div className="space-y-1">
                  {poisData
                    .filter(poi => selectedPoiIds.has(poi.id))
                    .slice(0, 10)
                    .map(poi => (
                      <div key={poi.id} className="text-xs text-slate-400 truncate">
                        {poi.title}
                        {poi.poi_type?.name && (
                          <span className="text-slate-500 ml-2">({poi.poi_type.name})</span>
                        )}
                      </div>
                    ))}
                  {selectedPois > 10 && (
                    <div className="text-xs text-slate-500">
                      +{selectedPois - 10} more POIs
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Items */}
            {selectedItems > 0 && (
              <div>
                <h4 className="text-sm font-medium text-blue-300 mb-2">Selected Items ({selectedItems})</h4>
                <div className="space-y-1">
                  {itemsData
                    .filter(item => selectedItemIds.has(item.id))
                    .slice(0, 10)
                    .map(item => (
                      <div key={item.id} className="text-xs text-slate-400 truncate">
                        {item.name}
                        {item.category?.name && (
                          <span className="text-slate-500 ml-2">({item.category.name})</span>
                        )}
                      </div>
                    ))}
                  {selectedItems > 10 && (
                    <div className="text-xs text-slate-500">
                      +{selectedItems - 10} more items
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Schematics */}
            {selectedSchematics > 0 && (
              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-2">Selected Schematics ({selectedSchematics})</h4>
                <div className="space-y-1">
                  {schematicsData
                    .filter(schematic => selectedSchematicIds.has(schematic.id))
                    .slice(0, 10)
                    .map(schematic => (
                      <div key={schematic.id} className="text-xs text-slate-400 truncate">
                        {schematic.name}
                        {schematic.category?.name && (
                          <span className="text-slate-500 ml-2">({schematic.category.name})</span>
                        )}
                      </div>
                    ))}
                  {selectedSchematics > 10 && (
                    <div className="text-xs text-slate-500">
                      +{selectedSchematics - 10} more schematics
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionSummary; 