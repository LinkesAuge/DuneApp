// Linked Entities Section for POI Views
// Displays and manages entities linked to a specific POI

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Package, 
  FileText, 
  Plus, 
  Edit, 
  Trash, 
  ExternalLink, 
  Link2,
  Loader2,
  MapPin
} from 'lucide-react';
import { Entity, POIEntityLinkWithDetails, TIER_NAMES } from '../../types/unified-entities';
import { poiEntityLinksAPI } from '../../lib/api/poi-entity-links';
import { ImagePreview } from '../shared/ImagePreview';
import { useAuth } from '../auth/AuthProvider';
import POIEntityLinkingModal from './POIEntityLinkingModal';

interface LinkedEntitiesSectionProps {
  poiId: string;
  poiTitle: string;
  className?: string;
  showLinkButton?: boolean;
  canEdit?: boolean;
  onLinksChanged?: () => void;
}

const LinkedEntitiesSection: React.FC<LinkedEntitiesSectionProps> = ({
  poiId,
  poiTitle,
  className = '',
  showLinkButton = true,
  canEdit = true,
  onLinksChanged
}) => {
  const { user } = useAuth();
  
  // State management
  const [entityLinks, setEntityLinks] = useState<POIEntityLinkWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsExpanded, setItemsExpanded] = useState(true);
  const [schematicsExpanded, setSchematicsExpanded] = useState(true);
  const [showLinkingModal, setShowLinkingModal] = useState(false);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editNotes, setEditNotes] = useState<string>('');

  // Load entity links
  useEffect(() => {
    loadEntityLinks();
  }, [poiId]);

  const loadEntityLinks = async () => {
    try {
      setLoading(true);
      const links = await poiEntityLinksAPI.getPOIEntityLinks(poiId);
      setEntityLinks(links);
    } catch (error) {
      console.error('Failed to load entity links:', error);
      setEntityLinks([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle links updated
  const handleLinksUpdated = () => {
    loadEntityLinks();
    onLinksChanged?.();
  };

  // Filter entities by type
  const linkedItems = entityLinks.filter(link => link.entity && !link.entity.is_schematic);
  const linkedSchematics = entityLinks.filter(link => link.entity && link.entity.is_schematic);

  // Handle link editing
  const startEditingLink = (link: POIEntityLinkWithDetails) => {
    setEditingLink(`${link.poi_id}-${link.entity_id}`);
    setEditQuantity(link.quantity);
    setEditNotes(link.notes || '');
  };

  const cancelEditingLink = () => {
    setEditingLink(null);
    setEditQuantity(1);
    setEditNotes('');
  };

  const saveEditingLink = async (poiId: string, entityId: string) => {
    try {
      await poiEntityLinksAPI.updatePOIEntityLink(poiId, entityId, {
        quantity: editQuantity,
        notes: editNotes.trim() || undefined
      });
      
      setEditingLink(null);
      loadEntityLinks();
      onLinksChanged?.();
    } catch (error) {
      console.error('Failed to update entity link:', error);
    }
  };

  // Handle link deletion
  const removeEntityLink = async (poiId: string, entityId: string) => {
    if (!confirm('Are you sure you want to remove this entity link?')) return;
    
    try {
      await poiEntityLinksAPI.unlinkEntityFromPOI(poiId, entityId);
      loadEntityLinks();
      onLinksChanged?.();
    } catch (error) {
      console.error('Failed to remove entity link:', error);
    }
  };

  // Navigate to unified entities page (filtered by entity)
  const navigateToEntity = (entity: Entity) => {
    // This could navigate to a filtered view of the entities page
    window.open(`/entities?search=${encodeURIComponent(entity.name)}`, '_blank');
  };

  // Render entity card
  const renderEntityCard = (link: POIEntityLinkWithDetails) => {
    if (!link.entity) return null;
    
    const entity = link.entity;
    const isEditing = editingLink === `${link.poi_id}-${link.entity_id}`;
    const tierName = TIER_NAMES[entity.tier_number] || `Tier ${entity.tier_number}`;

    return (
      <div 
        key={`${link.poi_id}-${link.entity_id}`}
        className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-4 hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Entity Icon */}
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 border border-slate-600 flex-shrink-0">
              <ImagePreview
                imageId={entity.icon_image_id}
                fallbackText={entity.icon_fallback || (entity.is_schematic ? '📋' : '📦')}
                size="sm"
                className="w-full h-full"
                showFallback={true}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Entity Name and Actions */}
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-amber-100 truncate"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {entity.name}
                </h4>
                <button
                  onClick={() => navigateToEntity(entity)}
                  className="p-1 text-amber-200/60 hover:text-amber-200 transition-colors flex-shrink-0"
                  title="View entity details"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              
              {/* Entity Metadata */}
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  entity.is_schematic 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {entity.is_schematic ? 'Schematic' : 'Item'}
                </span>
                
                <span className="text-xs px-2 py-1 bg-slate-600/50 text-amber-200/80 rounded border border-slate-600">
                  {entity.category}
                </span>
                
                <span className="text-xs px-2 py-1 bg-slate-600/50 text-amber-200/80 rounded border border-slate-600">
                  {entity.type}
                </span>
                
                {entity.tier_number > 0 && (
                  <span className="text-xs px-2 py-1 bg-slate-700 text-amber-300 rounded font-medium border border-slate-600">
                    T{entity.tier_number}: {tierName}
                  </span>
                )}
                
                {entity.is_global && (
                  <span className="text-xs px-1 py-1 bg-green-500/20 text-green-300 rounded border border-green-500/30">
                    Global
                  </span>
                )}
              </div>

              {/* Link Details */}
              <div className="bg-slate-800/50 rounded-lg p-3 mb-2">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-amber-200/80 min-w-0 flex-shrink-0">Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                        className="w-20 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-amber-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-amber-200/80 mb-1">Notes:</label>
                      <input
                        type="text"
                        placeholder="Optional notes..."
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveEditingLink(link.poi_id, link.entity_id)}
                        className="px-2 py-1 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditingLink}
                        className="px-2 py-1 text-xs text-amber-200 hover:text-amber-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-200/60">Quantity:</span>
                      <span className="text-amber-200 font-medium">{link.quantity}</span>
                    </div>
                    {link.notes && (
                      <div className="flex items-start justify-between">
                        <span className="text-amber-200/60 flex-shrink-0 mr-2">Notes:</span>
                        <span className="text-amber-200/80 text-right">{link.notes}</span>
                      </div>
                    )}
                    {link.assignment_source && (
                      <div className="flex items-center justify-between">
                        <span className="text-amber-200/60">Source:</span>
                        <span className="text-amber-200/60 capitalize">{link.assignment_source.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Entity Description */}
              {entity.description && (
                <p className="text-sm text-amber-200/70 line-clamp-2">{entity.description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          {canEdit && !isEditing && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => startEditingLink(link)}
                className="p-1 text-amber-200/60 hover:text-amber-200 transition-colors"
                title="Edit link"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={() => removeEntityLink(link.poi_id, link.entity_id)}
                className="p-1 text-red-400/60 hover:text-red-400 transition-colors"
                title="Remove link"
              >
                <Trash className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-amber-300 animate-spin" />
          <span className="ml-2 text-amber-200">Loading linked entities...</span>
        </div>
      </div>
    );
  }

  const hasLinkedItems = linkedItems.length > 0;
  const hasLinkedSchematics = linkedSchematics.length > 0;
  const hasLinkedEntities = hasLinkedItems || hasLinkedSchematics;

  return (
    <div className={`${className}`}>
      {/* Header with Link Button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-amber-100 flex items-center gap-2"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          <Link2 className="w-5 h-5" />
          Linked Entities
        </h3>
        
        {showLinkButton && canEdit && (
          <button
            onClick={() => setShowLinkingModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Link Entities
          </button>
        )}
      </div>

      {/* Content */}
      {!hasLinkedEntities && !showLinkButton ? (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-amber-300/40 mx-auto mb-4" />
          <p className="text-amber-200/60">No entities linked to this POI</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Linked Items Section */}
          {hasLinkedItems && (
            <div>
              <button
                onClick={() => setItemsExpanded(!itemsExpanded)}
                className="flex items-center gap-2 text-amber-200 hover:text-amber-100 transition-colors mb-3"
              >
                {itemsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <Package className="w-4 h-4" />
                <span className="font-medium">Items ({linkedItems.length})</span>
              </button>
              
              {itemsExpanded && (
                <div className="space-y-3 ml-6">
                  {linkedItems.map(renderEntityCard)}
                </div>
              )}
            </div>
          )}

          {/* Linked Schematics Section */}
          {hasLinkedSchematics && (
            <div>
              <button
                onClick={() => setSchematicsExpanded(!schematicsExpanded)}
                className="flex items-center gap-2 text-amber-200 hover:text-amber-100 transition-colors mb-3"
              >
                {schematicsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <FileText className="w-4 h-4" />
                <span className="font-medium">Schematics ({linkedSchematics.length})</span>
              </button>
              
              {schematicsExpanded && (
                <div className="space-y-3 ml-6">
                  {linkedSchematics.map(renderEntityCard)}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!hasLinkedEntities && showLinkButton && (
            <div className="text-center py-8 border-2 border-dashed border-slate-600 rounded-lg">
              <MapPin className="w-12 h-12 text-amber-300/40 mx-auto mb-4" />
              <p className="text-amber-200/60 mb-4">No entities linked to this POI yet</p>
              <button
                onClick={() => setShowLinkingModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Link Your First Entity
              </button>
            </div>
          )}
        </div>
      )}

      {/* Entity Linking Modal */}
      <POIEntityLinkingModal
        isOpen={showLinkingModal}
        onClose={() => setShowLinkingModal(false)}
        poiId={poiId}
        poiTitle={poiTitle}
        existingEntityIds={entityLinks.map(link => link.entity_id)}
        onLinksUpdated={handleLinksUpdated}
      />
    </div>
  );
};

export default LinkedEntitiesSection; 