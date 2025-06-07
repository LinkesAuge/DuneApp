import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Package, FileText, ExternalLink, Scroll } from 'lucide-react';
import { getPoiWithEntities } from '../../lib/api/poi-entity-links';
import { PoiWithItems, ItemWithRelations, SchematicWithRelations } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

interface LinkedItemsSectionProps {
  poiId: string;
  className?: string;
  showLinkButton?: boolean;
  onLinkClick?: () => void;
  refreshTrigger?: number; // Used to force refresh when entity links change
}

const LinkedItemsSection: React.FC<LinkedItemsSectionProps> = ({
  poiId,
  className = '',
  showLinkButton = false,
  onLinkClick,
  refreshTrigger
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [poiWithItems, setPoiWithItems] = useState<PoiWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemsExpanded, setItemsExpanded] = useState(false);
  const [schematicsExpanded, setSchematicsExpanded] = useState(false);

  useEffect(() => {
    const fetchPoiItems = async () => {
      try {
        setLoading(true);
        const data = await getPoiWithEntities(poiId);
        setPoiWithItems(data);
      } catch (error) {
        console.error('Error fetching POI items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoiItems();
  }, [poiId, refreshTrigger]); // Added refreshTrigger to dependency array

  const navigateToItem = (itemId: string) => {
    navigate(`/database`);
  };

  const navigateToSchematic = (schematicId: string) => {
    navigate(`/database`);
  };

  const canShowLinkButton = () => {
    if (!user || !showLinkButton) return false;
    
    // Members can link to their own POIs, editors and admins can link to any
    if (user.role === 'admin' || user.role === 'editor') return true;
    if (user.role === 'member' && poiWithItems?.created_by === user.id) return true;
    
    return false;
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-4">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!poiWithItems) {
    return null;
  }

  const linkedItems = poiWithItems.linked_items || [];
  const linkedSchematics = poiWithItems.linked_schematics || [];
  const hasLinkedItems = linkedItems.length > 0;
  const hasLinkedSchematics = linkedSchematics.length > 0;

  // Don't render anything if no items/schematics and no link button
  if (!hasLinkedItems && !hasLinkedSchematics && !canShowLinkButton()) {
    return null;
  }

  const renderItemCard = (item: ItemWithRelations) => (
    <div key={item.id} className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-4 hover:bg-slate-700/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Item Icon */}
          {item.icon_url && (
            <img src={item.icon_url} alt={item.name} className="w-10 h-10 rounded flex-shrink-0" />
          )}
          
          <div className="flex-1 min-w-0">
            {/* Item Name and Type */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-amber-100 truncate">{item.name}</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToItem(item.id);
                }}
                className="p-1 text-amber-200/60 hover:text-amber-200 transition-colors flex-shrink-0"
                title="View item details"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            
            {/* Item Metadata */}
            <div className="flex flex-wrap gap-2 mb-2">
              {item.category && (
                <span className="text-xs px-2 py-1 bg-slate-600/50 text-amber-200/80 rounded">
                  {item.category.name}
                </span>
              )}
              {item.type && (
                <span className="text-xs px-2 py-1 bg-slate-600/50 text-amber-200/80 rounded">
                  {item.type.name}
                </span>
              )}
              {item.tier && (
                <span 
                  className="text-xs px-2 py-1 rounded font-medium"
                  style={{ backgroundColor: item.tier.color + '20', color: item.tier.color }}
                >
                  {item.tier.name}
                </span>
              )}
            </div>
            
            {/* Item Description */}
            {item.description && (
              <p className="text-sm text-amber-200/70 line-clamp-2">{item.description}</p>
            )}

            {/* Custom Fields Preview */}
            {item.field_values && Object.keys(item.field_values).length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-600/30">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(item.field_values).slice(0, 3).map(([key, value]) => (
                    <span key={key} className="text-xs text-amber-200/60">
                      {key.replace(/_/g, ' ')}: {String(value)}
                    </span>
                  ))}
                  {Object.keys(item.field_values).length > 3 && (
                    <span className="text-xs text-amber-200/40">+{Object.keys(item.field_values).length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchematicCard = (schematic: SchematicWithRelations) => (
    <div key={schematic.id} className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-4 hover:bg-slate-700/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Schematic Icon */}
          {schematic.icon_url && (
            <img src={schematic.icon_url} alt={schematic.name} className="w-10 h-10 rounded flex-shrink-0" />
          )}
          
          <div className="flex-1 min-w-0">
            {/* Schematic Name and Type */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-amber-100 truncate">{schematic.name}</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToSchematic(schematic.id);
                }}
                className="p-1 text-amber-200/60 hover:text-amber-200 transition-colors flex-shrink-0"
                title="View schematic details"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            
            {/* Schematic Metadata */}
            <div className="flex flex-wrap gap-2 mb-2">
              {schematic.category && (
                <span className="text-xs px-2 py-1 bg-slate-600/50 text-amber-200/80 rounded">
                  {schematic.category.name}
                </span>
              )}
              {schematic.type && (
                <span className="text-xs px-2 py-1 bg-slate-600/50 text-amber-200/80 rounded">
                  {schematic.type.name}
                </span>
              )}
              {schematic.tier && (
                <span 
                  className="text-xs px-2 py-1 rounded font-medium"
                  style={{ backgroundColor: schematic.tier.color + '20', color: schematic.tier.color }}
                >
                  {schematic.tier.name}
                </span>
              )}
            </div>
            
            {/* Schematic Description */}
            {schematic.description && (
              <p className="text-sm text-amber-200/70 line-clamp-2">{schematic.description}</p>
            )}

            {/* Custom Fields Preview */}
            {schematic.field_values && Object.keys(schematic.field_values).length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-600/30">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(schematic.field_values).slice(0, 3).map(([key, value]) => (
                    <span key={key} className="text-xs text-amber-200/60">
                      {key.replace(/_/g, ' ')}: {String(value)}
                    </span>
                  ))}
                  {Object.keys(schematic.field_values).length > 3 && (
                    <span className="text-xs text-amber-200/40">+{Object.keys(schematic.field_values).length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={className}>
      {/* Linked Items Section */}
      {hasLinkedItems && (
        <div className="mb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setItemsExpanded(!itemsExpanded);
            }}
            className="w-full flex items-center justify-between p-2 bg-slate-700/50 border border-slate-600 rounded hover:bg-slate-700/70 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-sm font-medium text-amber-200">Linked Items</span>
              <span className="text-xs text-amber-200/60">({linkedItems.length})</span>
            </div>
            {itemsExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-amber-200/60" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-amber-200/60" />
            )}
          </button>
          
          {itemsExpanded && (
            <div className="mt-2 space-y-2">
              {linkedItems.map(renderItemCard)}
            </div>
          )}
        </div>
      )}

      {/* Linked Schematics Section */}
      {hasLinkedSchematics && (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSchematicsExpanded(!schematicsExpanded);
            }}
            className="w-full flex items-center justify-between p-2 bg-slate-700/50 border border-slate-600 rounded hover:bg-slate-700/70 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Scroll className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-sm font-medium text-amber-200">Linked Schematics</span>
              <span className="text-xs text-amber-200/60">({linkedSchematics.length})</span>
            </div>
            {schematicsExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-amber-200/60" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-amber-200/60" />
            )}
          </button>
          
          {schematicsExpanded && (
            <div className="mt-2 space-y-2">
              {linkedSchematics.map(renderSchematicCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LinkedItemsSection; 