import React, { useState } from 'react';
import { Link2, X, Plus, Check, AlertCircle, Database, ExternalLink, Info } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useLinkingState } from '../hooks/useLinkingState';
import { createPoiItemLinks, formatLinkingStats } from '../lib/linkingUtils';
import { useItems, useSchematics } from '../hooks/useItemsSchematicsData';
import PoiSelectionPanel from '../components/poi-linking/PoiSelectionPanel';
import ItemSchematicSelectionPanel from '../components/poi-linking/ItemSchematicSelectionPanel';
import SelectionSummary from '../components/poi-linking/SelectionSummary';

const UnifiedPoiLinkingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use the new centralized linking state
  const linkingState = useLinkingState({
    enableUrlSync: true,
    minPois: 1,
    minItems: 0,
    minSchematics: 0,
    maxSelections: 500
  });
  
  // Fetch items/schematics data for analytics
  const { allItems: items } = useItems();
  const { allSchematics: schematics } = useSchematics();
  
  // UI state
  const [isLinkingInProgress, setIsLinkingInProgress] = useState(false);
  const [linkingError, setLinkingError] = useState<string | null>(null);
  const [linkingProgress, setLinkingProgress] = useState(0);
  const [linkingResult, setLinkingResult] = useState<{
    created: number;
    duplicatesSkipped?: number;
    totalProcessed: number;
  } | null>(null);

  // Handle link creation with progress tracking
  const handleCreateLinks = async () => {
    if (!linkingState.validation.canCreateLinks) return;
    
    setIsLinkingInProgress(true);
    setLinkingError(null);
    setLinkingProgress(0);
    setLinkingResult(null);
    
    try {
      const result = await createPoiItemLinks(
        linkingState.selectedPoiIds,
        linkingState.selectedItemIds,
        linkingState.selectedSchematicIds,
        {
          linkType: 'found_here',
          defaultQuantity: 1,
          batchSize: 25,
          onProgress: (progress) => {
            setLinkingProgress(progress);
          }
        }
      );
      
      if (result.success || result.created > 0) {
        setLinkingResult({
          created: result.created,
          duplicatesSkipped: result.duplicatesSkipped,
          totalProcessed: result.totalProcessed
        });
        
        // Clear selections after successful creation
        linkingState.clearAllSelections();
        
        // Show success for a few seconds, then clear
        setTimeout(() => {
          setLinkingResult(null);
        }, 5000);
      } else {
        setLinkingError(result.errors.join(', ') || 'Failed to create links');
      }
    } catch (error) {
      console.error('Error creating links:', error);
      setLinkingError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLinkingInProgress(false);
      setLinkingProgress(0);
    }
  };

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-amber-200 mb-2">Access Denied</h2>
          <p className="text-slate-300 mb-4">This feature is only available to administrators.</p>
          <button 
            onClick={() => navigate('/database')}
            className="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
          >
            <Database className="w-4 h-4 mr-2" />
            Go to Database Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Simple Header */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link2 className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-amber-200" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              POI Linking
            </h1>
          </div>
          
          <button
            onClick={() => navigate('/database')}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
          >
            <Database className="w-4 h-4" />
            <span>Database Management</span>
          </button>
        </div>
      </div>

      {/* Enhanced Selection Summary */}
      <div className="px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <SelectionSummary
            selectedPois={linkingState.stats.selectedPois}
            selectedItems={linkingState.stats.selectedItems}
            selectedSchematics={linkingState.stats.selectedSchematics}
            totalLinks={linkingState.stats.totalPossibleLinks}
            validation={linkingState.validation}
            onClearAll={linkingState.clearAllSelections}
            selectedPoiIds={linkingState.selectedPoiIds}
            selectedItemIds={linkingState.selectedItemIds}
            selectedSchematicIds={linkingState.selectedSchematicIds}
            itemsData={items}
            schematicsData={schematics}
            onExportSelection={() => {
              // Optional: Add export tracking or notifications
              console.log('Selection exported');
            }}
            onShareSelection={() => {
              // Optional: Add share tracking or notifications
              console.log('Selection URL copied');
            }}
          />
        </div>
      </div>

      {/* Success/Progress Display */}
      {linkingResult && (
        <div className="bg-green-900/20 border-b border-green-800/50 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center space-x-2 text-green-300">
            <Check className="w-4 h-4" />
            <span>
              Successfully created {linkingResult.created} links
              {linkingResult.duplicatesSkipped && linkingResult.duplicatesSkipped > 0 && (
                <span className="text-green-400 ml-2">
                  ({linkingResult.duplicatesSkipped} duplicates skipped)
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {linkingError && (
        <div className="bg-red-900/20 border-b border-red-800/50 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center space-x-2 text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span>{linkingError}</span>
          </div>
        </div>
      )}

      {/* Progress Display */}
      {isLinkingInProgress && linkingProgress > 0 && (
        <div className="bg-blue-900/20 border-b border-blue-800/50 px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between text-blue-300 mb-2">
              <span>Creating links...</span>
              <span>{Math.round(linkingProgress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${linkingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Side by Side Layout */}
      <div className="flex h-[calc(100vh-200px)]"> {/* Adjusted height for enhanced header */}
        {/* POI Selection Panel - 70% width */}
        <div className="w-[70%] border-r border-slate-700">
          <PoiSelectionPanel
            selectedPoiIds={linkingState.selectedPoiIds}
            onPoiToggle={linkingState.togglePoiSelection}
            onSelectAll={linkingState.selectAllPois}
            onClearSelection={linkingState.clearPoiSelection}
          />
        </div>

        {/* Items/Schematics Selection Panel - 30% width */}
        <div className="w-[30%]">
          <ItemSchematicSelectionPanel
            selectedItemIds={linkingState.selectedItemIds}
            selectedSchematicIds={linkingState.selectedSchematicIds}
            onItemToggle={linkingState.toggleItemSelection}
            onSchematicToggle={linkingState.toggleSchematicSelection}
            onSelectAllItems={linkingState.selectAllItems}
            onSelectAllSchematics={linkingState.selectAllSchematics}
            onClearItemSelection={linkingState.clearItemSelection}
            onClearSchematicSelection={linkingState.clearSchematicSelection}
          />
        </div>
      </div>

      {/* Action Bar - Fixed at bottom */}
      <div className="bg-slate-900 border-t border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {!linkingState.validation.canCreateLinks ? (
              linkingState.validation.errors.length > 0 ? (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-300">{linkingState.validation.errors[0]}</span>
                </div>
              ) : (
                "Select at least one POI and one item or schematic to create links"
              )
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-green-300">Ready to create {linkingState.stats.totalPossibleLinks} links</span>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span>•</span>
                  <span>
                    {linkingState.stats.selectedPois} POI{linkingState.stats.selectedPois !== 1 ? 's' : ''} × {linkingState.stats.totalEntitySelections} item{linkingState.stats.totalEntitySelections !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleCreateLinks}
            disabled={!linkingState.validation.canCreateLinks || isLinkingInProgress}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              linkingState.validation.canCreateLinks && !isLinkingInProgress
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-amber-600/25'
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

export default UnifiedPoiLinkingPage; 