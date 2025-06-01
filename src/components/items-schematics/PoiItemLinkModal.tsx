import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, FileText, Check, Plus, Link2 } from 'lucide-react';
import type { 
  PoiItemLink, 
  Poi, 
  Item, 
  Schematic, 
  PoiType,
  ItemWithRelations,
  SchematicWithRelations 
} from '../../types';
import { createPoiItemLink, updatePoiItemLink, deletePoiItemLink } from '../../lib/api/poiItemLinks';
import { useAuth } from '../auth/AuthProvider';

interface PoiItemLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  
  // Context - what we're linking FROM
  poi?: Poi;
  item?: ItemWithRelations;
  schematic?: SchematicWithRelations;
  
  // Existing link for editing
  existingLink?: PoiItemLink;
  
  // Available options for linking
  availablePois?: Poi[];
  availableItems?: ItemWithRelations[];
  availableSchematics?: SchematicWithRelations[];
  poiTypes?: PoiType[];
}

const LINK_TYPES = [
  { value: 'found_here', label: 'Found Here', description: 'Item can be found at this POI', icon: MapPin },
  { value: 'material_source', label: 'Material Source', description: 'POI that is a source for this item', icon: Package }
] as const;

export default function PoiItemLinkModal({
  isOpen,
  onClose,
  onSuccess,
  poi,
  item,
  schematic,
  existingLink,
  availablePois = [],
  availableItems = [],
  availableSchematics = [],
  poiTypes = []
}: PoiItemLinkModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    poi_id: poi?.id || existingLink?.poi_id || '',
    item_id: item?.id || existingLink?.item_id || '',
    schematic_id: schematic?.id || existingLink?.schematic_id || '',
    link_type: existingLink?.link_type || 'found_here' as const,
    quantity: existingLink?.quantity || null,
    notes: existingLink?.notes || ''
  });

  // Reset form when modal opens/closes or context changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        poi_id: poi?.id || existingLink?.poi_id || '',
        item_id: item?.id || existingLink?.item_id || '',
        schematic_id: schematic?.id || existingLink?.schematic_id || '',
        link_type: existingLink?.link_type || 'found_here',
        quantity: existingLink?.quantity || null,
        notes: existingLink?.notes || ''
      });
      setError(null);
    }
  }, [isOpen, poi, item, schematic, existingLink]);

  // Determine modal mode
  const isEditing = !!existingLink;
  const linkingFromPoi = !!poi;
  const linkingFromItem = !!item;
  const linkingFromSchematic = !!schematic;

  // Get POI type for display
  const selectedPoi = availablePois.find(p => p.id === formData.poi_id) || poi;
  const selectedPoiType = selectedPoi ? poiTypes.find(pt => pt.id === selectedPoi.poi_type_id) : null;

  // Validation
  const canSubmit = formData.poi_id && 
    (formData.item_id || formData.schematic_id) && 
    formData.link_type &&
    user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isEditing && existingLink) {
        // Update existing link
        await updatePoiItemLink(
          existingLink.id,
          {
            link_type: formData.link_type,
            quantity: formData.quantity,
            notes: formData.notes || null
          },
          user.id
        );
      } else {
        // Create new link
        await createPoiItemLink({
          poi_id: formData.poi_id,
          item_id: formData.item_id || null,
          schematic_id: formData.schematic_id || null,
          link_type: formData.link_type,
          quantity: formData.quantity,
          notes: formData.notes || null,
          created_by: user.id
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingLink || !window.confirm('Are you sure you want to delete this link?')) return;

    setIsLoading(true);
    try {
      await deletePoiItemLink(existingLink.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="group relative max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Multi-layer background for Dune aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
        
        <div className="relative bg-slate-900 border border-slate-700 rounded-lg shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-amber-400/20">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-slate-800 border border-slate-600 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-200"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {isEditing ? 'Edit POI Link' : 'Create POI Link'}
                </h2>
                <p className="text-sm text-amber-200/60 font-light tracking-wide"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {linkingFromPoi && 'Link items/schematics to this POI'}
                  {linkingFromItem && 'Link this item to POIs'}
                  {linkingFromSchematic && 'Link this schematic to POIs'}
                  {!linkingFromPoi && !linkingFromItem && !linkingFromSchematic && 'Create a new POI-Item link'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/20 rounded p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-red-500/5 to-transparent rounded-lg" />
                
                <div className="relative p-4 rounded-lg border border-red-400/40">
                  <p className="text-red-300 font-light"
                     style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* POI Selection */}
            {!linkingFromPoi && (
              <div>
                <label className="block text-sm font-light text-amber-200 mb-2 tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  POI Location
                </label>
                <select
                  value={formData.poi_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, poi_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 
                           focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  required
                >
                  <option value="">Select a POI...</option>
                  {availablePois.map(p => {
                    const poiType = poiTypes.find(pt => pt.id === p.poi_type_id);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.title} ({poiType?.name || 'Unknown Type'}) - {p.map_type === 'deep_desert' ? `Grid ${p.grid_square_id}` : 'Hagga Basin'}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* POI Display (when linking from POI) */}
            {linkingFromPoi && poi && (
              <div className="bg-slate-800/60 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-200"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {poi.title}
                    </h3>
                    <p className="text-sm text-amber-200/70 font-light"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {selectedPoiType?.name} • {poi.map_type === 'deep_desert' ? `Grid ${poi.grid_square_id}` : 'Hagga Basin'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Item/Schematic Selection */}
            {!linkingFromItem && !linkingFromSchematic && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item Selection */}
                <div>
                  <label className="block text-sm font-light text-amber-200 mb-2 tracking-wide"
                         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Item
                  </label>
                  <select
                    value={formData.item_id}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      item_id: e.target.value,
                      schematic_id: e.target.value ? '' : prev.schematic_id 
                    }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 
                             focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    disabled={!!formData.schematic_id}
                  >
                    <option value="">Select an item...</option>
                    {availableItems.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.category?.name || 'No Category'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Schematic Selection */}
                <div>
                  <label className="block text-sm font-light text-amber-200 mb-2 tracking-wide"
                         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Schematic
                  </label>
                  <select
                    value={formData.schematic_id}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      schematic_id: e.target.value,
                      item_id: e.target.value ? '' : prev.item_id 
                    }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 
                             focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    disabled={!!formData.item_id}
                  >
                    <option value="">Select a schematic...</option>
                    {availableSchematics.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category?.name || 'No Category'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Item/Schematic Display (when linking from item/schematic) */}
            {(linkingFromItem && item) && (
              <div className="bg-slate-800/60 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-200"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {item.name}
                    </h3>
                    <p className="text-sm text-amber-200/70 font-light"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {item.category?.name} • {item.tier?.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(linkingFromSchematic && schematic) && (
              <div className="bg-slate-800/60 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-200"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {schematic.name}
                    </h3>
                    <p className="text-sm text-amber-200/70 font-light"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {schematic.category?.name} • {schematic.tier?.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Link Type */}
            <div>
              <label className="block text-sm font-light text-amber-200 mb-3 tracking-wide"
                     style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Relationship Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {LINK_TYPES.map(type => {
                  const Icon = type.icon;
                  const isSelected = formData.link_type === type.value;
                  return (
                    <label
                      key={type.value}
                      className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-amber-500/60 bg-amber-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-800/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="link_type"
                        value={type.value}
                        checked={isSelected}
                        onChange={(e) => setFormData(prev => ({ ...prev, link_type: e.target.value as any }))}
                        className="sr-only"
                      />
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-slate-700 border border-slate-600'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            isSelected ? 'text-amber-400' : 'text-amber-200/60'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${
                            isSelected ? 'text-amber-200' : 'text-amber-200/80'
                          }`}
                             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                            {type.label}
                          </p>
                          <p className={`text-xs font-light ${
                            isSelected ? 'text-amber-200/80' : 'text-amber-200/60'
                          }`}
                             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                            {type.description}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Quantity (optional) */}
            <div>
              <label className="block text-sm font-light text-amber-200 mb-2 tracking-wide"
                     style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Quantity (optional)
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  quantity: e.target.value ? parseInt(e.target.value) : null 
                }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-slate-400
                         focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                placeholder="Enter quantity if relevant..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-light text-amber-200 mb-2 tracking-wide"
                     style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-slate-400
                         focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                placeholder="Add any additional notes about this relationship..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-amber-400/20">
              <div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-light text-red-300 bg-red-600/20 border border-red-600/40 rounded-lg 
                             hover:bg-red-600/30 hover:border-red-500/60 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  >
                    Delete Link
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-light text-amber-200/80 bg-slate-800 border border-slate-600 rounded-lg 
                           hover:bg-slate-700 hover:border-slate-500 transition-colors"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || isLoading}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-light text-amber-200 bg-amber-600/70 border border-amber-500/60 rounded-lg 
                           hover:bg-amber-600/80 hover:border-amber-500/80 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-amber-200/40 border-t-amber-200 rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>{isEditing ? 'Save Changes' : 'Create Link'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 