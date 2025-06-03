// POI Entity Linking Modal
// Allows users to search and link entities to a specific POI

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Package, FileText, X, LinkIcon, Loader2, Check } from 'lucide-react';
import { Entity, TIER_NAMES } from '../../types/unified-entities';
import { entitiesAPI } from '../../lib/api/entities';
import { poiEntityLinksAPI, CreatePOIEntityLinkData } from '../../lib/api/poi-entity-links';
import { ImagePreview } from '../shared/ImagePreview';
import { useAuth } from '../auth/AuthProvider';

interface POIEntityLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  poiId: string;
  poiTitle: string;
  existingEntityIds?: string[];
  onLinksUpdated?: () => void;
}

interface EntityLinkData {
  entity: Entity;
  quantity: number;
  notes: string;
  isSelected: boolean;
}

const POIEntityLinkingModal: React.FC<POIEntityLinkingModalProps> = ({
  isOpen,
  onClose,
  poiId,
  poiTitle,
  existingEntityIds = [],
  onLinksUpdated
}) => {
  const { user } = useAuth();
  
  // State management
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<number | ''>('');
  const [entityClassFilter, setEntityClassFilter] = useState<'all' | 'items' | 'schematics'>('all');
  
  // Entity link data
  const [entityLinks, setEntityLinks] = useState<Map<string, EntityLinkData>>(new Map());
  
  // Derived data
  const categories = useMemo(() => {
    const cats = Array.from(new Set(entities.map(e => e.category))).sort();
    return cats;
  }, [entities]);

  const types = useMemo(() => {
    const filteredEntities = selectedCategory 
      ? entities.filter(e => e.category === selectedCategory)
      : entities;
    const typeList = Array.from(new Set(filteredEntities.map(e => e.type))).sort();
    return typeList;
  }, [entities, selectedCategory]);

  // Load entities on mount
  useEffect(() => {
    if (isOpen) {
      loadEntities();
    }
  }, [isOpen]);

  // Reset filters when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedCategory('');
      setSelectedType('');
      setSelectedTier('');
      setEntityClassFilter('all');
      setEntityLinks(new Map());
    }
  }, [isOpen]);

  const loadEntities = async () => {
    try {
      setLoading(true);
      const response = await entitiesAPI.getAll({ limit: 100 });
      setEntities(response.data);
    } catch (error) {
      console.error('Failed to load entities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter entities based on current filters
  const filteredEntities = useMemo(() => {
    let filtered = entities.filter(entity => {
      // Exclude already linked entities
      if (existingEntityIds.includes(entity.id)) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!entity.name.toLowerCase().includes(term) &&
            !entity.description?.toLowerCase().includes(term) &&
            !entity.category.toLowerCase().includes(term) &&
            !entity.type.toLowerCase().includes(term)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory && entity.category !== selectedCategory) {
        return false;
      }

      // Type filter
      if (selectedType && entity.type !== selectedType) {
        return false;
      }

      // Tier filter
      if (selectedTier !== '' && entity.tier_number !== selectedTier) {
        return false;
      }

      // Entity class filter
      if (entityClassFilter === 'items' && entity.is_schematic) {
        return false;
      }
      if (entityClassFilter === 'schematics' && !entity.is_schematic) {
        return false;
      }

      return true;
    });

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [entities, searchTerm, selectedCategory, selectedType, selectedTier, entityClassFilter, existingEntityIds]);

  // Handle entity selection
  const toggleEntitySelection = (entity: Entity) => {
    const newLinks = new Map(entityLinks);
    
    if (newLinks.has(entity.id)) {
      newLinks.delete(entity.id);
    } else {
      newLinks.set(entity.id, {
        entity,
        quantity: 1,
        notes: '',
        isSelected: true
      });
    }
    
    setEntityLinks(newLinks);
  };

  // Update quantity for selected entity
  const updateEntityQuantity = (entityId: string, quantity: number) => {
    const newLinks = new Map(entityLinks);
    const linkData = newLinks.get(entityId);
    
    if (linkData && quantity > 0) {
      linkData.quantity = quantity;
      newLinks.set(entityId, linkData);
      setEntityLinks(newLinks);
    }
  };

  // Update notes for selected entity
  const updateEntityNotes = (entityId: string, notes: string) => {
    const newLinks = new Map(entityLinks);
    const linkData = newLinks.get(entityId);
    
    if (linkData) {
      linkData.notes = notes;
      newLinks.set(entityId, linkData);
      setEntityLinks(newLinks);
    }
  };

  // Submit entity links
  const handleSubmit = async () => {
    if (entityLinks.size === 0) return;

    try {
      setSubmitting(true);
      
      const linkPromises = Array.from(entityLinks.values()).map(linkData => {
        const createData: CreatePOIEntityLinkData = {
          poi_id: poiId,
          entity_id: linkData.entity.id,
          quantity: linkData.quantity,
          notes: linkData.notes.trim() || undefined,
          assignment_source: 'manual_link'
        };
        
        return poiEntityLinksAPI.linkEntityToPOI(createData, user?.id);
      });

      await Promise.all(linkPromises);
      
      // Notify parent component of updates
      onLinksUpdated?.();
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Failed to create entity links:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Clear all selections
  const clearSelections = () => {
    setEntityLinks(new Map());
  };

  if (!isOpen) return null;

  const selectedCount = entityLinks.size;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-amber-100"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Link Entities to POI
            </h2>
            <p className="text-amber-200/60 text-sm mt-1">
              Add items and schematics to: <span className="text-amber-300 font-medium">{poiTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-amber-200" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-6 border-b border-slate-700 bg-slate-800/50">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-300/60" />
            <input
              type="text"
              placeholder="Search entities by name, description, category, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Entity Class Filter */}
            <select
              value={entityClassFilter}
              onChange={(e) => setEntityClassFilter(e.target.value as 'all' | 'items' | 'schematics')}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-amber-100 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Types</option>
              <option value="items">Items Only</option>
              <option value="schematics">Schematics Only</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedType(''); // Reset type when category changes
              }}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-amber-100 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-amber-100 text-sm focus:outline-none focus:border-amber-500"
              disabled={!selectedCategory}
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-amber-100 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="">All Tiers</option>
              {Object.entries(TIER_NAMES).map(([tier, name]) => (
                <option key={tier} value={tier}>T{tier}: {name}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedType('');
                setSelectedTier('');
                setEntityClassFilter('all');
              }}
              className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-amber-200 rounded-lg text-sm transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Selected Entities Summary */}
        {selectedCount > 0 && (
          <div className="p-4 bg-amber-500/10 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-amber-200 text-sm">
                {selectedCount} entit{selectedCount === 1 ? 'y' : 'ies'} selected for linking
              </span>
              <button
                onClick={clearSelections}
                className="text-amber-300 hover:text-amber-200 text-sm underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Entity List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-amber-300 animate-spin" />
              <span className="ml-2 text-amber-200">Loading entities...</span>
            </div>
          ) : filteredEntities.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-amber-300/40 mx-auto mb-4" />
              <p className="text-amber-200/60">
                {entities.length === 0 ? 'No entities available' : 'No entities match your filters'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEntities.map(entity => {
                const isSelected = entityLinks.has(entity.id);
                const linkData = entityLinks.get(entity.id);
                
                return (
                  <div
                    key={entity.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-amber-500 bg-amber-500/10' 
                        : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                    }`}
                    onClick={() => !isSelected && toggleEntitySelection(entity)}
                  >
                    {/* Entity Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      {/* Icon */}
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 border border-slate-600 flex-shrink-0">
                        <ImagePreview
                          iconImageId={entity.icon_image_id}
                          iconFallback={entity.icon_fallback || (entity.is_schematic ? '📋' : '📦')}
                          size="sm"
                          className="w-full h-full"
                        />
                      </div>

                      {/* Name and Type */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-amber-100 truncate text-sm"
                            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                          {entity.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            entity.is_schematic 
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {entity.is_schematic ? 'Schematic' : 'Item'}
                          </span>
                          {entity.tier_number > 0 && (
                            <span className="px-2 py-0.5 bg-slate-700 text-amber-300 rounded text-xs font-medium border border-slate-600">
                              T{entity.tier_number}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <Check className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Plus className="w-5 h-5 text-amber-300/60" />
                        )}
                      </div>
                    </div>

                    {/* Entity Details */}
                    <div className="text-xs text-amber-200/60 mb-3">
                      <div>{entity.category} → {entity.type}</div>
                      {entity.subtype && <div>Subtype: {entity.subtype}</div>}
                    </div>

                    {/* Link Configuration (if selected) */}
                    {isSelected && linkData && (
                      <div className="space-y-3 pt-3 border-t border-amber-500/30" onClick={(e) => e.stopPropagation()}>
                        {/* Quantity */}
                        <div>
                          <label className="block text-xs text-amber-200/80 mb-1">Quantity:</label>
                          <input
                            type="number"
                            min="1"
                            value={linkData.quantity}
                            onChange={(e) => updateEntityQuantity(entity.id, parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-amber-100 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-xs text-amber-200/80 mb-1">Notes (optional):</label>
                          <input
                            type="text"
                            placeholder="e.g., Found in chest, rare spawn..."
                            value={linkData.notes}
                            onChange={(e) => updateEntityNotes(entity.id, e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEntitySelection(entity);
                          }}
                          className="text-xs text-red-400 hover:text-red-300 underline"
                        >
                          Remove from selection
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-200/60">
              {filteredEntities.length} entit{filteredEntities.length === 1 ? 'y' : 'ies'} available
              {existingEntityIds.length > 0 && (
                <span className="ml-2">
                  ({existingEntityIds.length} already linked)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-amber-200 hover:text-amber-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedCount === 0 || submitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Linking...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    <span>Link {selectedCount} Entit{selectedCount === 1 ? 'y' : 'ies'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POIEntityLinkingModal; 