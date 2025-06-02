import React, { useState } from 'react';
import { Link2, X, Plus, Check, AlertCircle, Database, ExternalLink, Info, Activity, Keyboard } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useLinkingState } from '../hooks/useLinkingState';
import { usePOILinkingShortcuts, FocusedPanel } from '../hooks/useKeyboardShortcuts';
import { 
  createPoiItemLinks, 
  createPoiItemLinksWithRetry,
  undoLinkCreation,
  formatLinkingStats, 
  type LinkCreationOptions,
  type LinkCreationResult
} from '../lib/linkingUtils';
import { useItems, useSchematics } from '../hooks/useItemsSchematicsData';
import PoiSelectionPanel from '../components/poi-linking/PoiSelectionPanel';
import ItemSchematicSelectionPanel from '../components/poi-linking/ItemSchematicSelectionPanel';
import SelectionSummary from '../components/poi-linking/SelectionSummary';
import LinkingConfirmationModal from '../components/poi-linking/LinkingConfirmationModal';
import KeyboardShortcutsHelp from '../components/poi-linking/KeyboardShortcutsHelp';
import { EnhancedFeedbackDisplay } from '../components/poi-linking/EnhancedFeedbackDisplay';
import { LinkingOperationHistory } from '../components/poi-linking/LinkingOperationHistory';
import { PerformanceMonitoringPanel } from '../components/poi-linking/PerformanceMonitoringPanel';
import { EnhancedProgressIndicator } from '../components/poi-linking/EnhancedProgressIndicator';
import BulkLinkManagementModal from '../components/poi-linking/BulkLinkManagementModal';

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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLinkingInProgress, setIsLinkingInProgress] = useState(false);
  const [linkingProgress, setLinkingProgress] = useState(0);
  const [linkingResult, setLinkingResult] = useState<LinkCreationResult | null>(null);
  const [retryOptions, setRetryOptions] = useState<LinkCreationOptions | null>(null);
  
  // Performance monitoring state
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [currentOperationId, setCurrentOperationId] = useState<string | null>(null);
  const [linkingStatus, setLinkingStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'error' | 'cancelled'>('idle');
  
  // Keyboard shortcuts state
  const [focusedPanel, setFocusedPanel] = useState<FocusedPanel>('none');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  // Bulk operations state
  const [showBulkLinkManager, setShowBulkLinkManager] = useState(false);

  // Handle showing confirmation modal
  const handleShowConfirmation = () => {
    if (!linkingState.validation.canCreateLinks) return;
    setShowConfirmationModal(true);
  };

  // Handle confirmed link creation with enhanced error handling and retry logic
  const handleConfirmCreateLinks = async (options: LinkCreationOptions) => {
    setIsLinkingInProgress(true);
    setLinkingProgress(0);
    setLinkingResult(null);
    setRetryOptions(options); // Store options for potential retry
    setShowConfirmationModal(false); // Close modal
    setLinkingStatus('running');
    
    try {
      const result = await createPoiItemLinksWithRetry(
        linkingState.selectedPoiIds,
        linkingState.selectedItemIds,
        linkingState.selectedSchematicIds,
        {
          ...options,
          onProgress: (progress) => {
            setLinkingProgress(progress);
          }
        }
      );
      
      setCurrentOperationId(result.operationId);
      setLinkingResult(result);
      setLinkingStatus(result.success ? 'completed' : 'error');
      
      // Clear selections after successful creation (only if fully successful)
      if (result.success && result.created > 0) {
        linkingState.clearAllSelections();
      }
      
    } catch (error) {
      console.error('Error creating links:', error);
      setLinkingStatus('error');
      // Create a failed result object for display
      setLinkingResult({
        success: false,
        created: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'An unexpected error occurred'],
        enhancedErrors: [],
        duplicatesSkipped: 0,
        totalProcessed: 0,
        canRetry: true,
        canUndo: false,
        operationId: `failed-${Date.now()}`,
        createdLinkIds: [],
        analytics: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
          averageBatchTime: 0,
          totalBatches: 0,
          itemLinks: 0,
          schematicLinks: 0,
          poiBreakdown: {},
          entityBreakdown: { items: 0, schematics: 0 }
        },
        performanceMetrics: {
          batchTimes: [],
          duplicateCheckTime: 0,
          insertionTime: 0
        },
        retryHistory: []
      });
    } finally {
      setIsLinkingInProgress(false);
      setLinkingProgress(0);
    }
  };

  // Handle retry operation
  const handleRetry = async () => {
    if (retryOptions) {
      await handleConfirmCreateLinks(retryOptions);
    }
  };

  // Handle undo operation
  const handleUndo = async () => {
    if (!linkingResult?.operationId) return;
    
    try {
      const result = await undoLinkCreation(linkingResult.operationId);
      if (result.success) {
        // Clear the current result and refresh state
        setLinkingResult(null);
        setCurrentOperationId(null);
        setLinkingStatus('idle');
        // Optionally refresh any related data
      }
    } catch (error) {
      console.error('Undo failed:', error);
    }
  };

  // Handle operation undone from history
  const handleOperationUndone = () => {
    // Refresh any related data if needed
    // This is called when an operation is undone from the history panel
    setCurrentOperationId(null);
    setLinkingStatus('idle');
  };

  // Handle dismissing the feedback display
  const handleDismissFeedback = () => {
    setLinkingResult(null);
    setRetryOptions(null);
    setCurrentOperationId(null);
    setLinkingStatus('idle');
  };

  // Performance monitoring handlers
  const togglePerformanceMonitor = () => {
    setShowPerformanceMonitor(!showPerformanceMonitor);
  };

  // Keyboard shortcuts handlers
  const handleTogglePanel = () => {
    setFocusedPanel(prev => {
      if (prev === 'pois') return 'items-schematics';
      if (prev === 'items-schematics') return 'pois';
      return 'pois'; // Default to POIs if none focused
    });
  };

  const handleSelectAllPois = () => {
    // This will trigger the selectAllFiltered function in PoiSelectionPanel
    // The actual implementation happens in the panel component
    console.log('Triggering select all POIs - handled by PoiSelectionPanel.selectAllFiltered()');
  };

  const handleSelectAllItems = () => {
    // This will trigger the selectAllFiltered function in ItemSchematicSelectionPanel for items
    // The actual implementation happens in the panel component
    console.log('Triggering select all items - handled by ItemSchematicSelectionPanel.selectAllFiltered()');
  };

  const handleSelectAllSchematics = () => {
    // This will trigger the selectAllFiltered function in ItemSchematicSelectionPanel for schematics
    // The actual implementation happens in the panel component
    console.log('Triggering select all schematics - handled by ItemSchematicSelectionPanel.selectAllFiltered()');
  };

  const handleShowKeyboardHelp = () => {
    setShowKeyboardHelp(true);
  };

  // Bulk link management handlers
  const handleOpenBulkLinkManager = () => {
    setShowBulkLinkManager(true);
  };

  const handleBulkOperationComplete = (result: { success: boolean; message: string; affectedCount: number }) => {
    // Display the result as feedback
    setLinkingResult({
      success: result.success,
      created: 0,
      failed: result.success ? 0 : result.affectedCount,
      errors: result.success ? [] : [result.message],
      enhancedErrors: [],
      duplicatesSkipped: 0,
      totalProcessed: result.affectedCount,
      canRetry: false,
      canUndo: false,
      operationId: `bulk-${Date.now()}`,
      createdLinkIds: [],
      analytics: {
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        averageBatchTime: 0,
        totalBatches: 0,
        itemLinks: 0,
        schematicLinks: 0,
        poiBreakdown: {},
        entityBreakdown: { items: 0, schematics: 0 }
      },
      performanceMetrics: {
        batchTimes: [],
        duplicateCheckTime: 0,
        insertionTime: 0
      },
      retryHistory: []
    });
    
    // Close the bulk manager
    setShowBulkLinkManager(false);
  };

  // Initialize keyboard shortcuts
  const keyboardShortcuts = usePOILinkingShortcuts({
    onSelectAllPois: handleSelectAllPois,
    onSelectAllItems: handleSelectAllItems,
    onSelectAllSchematics: handleSelectAllSchematics,
    onClearSelections: linkingState.clearAllSelections,
    onCreateLinks: handleShowConfirmation,
    onTogglePanel: handleTogglePanel,
    onShowHelp: handleShowKeyboardHelp,
    canCreateLinks: () => linkingState.validation.canCreateLinks,
    hasSelections: () => linkingState.hasAnySelections(),
    focusedPanel
  });

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
      {/* Enhanced Header with Performance Monitor Toggle */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link2 className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-amber-200" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              POI Linking
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Bulk Link Management */}
            <button
              onClick={handleOpenBulkLinkManager}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-700 hover:bg-purple-600 text-purple-100 rounded-lg transition-colors"
              title="Manage Existing Links"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Manage Links</span>
            </button>
            
            {/* Keyboard Shortcuts Help */}
            <button
              onClick={handleShowKeyboardHelp}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
              title="Keyboard Shortcuts (F1 or ?)"
            >
              <Keyboard className="w-4 h-4" />
              <span className="hidden sm:inline">Shortcuts</span>
            </button>
            
            {/* Performance Monitor Toggle */}
            <button
              onClick={togglePerformanceMonitor}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showPerformanceMonitor 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
              title="Toggle Performance Monitor"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Performance</span>
            </button>
            
            <button
              onClick={() => navigate('/database')}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
            >
              <Database className="w-4 h-4" />
              <span>Database Management</span>
            </button>
          </div>
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

      {/* Enhanced Feedback Display */}
      {linkingResult && (
        <div className="px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <EnhancedFeedbackDisplay
              result={linkingResult}
              isLoading={isLinkingInProgress}
              onRetry={handleRetry}
              onUndo={handleUndo}
              onClose={handleDismissFeedback}
            />
          </div>
        </div>
      )}

      {/* Operation History */}
      <div className="px-6 py-2">
        <div className="max-w-7xl mx-auto">
          <LinkingOperationHistory
            onOperationUndone={handleOperationUndone}
            className="mb-4"
          />
        </div>
      </div>

      {/* Enhanced Progress Display with Performance Metrics */}
      {isLinkingInProgress && currentOperationId && (
        <div className="px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <EnhancedProgressIndicator
              operationId={currentOperationId}
              completed={Math.round((linkingProgress / 100) * linkingState.stats.totalPossibleLinks)}
              total={linkingState.stats.totalPossibleLinks}
              status={linkingStatus}
              showDetails={true}
              showPerformanceMetrics={true}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-700"
            />
          </div>
        </div>
      )}

      {/* Main Content - Side by Side Layout */}
      <div className="flex h-[calc(100vh-200px)]"> {/* Adjusted height for enhanced header */}
        {/* POI Selection Panel - 70% width */}
        <div 
          className={`w-[70%] border-r border-slate-700 relative ${
            focusedPanel === 'pois' 
              ? 'ring-2 ring-amber-500/50 ring-inset' 
              : ''
          }`}
          onClick={() => keyboardShortcuts.setFocusedPanel('pois')}
          tabIndex={0}
          onFocus={() => keyboardShortcuts.setFocusedPanel('pois')}
        >
          {focusedPanel === 'pois' && (
            <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-amber-600 text-white text-xs rounded font-medium">
              Focused • Use Tab to switch
            </div>
          )}
          <PoiSelectionPanel
            selectedPoiIds={linkingState.selectedPoiIds}
            onPoiToggle={linkingState.togglePoiSelection}
            onSelectAll={linkingState.selectAllPois}
            onClearSelection={linkingState.clearPoiSelection}
          />
        </div>

        {/* Items/Schematics Selection Panel - 30% width */}
        <div 
          className={`w-[30%] relative ${
            focusedPanel === 'items-schematics' 
              ? 'ring-2 ring-blue-500/50 ring-inset' 
              : ''
          }`}
          onClick={() => keyboardShortcuts.setFocusedPanel('items-schematics')}
          tabIndex={0}
          onFocus={() => keyboardShortcuts.setFocusedPanel('items-schematics')}
        >
          {focusedPanel === 'items-schematics' && (
            <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium">
              Focused • Use Tab to switch
            </div>
          )}
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
            onClick={handleShowConfirmation}
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

      {/* Confirmation Modal */}
      <LinkingConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmCreateLinks}
        selectedPoiIds={linkingState.selectedPoiIds}
        selectedItemIds={linkingState.selectedItemIds}
        selectedSchematicIds={linkingState.selectedSchematicIds}
        totalLinks={linkingState.stats.totalPossibleLinks}
        validation={linkingState.validation}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
        focusedPanel={focusedPanel}
        shortcuts={keyboardShortcuts.activeShortcuts}
      />

      {/* Performance Monitoring Panel */}
      <PerformanceMonitoringPanel
        operationId={currentOperationId || undefined}
        isVisible={showPerformanceMonitor}
        onToggle={togglePerformanceMonitor}
        className="z-50"
      />

      {/* Bulk Link Management Modal */}
      <BulkLinkManagementModal
        isOpen={showBulkLinkManager}
        onClose={() => setShowBulkLinkManager(false)}
        onOperationComplete={handleBulkOperationComplete}
      />
    </div>
  );
};

export default UnifiedPoiLinkingPage; 