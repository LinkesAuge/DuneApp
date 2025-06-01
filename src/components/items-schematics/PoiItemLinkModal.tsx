import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, FileText, Check, Plus } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit POI Link' : 'Create POI Link'}
              </h2>
              <p className="text-sm text-gray-500">
                {linkingFromPoi && 'Link items/schematics to this POI'}
                {linkingFromItem && 'Link this item to POIs'}
                {linkingFromSchematic && 'Link this schematic to POIs'}
                {!linkingFromPoi && !linkingFromItem && !linkingFromSchematic && 'Create a new POI-Item link'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* POI Selection */}
          {!linkingFromPoi && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                POI Location
              </label>
              <select
                value={formData.poi_id}
                onChange={(e) => setFormData(prev => ({ ...prev, poi_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{poi.title}</h3>
                  <p className="text-sm text-gray-500">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item
                </label>
                <select
                  value={formData.item_id}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    item_id: e.target.value,
                    schematic_id: e.target.value ? '' : prev.schematic_id 
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schematic
                </label>
                <select
                  value={formData.schematic_id}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    schematic_id: e.target.value,
                    item_id: e.target.value ? '' : prev.item_id 
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.category?.name} • {item.tier?.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {(linkingFromSchematic && schematic) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{schematic.name}</h3>
                  <p className="text-sm text-gray-500">
                    {schematic.category?.name} • {schematic.tier?.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Link Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Relationship Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {LINK_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <label
                    key={type.value}
                    className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.link_type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="link_type"
                      value={type.value}
                      checked={formData.link_type === type.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, link_type: e.target.value as any }))}
                      className="sr-only"
                    />
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        formData.link_type === type.value ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          formData.link_type === type.value ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          formData.link_type === type.value ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {type.label}
                        </p>
                        <p className={`text-xs ${
                          formData.link_type === type.value ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {type.description}
                        </p>
                      </div>
                    </div>
                    {formData.link_type === type.value && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Quantity (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter quantity if relevant..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional notes about this relationship..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Delete Link
                </button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit || isLoading}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
  );
} 