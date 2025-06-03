import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, X, Link2, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/AuthProvider';
import LinkCreationModal from '../LinkCreationModal';

interface SelectionSummaryPanelProps {
  onTogglePanel: () => void;
  filterState: any; // Will be properly typed when we import the hook
}

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

const SelectionSummaryPanel: React.FC<SelectionSummaryPanelProps> = ({ 
  onTogglePanel, 
  filterState 
}) => {
  const { user } = useAuth();
  const [linkPreviews, setLinkPreviews] = useState<LinkPreview[]>([]);
  const [linkStats, setLinkStats] = useState<LinkStats>({ newLinks: 0, duplicates: 0, totalAfter: 0 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCreatingLinks, setIsCreatingLinks] = useState(false);
  const [creationResult, setCreationResult] = useState<{ success: number; failed: number } | null>(null);

  const {
    pois,
    entities,
    selectedPOIIds,
    selectedEntityIds,
    togglePOISelection,
    toggleEntitySelection,
    clearAllSelections,
    filterCounts
  } = filterState;

  // Get selected POIs and Entities data with useMemo for stable references
  const selectedPOIs = useMemo(() => 
    pois.filter((poi: any) => selectedPOIIds.has(poi.id)), 
    [pois, selectedPOIIds]
  );
  
  const selectedEntities = useMemo(() => 
    entities.filter((entity: any) => selectedEntityIds.has(entity.id)), 
    [entities, selectedEntityIds]
  );

  // Calculate link previews and detect duplicates
  useEffect(() => {
    const calculateLinkPreviews = async () => {
      if (selectedPOIIds.size === 0 || selectedEntityIds.size === 0) {
        setLinkPreviews([]);
        setLinkStats({ newLinks: 0, duplicates: 0, totalAfter: 0 });
        return;
      }



      const previews: LinkPreview[] = [];
      
      // Generate all possible combinations
      for (const poi of selectedPOIs) {
        for (const entity of selectedEntities) {
          previews.push({
            poiId: poi.id,
            entityId: entity.id,
            poiTitle: poi.title,
            entityName: entity.name,
            exists: false // Will be updated by duplicate check
          });
        }
      }

      // Check for existing links
      if (previews.length > 0) {
        try {
          const { data: existingLinks } = await supabase
            .from('poi_entity_links')
            .select('poi_id, entity_id')
            .in('poi_id', Array.from(selectedPOIIds))
            .in('entity_id', Array.from(selectedEntityIds));

          // Mark existing links
          const existingSet = new Set(
            existingLinks?.map(link => `${link.poi_id}-${link.entity_id}`) || []
          );

          const updatedPreviews = previews.map(preview => ({
            ...preview,
            exists: existingSet.has(`${preview.poiId}-${preview.entityId}`)
          }));

          setLinkPreviews(updatedPreviews);

          // Calculate statistics
          const newLinks = updatedPreviews.filter(p => !p.exists).length;
          const duplicates = updatedPreviews.filter(p => p.exists).length;
          
          // Get current total links count
          const { count: currentTotal } = await supabase
            .from('poi_entity_links')
            .select('*', { count: 'exact', head: true });

          setLinkStats({
            newLinks,
            duplicates,
            totalAfter: (currentTotal || 0) + newLinks
          });
        } catch (error) {
          console.error('Error calculating link previews:', error);
        }
      }
    };

    calculateLinkPreviews();
  }, [selectedPOIIds, selectedEntityIds, selectedPOIs, selectedEntities]);

  // Handle link creation
  const handleCreateLinks = async () => {
    setIsCreatingLinks(true);
    
    try {
      const newLinks = linkPreviews.filter(preview => !preview.exists);
      
      if (newLinks.length === 0) {
        setCreationResult({ success: 0, failed: 0 });
        return;
      }

      // Create links in batches
      const linksToCreate = newLinks.map(preview => ({
        poi_id: preview.poiId,
        entity_id: preview.entityId,
        added_by: user?.id || null, // Set to current user's ID
        added_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('poi_entity_links')
        .insert(linksToCreate)
        .select();

      if (error) {
        console.error('Error creating links:', error);
        setCreationResult({ success: 0, failed: newLinks.length });
      } else {
        setCreationResult({ success: data?.length || 0, failed: 0 });
        
        // Refresh POI data to update link counts
        refreshData();
        
        // Clear selections after successful creation
        setTimeout(() => {
          clearAllSelections();
          setShowConfirmModal(false);
          setCreationResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error in link creation:', error);
      setCreationResult({ success: 0, failed: linkPreviews.filter(p => !p.exists).length });
    } finally {
      setIsCreatingLinks(false);
    }
  };

  // Remove individual POI from selection
  const removePOI = (poiId: string) => {
    togglePOISelection(poiId);
  };

  // Remove individual Entity from selection
  const removeEntity = (entityId: string) => {
    toggleEntitySelection(entityId);
  };

  // Get POI type info for display
  const getPOITypeInfo = (poi: any) => {
    if (!poi.poi_types) return { icon: '📍', color: 'bg-slate-600' };
    
    const typeMap: { [key: string]: { icon: string; color: string } } = {
      'Base': { icon: '⚡', color: 'bg-blue-600' },
      'Resources': { icon: '💎', color: 'bg-orange-600' },
      'Locations': { icon: '🏛️', color: 'bg-purple-600' },
      'NPCs': { icon: '👤', color: 'bg-green-600' },
      'Exploration': { icon: '🔍', color: 'bg-yellow-600' }
    };
    
    return typeMap[poi.poi_types.category] || { icon: '📍', color: 'bg-slate-600' };
  };

  // Get tier info for entities
  const getTierInfo = (tierNumber: number | null) => {
    if (!tierNumber) return null;
    
    const tierColors: { [key: number]: string } = {
      1: 'bg-green-600',
      2: 'bg-blue-600', 
      3: 'bg-orange-600',
      4: 'bg-purple-600',
      5: 'bg-yellow-600'
    };
    
    return {
      color: tierColors[tierNumber] || 'bg-slate-600',
      label: `T${tierNumber}`
    };
  };

  return (
    <>
      <div className="w-80 dune-panel overflow-hidden flex flex-col">
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-600">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-amber-200 flex items-center">
              <BarChart3 size={16} className="mr-2" />
              Selection Summary
            </h3>
            <button 
              className="dune-button-secondary py-1 px-2 text-xs rounded"
              onClick={onTogglePanel}
            >
              ➡️
            </button>
          </div>
          <p className="text-sm text-slate-400">
            {filterCounts.selectedPOIs} POIs • {filterCounts.selectedEntities} Entities selected
          </p>
        </div>

        {/* Selection Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Selected POIs */}
          {selectedPOIs.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-amber-200 mb-3 flex items-center justify-between">
                🗺️ Selected POIs 
                <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                  {selectedPOIs.length}
                </span>
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedPOIs.map((poi: any) => {
                  const typeInfo = getPOITypeInfo(poi);
                  return (
                    <div key={poi.id} className="bg-slate-800 rounded-lg p-3 border border-green-500/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 ${typeInfo.color} rounded-full flex items-center justify-center text-xs`}>
                            {typeInfo.icon}
                          </div>
                          <span className="text-sm text-amber-200 font-medium truncate">
                            {poi.title}
                          </span>
                        </div>
                        <button 
                          onClick={() => removePOI(poi.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        📍 {poi.map_type === 'hagga_basin' ? 'Hagga Basin' : 'Deep Desert'} • 0 existing links
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Selected Entities */}
          {selectedEntities.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-amber-200 mb-3 flex items-center justify-between">
                📦 Selected Entities 
                <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
                  {selectedEntities.length}
                </span>
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedEntities.slice(0, 3).map((entity: any) => {
                  const tierInfo = getTierInfo(entity.tier_number);
                  return (
                    <div key={entity.id} className="bg-slate-800 rounded-lg p-3 border border-purple-500/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-slate-600 rounded flex items-center justify-center">
                            {entity.icon_url ? (
                              <img src={entity.icon_url} alt={entity.name} className="w-3 h-3" />
                            ) : (
                              <span className="text-xs">📦</span>
                            )}
                          </div>
                          <span className="text-sm text-amber-200 font-medium truncate">
                            {entity.name}
                          </span>
                          {tierInfo && (
                            <span className={`text-xs ${tierInfo.color} text-white px-1 rounded`}>
                              {tierInfo.label}
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => removeEntity(entity.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {selectedEntities.length > 3 && (
                  <div className="text-center py-2">
                    <span className="text-xs text-slate-400">
                      + {selectedEntities.length - 3} more entities
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Link Statistics */}
          {linkPreviews.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
              <h4 className="text-sm font-medium text-amber-200 mb-2 flex items-center">
                <BarChart3 size={14} className="mr-1" />
                Link Preview
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">New links to create:</span>
                  <span className="text-green-400 font-medium">{linkStats.newLinks}</span>
                </div>
                {linkStats.duplicates > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duplicates (will skip):</span>
                    <span className="text-yellow-400 font-medium">{linkStats.duplicates}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-600 pt-1 mt-2">
                  <span className="text-amber-200 font-medium">Total after linking:</span>
                  <span className="text-amber-200 font-medium">{linkStats.totalAfter}</span>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedPOIs.length === 0 && selectedEntities.length === 0 && (
            <div className="text-center text-slate-400 mt-16">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
              <p>No POIs or Entities selected</p>
              <p className="text-xs mt-2">Select items from the panels to create links</p>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-600 space-y-3">
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={linkStats.newLinks === 0}
            className={`w-full py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center space-x-2 ${
              linkStats.newLinks > 0 
                ? 'dune-button-primary hover:bg-amber-500' 
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Link2 size={16} />
            <span>Create Links ({linkStats.newLinks})</span>
          </button>
          
          <button
            onClick={clearAllSelections}
            disabled={selectedPOIs.length === 0 && selectedEntities.length === 0}
            className="w-full dune-button-secondary py-2 px-4 rounded-lg text-sm flex items-center justify-center space-x-2"
          >
            <Trash2 size={14} />
            <span>Clear All Selections</span>
          </button>
          
          {/* Quick Actions */}
          <div className="pt-2 border-t border-slate-600">
            <h5 className="text-xs font-medium text-amber-200 mb-2">Quick Actions</h5>
            <div className="grid grid-cols-2 gap-2">
              <button className="dune-button-secondary py-1 px-2 text-xs rounded" disabled title="Coming in Phase 5">
                📋 Manage Links
              </button>
              <button className="dune-button-secondary py-1 px-2 text-xs rounded" disabled title="Coming in Phase 5">
                📈 Link History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="dune-panel rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-600">
              <h3 className="text-xl font-bold text-amber-200 flex items-center">
                <Link2 size={20} className="mr-2" />
                Confirm Link Creation
              </h3>
              <p className="text-sm text-slate-400 mt-1">Review the links that will be created</p>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-amber-200 mb-2 flex items-center">
                    <BarChart3 size={16} className="mr-2" />
                    Summary
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-400">{linkStats.newLinks}</div>
                      <div className="text-xs text-slate-400">New Links</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-400">{linkStats.duplicates}</div>
                      <div className="text-xs text-slate-400">Duplicates</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-amber-200">{linkStats.totalAfter}</div>
                      <div className="text-xs text-slate-400">Total After</div>
                    </div>
                  </div>
                </div>
                
                {/* Links to Create Preview */}
                {linkStats.newLinks > 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-amber-200 mb-2 flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      Links to Create
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {linkPreviews.filter(preview => !preview.exists).slice(0, 10).map((preview, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300 truncate">
                            {preview.poiTitle} ↔ {preview.entityName}
                          </span>
                          <span className="text-green-400 flex items-center space-x-1">
                            <CheckCircle size={12} />
                            <span>New</span>
                          </span>
                        </div>
                      ))}
                      {linkStats.newLinks > 10 && (
                        <div className="text-xs text-slate-400 text-center mt-2">
                          + {linkStats.newLinks - 10} more links...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Duplicates Warning */}
                {linkStats.duplicates > 0 && (
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-400 mb-2 flex items-center">
                      <AlertTriangle size={16} className="mr-2" />
                      Duplicate Links (Will be Skipped)
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {linkPreviews.filter(preview => preview.exists).slice(0, 5).map((preview, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300 truncate">
                            {preview.poiTitle} ↔ {preview.entityName}
                          </span>
                          <span className="text-yellow-400 flex items-center space-x-1">
                            <AlertTriangle size={12} />
                            <span>Exists</span>
                          </span>
                        </div>
                      ))}
                      {linkStats.duplicates > 5 && (
                        <div className="text-xs text-slate-400 text-center mt-2">
                          + {linkStats.duplicates - 5} more duplicates...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Creation Result */}
                {creationResult && (
                  <div className={`rounded-lg p-4 ${
                    creationResult.failed === 0 
                      ? 'bg-green-900/20 border border-green-600/30' 
                      : 'bg-red-900/20 border border-red-600/30'
                  }`}>
                    <h4 className={`font-medium mb-2 flex items-center ${
                      creationResult.failed === 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <CheckCircle size={16} className="mr-2" />
                      Creation Result
                    </h4>
                    <div className="text-sm">
                      <p className="text-slate-300">
                        Successfully created: <span className="text-green-400 font-medium">{creationResult.success}</span> links
                      </p>
                      {creationResult.failed > 0 && (
                        <p className="text-slate-300">
                          Failed to create: <span className="text-red-400 font-medium">{creationResult.failed}</span> links
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-600 flex justify-end space-x-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="dune-button-secondary py-2 px-4 rounded-lg"
                disabled={isCreatingLinks}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateLinks}
                disabled={isCreatingLinks || linkStats.newLinks === 0 || creationResult !== null}
                className={`py-2 px-4 rounded-lg font-medium flex items-center space-x-2 ${
                  isCreatingLinks 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'dune-button-primary'
                }`}
              >
                {isCreatingLinks ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Link2 size={16} />
                    <span>Create {linkStats.newLinks} Links</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SelectionSummaryPanel; 