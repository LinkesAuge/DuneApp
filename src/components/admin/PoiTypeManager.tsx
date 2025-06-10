import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { PoiType } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { 
  Hexagon, 
  Plus, 
  Settings, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Upload, 
  Eye, 
  EyeOff,
  FolderPlus, 
  Edit,
  Circle,
  AlertTriangle 
} from 'lucide-react';

import { formatConversionStats } from '../../lib/imageUtils';

const MAX_ICON_SIZE = 48;
const POI_ICON_BUCKET = 'screenshots';
const POI_ICON_FOLDER = 'icons';

interface PoiTypeFormData {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  default_description: string | null;
  icon_has_transparent_background?: boolean;
}

interface CategoryData {
  name: string;
  displayInPanel: boolean;
  displayOrder: number;
  columnPreference: number; // 1=left, 2=right
  poiTypes: PoiType[];
  defaultVisible: boolean;
  availableOnDeepDesert: boolean;
  availableOnHaggaBasin: boolean;
}

interface PoiTypeManagerProps {
  poiTypes?: PoiType[];
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
  onDataChange?: () => void;
}

// Enhanced Category Edit Modal
const CategoryEditModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  category: CategoryData | null;
  onSave: (categoryName: string, displayInPanel: boolean, displayOrder: number, columnPreference: number, updatedTypes: PoiType[], defaultVisible: boolean, availableOnDeepDesert: boolean, availableOnHaggaBasin: boolean) => void;
  onAddNewType: (category: string) => void;
  onEditType: (type: PoiType) => void;
  onDeleteType: (typeId: string) => void;
  isIconUrl: (icon: string) => boolean;
  getDisplayImageUrl: (icon: string) => string;
}> = ({ 
  isOpen, 
  onClose, 
  category, 
  onSave, 
  onAddNewType,
  onEditType,
  onDeleteType,
  isIconUrl, 
  getDisplayImageUrl 
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [displayInPanel, setDisplayInPanel] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [columnPreference, setColumnPreference] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // NEW: Visibility and map availability state
  const [defaultVisible, setDefaultVisible] = useState(true);
  const [availableOnDeepDesert, setAvailableOnDeepDesert] = useState(true);
  const [availableOnHaggaBasin, setAvailableOnHaggaBasin] = useState(true);

  useEffect(() => {
    if (category) {
      setCategoryName(category.name);
      setDisplayInPanel(category.displayInPanel);
      setDisplayOrder(category.displayOrder);
      setColumnPreference(category.columnPreference);
      setDefaultVisible(category.defaultVisible);
      setAvailableOnDeepDesert(category.availableOnDeepDesert);
      setAvailableOnHaggaBasin(category.availableOnHaggaBasin);
    }
  }, [category]);

  const handleSave = async () => {
    if (!category || !categoryName.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave(categoryName.trim(), displayInPanel, displayOrder, columnPreference, category.poiTypes, defaultVisible, availableOnDeepDesert, availableOnHaggaBasin);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div 
      className="fixed inset-0 bg-night-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-lg border border-gold-300/40 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(42, 36, 56, 0.95)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Purple accent overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%)'
          }}
        />
        
        <div className="relative z-10 flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gold-300/20">
            <h3 className="text-xl font-medium text-amber-200 tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {category.name ? `Edit Category: ${category.name}` : 'Create New Category'}
            </h3>
            <button
              onClick={onClose}
              className="text-amber-200/70 hover:text-amber-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Category Settings */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Category Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded text-amber-200 
                           focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="displayInPanel"
                  checked={displayInPanel}
                  onChange={(e) => setDisplayInPanel(e.target.checked)}
                  className="w-5 h-5 text-gold-300 bg-void-950/60 border-gold-300/50 rounded 
                           focus:ring-gold-300/50 focus:ring-2"
                />
                <label htmlFor="displayInPanel" className="text-sm font-medium text-amber-200 flex items-center">
                  {displayInPanel ? <Eye size={16} className="mr-2 text-green-400" /> : <EyeOff size={16} className="mr-2 text-gray-400" />}
                  Display in Map Control Panel
                </label>
              </div>
            </div>
            
            {/* Display Order and Column Settings */}
            {displayInPanel && (
              <div className="grid grid-cols-2 gap-6 p-4 rounded-lg bg-void-950/30 border border-gold-300/20">
                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded text-amber-200 
                             focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  />
                  <p className="text-amber-300/60 text-xs mt-1">Lower numbers appear first</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-2">Column Preference</label>
                  <select
                    value={columnPreference}
                    onChange={(e) => setColumnPreference(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded text-amber-200 
                             focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  >
                    <option value={1} className="bg-void-950 text-amber-200">Left Column</option>
                    <option value={2} className="bg-void-950 text-amber-200">Right Column</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* NEW: Visibility and Map Availability Settings */}
            <div className="space-y-4 p-4 rounded-lg bg-void-950/30 border border-gold-300/20">
              <h4 className="text-sm font-medium text-amber-200">Visibility & Map Availability</h4>
              
              {/* Default Visibility */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="defaultVisible"
                  checked={defaultVisible}
                  onChange={(e) => setDefaultVisible(e.target.checked)}
                  className="w-5 h-5 text-gold-300 bg-void-950/60 border-gold-300/50 rounded 
                           focus:ring-gold-300/50 focus:ring-2"
                />
                <label htmlFor="defaultVisible" className="text-sm font-medium text-amber-200 flex items-center">
                  {defaultVisible ? <Eye size={16} className="mr-2 text-green-400" /> : <EyeOff size={16} className="mr-2 text-gray-400" />}
                  Show by default when users first load the map
                </label>
              </div>
              
              {/* Map Availability */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="availableOnDeepDesert"
                    checked={availableOnDeepDesert}
                    onChange={(e) => setAvailableOnDeepDesert(e.target.checked)}
                    className="w-5 h-5 text-gold-300 bg-void-950/60 border-gold-300/50 rounded 
                             focus:ring-gold-300/50 focus:ring-2"
                  />
                  <label htmlFor="availableOnDeepDesert" className="text-sm font-medium text-amber-200">
                    Available on Deep Desert
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="availableOnHaggaBasin"
                    checked={availableOnHaggaBasin}
                    onChange={(e) => setAvailableOnHaggaBasin(e.target.checked)}
                    className="w-5 h-5 text-gold-300 bg-void-950/60 border-gold-300/50 rounded 
                             focus:ring-gold-300/50 focus:ring-2"
                  />
                  <label htmlFor="availableOnHaggaBasin" className="text-sm font-medium text-amber-200">
                    Available on Hagga Basin
                  </label>
                </div>
              </div>
              
              <p className="text-amber-300/60 text-xs">
                Categories not available on a map will not appear in that map's POI control panel or filters.
              </p>
            </div>
            
            {/* POI Types in Category */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-amber-200">POI Types in this Category</h4>
                <button
                  onClick={() => onAddNewType(category.name)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-900 rounded-lg 
                           font-medium transition-all duration-300 hover:from-amber-500 hover:to-amber-400
                           flex items-center gap-2"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  <Plus size={16} />
                  Add POI Type
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {category.poiTypes.map(type => (
                  <div key={type.id} className="relative overflow-hidden rounded-lg border border-gold-300/20 bg-void-950/40 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                          {isIconUrl(type.icon) ? (
                            <img
                              src={getDisplayImageUrl(type.icon)}
                              alt={type.name}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <span 
                              className="text-2xl"
                              style={{ color: type.color }}
                            >
                              {type.icon}
                            </span>
                          )}
                        </div>
                        <div>
                          <h5 className="text-amber-200 font-medium">{type.name}</h5>
                          <p className="text-amber-300/70 text-sm">{type.default_description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEditType(type)}
                          className="p-2 text-amber-300 hover:text-amber-200 transition-colors"
                          title="Edit POI Type"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteType(type.id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          title="Delete POI Type"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {category.poiTypes.length === 0 && (
                <div className="text-center py-12 border border-gold-300/20 rounded-lg bg-void-950/20">
                  <p className="text-amber-300/70">No POI types in this category yet</p>
                  <p className="text-amber-300/50 text-sm mt-1">Add your first POI type to get started</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gold-300/20">
            <button
              onClick={onClose}
              className="px-6 py-2 text-amber-200/70 hover:text-amber-200 border border-amber-200/30 
                       hover:border-amber-200/50 rounded transition-all duration-300"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !categoryName.trim()}
              className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-900 rounded
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                       font-medium hover:from-amber-500 hover:to-amber-400 flex items-center gap-2"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Delete Modal Component 
const DeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  orphanedCount?: number;
  onActionChange?: (action: 'set_undefined' | 'delete_all' | null) => void;
  selectedAction?: 'set_undefined' | 'delete_all' | null;
  type?: 'category' | 'poi_type';
}> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  orphanedCount = 0, 
  onActionChange,
  selectedAction,
  type 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-night-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-[10001]"
      onClick={onClose}
    >
      <div 
        className="relative max-w-md w-full rounded-lg border border-gold-300/40 backdrop-blur-md overflow-hidden"
        style={{ backgroundColor: 'rgba(42, 36, 56, 0.95)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Purple accent overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%)'
          }}
        />
        
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-red-400 mr-3" size={24} />
            <h3 className="text-xl font-medium text-amber-200 tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {title}
            </h3>
          </div>
          
          <p className="text-amber-300/80 mb-6 leading-relaxed"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            {message}
          </p>
          
          {orphanedCount > 0 && onActionChange && (
            <div className="mb-6 p-4 rounded-lg border border-yellow-400/30 bg-yellow-400/10">
              <p className="text-amber-200 mb-3 text-sm font-medium">
                This will affect {orphanedCount} existing {type === 'category' ? 'POI types' : 'POIs'}. 
                What should happen to them?
              </p>
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="deleteAction"
                    value="set_undefined"
                    checked={selectedAction === 'set_undefined'}
                    onChange={(e) => onActionChange(e.target.value as 'set_undefined')}
                    className="mt-1 w-4 h-4 text-gold-300 bg-void-950/60 border-gold-300/50 
                             focus:ring-gold-300/50 focus:ring-2"
                  />
                  <div>
                    <span className="text-amber-200 text-sm font-medium group-hover:text-amber-100 transition-colors">
                      Move to "Undefined" category
                    </span>
                    <p className="text-amber-300/60 text-xs mt-1">Preserve data by reassigning to undefined category</p>
                  </div>
                </label>
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="deleteAction"
                    value="delete_all"
                    checked={selectedAction === 'delete_all'}
                    onChange={(e) => onActionChange(e.target.value as 'delete_all')}
                    className="mt-1 w-4 h-4 text-red-400 bg-void-950/60 border-red-400/50 
                             focus:ring-red-400/50 focus:ring-2"
                  />
                  <div>
                    <span className="text-red-300 text-sm font-medium group-hover:text-red-200 transition-colors">
                      Delete all affected {type === 'category' ? 'POI types and POIs' : 'POIs'}
                    </span>
                    <p className="text-red-400/60 text-xs mt-1">⚠️ This action cannot be undone</p>
                  </div>
                </label>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-amber-200/70 hover:text-amber-200 border border-amber-200/30 
                       hover:border-amber-200/50 rounded transition-all duration-300"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={orphanedCount > 0 && !selectedAction}
              className="px-6 py-2 bg-red-500 hover:bg-red-400 text-white rounded 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                       font-medium tracking-wide"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const initialFormState: PoiTypeFormData = {
  id: '',
  name: '',
  icon: '',
  color: '#6B7280',
  category: '',
  default_description: '',
  icon_has_transparent_background: false,
};

const PoiTypeManager: React.FC<PoiTypeManagerProps> = ({
  poiTypes: externalPoiTypes,
  onError: externalOnError,
  onSuccess: externalOnSuccess,
  onDataChange
}) => {
  // Core data state
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingType, setIsEditingType] = useState(false);
  const [currentPoiType, setCurrentPoiType] = useState<PoiTypeFormData>(initialFormState);
  const [conversionStats, setConversionStats] = useState<string | null>(null);

  // Modal states
  const [categoryEditModal, setCategoryEditModal] = useState<{
    isOpen: boolean;
    category: CategoryData | null;
  }>({
    isOpen: false,
    category: null
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'category' | 'poi_type';
    item: any;
    orphanedCount: number;
    selectedAction: 'set_undefined' | 'delete_all' | null;
  }>({
    isOpen: false,
    type: 'category',
    item: null,
    orphanedCount: 0,
    selectedAction: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper functions for error and success handling
  const handleError = (error: string) => {
    if (externalOnError) {
      externalOnError(error);
    } else {
      toast.error(error);
    }
  };

  const handleSuccess = (message: string) => {
    if (externalOnSuccess) {
      externalOnSuccess(message);
    } else {
      toast.success(message);
    }
    if (onDataChange) {
      onDataChange();
    }
    
    // Emit event to notify other components (like map pages) that admin data has been updated
    window.dispatchEvent(new CustomEvent('adminDataUpdated'));
  };

  useEffect(() => {
    if (externalPoiTypes) {
      setPoiTypes(externalPoiTypes);
      processCategories(externalPoiTypes);
    } else {
      fetchData();
    }
  }, [externalPoiTypes]);

  // Clear conversion stats after 5 seconds
  useEffect(() => {
    if (conversionStats) {
      const timer = setTimeout(() => setConversionStats(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [conversionStats]);

  const processCategories = (types: PoiType[]) => {
    const categoryMap = new Map<string, PoiType[]>();
    
    types.forEach(type => {
      const category = type.category || 'Undefined';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(type);
    });

    const categoryData: CategoryData[] = Array.from(categoryMap.entries()).map(([name, poiTypes]) => {
      // Get ordering info from the first POI type in the category (they should all have the same values)
      const firstType = poiTypes[0];
      return {
        name,
        displayInPanel: poiTypes.some(type => type.display_in_panel === true),
        displayOrder: firstType?.category_display_order || 0,
        columnPreference: firstType?.category_column_preference || 1,
        poiTypes: poiTypes.sort((a, b) => a.name.localeCompare(b.name)),
        defaultVisible: firstType?.default_visible || false,
        availableOnDeepDesert: firstType?.available_on_deep_desert || false,
        availableOnHaggaBasin: firstType?.available_on_hagga_basin || false,
      };
    });

    // Sort categories by display order
    setCategories(categoryData.sort((a, b) => a.displayOrder - b.displayOrder));
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchPoiTypes();
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load data.');
      handleError('Failed to load data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPoiTypes = async () => {
    const { data, error: fetchError } = await supabase
      .from('poi_types')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (fetchError) throw fetchError;
    
    const types = data || [];
    setPoiTypes(types);
    processCategories(types);
  };

  const handleDeleteCategory = async (categoryName: string) => {
    // Count POIs that would be orphaned
    const orphanedCount = poiTypes.filter(type => type.category === categoryName).length;
    
    setDeleteModal({
      isOpen: true,
      type: 'category',
      item: { name: categoryName },
      orphanedCount,
      selectedAction: null
    });
  };

  const handleDeletePoiType = async (typeId: string) => {
    const type = poiTypes.find(t => t.id === typeId);
    if (!type) return;

    try {
      // Count POIs that would be orphaned
      const { data: poisUsingType, error } = await supabase
        .from('pois')
        .select('id')
        .eq('poi_type_id', type.id);

      if (error) {
        console.error('Error counting POIs:', error);
        handleError('Failed to check POI usage');
        return;
      }

      setDeleteModal({
        isOpen: true,
        type: 'poi_type',
        item: type,
        orphanedCount: poisUsingType?.length || 0,
        selectedAction: null
      });
    } catch (err: any) {
      console.error('Error preparing delete:', err);
      handleError('Failed to prepare deletion');
    }
  };

  const confirmDelete = async () => {
    const { type, item, selectedAction } = deleteModal;
    if (!selectedAction && deleteModal.orphanedCount > 0) return;

    try {
      if (type === 'category') {
        if (selectedAction === 'delete_all' || deleteModal.orphanedCount === 0) {
          // Delete all POI types in this category
          const { error: typeError } = await supabase
            .from('poi_types')
            .delete()
            .eq('category', item.name);

          if (typeError) throw typeError;
        } else if (selectedAction === 'set_undefined') {
          // Move POI types to 'Undefined' category
          const { error: updateError } = await supabase
            .from('poi_types')
            .update({ category: 'Undefined' })
            .eq('category', item.name);

          if (updateError) throw updateError;
        }
        
        handleSuccess('Category deleted successfully!');
      } else if (type === 'poi_type') {
        if (selectedAction === 'delete_all' || deleteModal.orphanedCount === 0) {
          // Delete POI type
          const { error } = await supabase
            .from('poi_types')
            .delete()
            .eq('id', item.id);

          if (error) throw error;
        } else if (selectedAction === 'set_undefined') {
          // First, ensure 'Undefined' POI type exists
          await ensureUndefinedPoiType();
          
          // Get the undefined POI type
          const { data: undefinedType, error: fetchError } = await supabase
            .from('poi_types')
            .select('id')
            .eq('name', 'Undefined')
            .eq('category', 'Undefined')
            .single();

          if (fetchError) throw fetchError;

          // Update all POIs to use undefined type
          const { error: updateError } = await supabase
            .from('pois')
            .update({ poi_type_id: undefinedType.id })
            .eq('poi_type_id', item.id);

          if (updateError) throw updateError;

          // Now delete the POI type
          const { error: deleteError } = await supabase
            .from('poi_types')
            .delete()
            .eq('id', item.id);

          if (deleteError) throw deleteError;
        }

        handleSuccess('POI type deleted successfully!');
      }

      // Close modal and refresh data
      setDeleteModal({ isOpen: false, type: 'category', item: null, orphanedCount: 0, selectedAction: null });
      await fetchData();
      
    } catch (err: any) {
      console.error('Error during delete:', err);
      handleError('Failed to delete: ' + err.message);
    }
  };

  const ensureUndefinedPoiType = async () => {
    // Check if 'Undefined' POI type exists
    const { data: existing, error: fetchError } = await supabase
      .from('poi_types')
      .select('id')
      .eq('name', 'Undefined')
      .eq('category', 'Undefined')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!existing) {
      // Create undefined POI type
      const { error: createError } = await supabase
        .from('poi_types')
        .insert([{
          name: 'Undefined',
          category: 'Undefined',
          icon: '❓',
          color: '#6B7280',
          default_description: 'Undefined POI type',
          icon_has_transparent_background: false
        }]);

      if (createError) throw createError;
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      handleError('Please upload a valid image file (PNG, JPEG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      handleError('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const uniqueId = uuidv4();
      const fileName = `${uniqueId}-${file.name.replace(/\.[^/.]+$/, '.webp')}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(POI_ICON_BUCKET)
        .upload(`${POI_ICON_FOLDER}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(POI_ICON_BUCKET)
        .getPublicUrl(`${POI_ICON_FOLDER}/${fileName}`);

      // Set the icon to the uploaded URL
      setCurrentPoiType(prev => ({ ...prev, icon: publicUrl }));
      
      // Show success message without triggering external callbacks that might close the modal
      toast.success('Icon uploaded successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      handleError('Failed to upload icon: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePoiTypeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!currentPoiType.name || !currentPoiType.icon || !currentPoiType.category) {
      handleError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get category info for default display settings
      const categoryData = categories.find(c => c.name === currentPoiType.category);
      
      const submitData = {
        name: currentPoiType.name,
        icon: currentPoiType.icon,
        color: currentPoiType.color,
        category: currentPoiType.category,
        default_description: currentPoiType.default_description || null,
        icon_has_transparent_background: currentPoiType.icon_has_transparent_background || false,
        display_in_panel: categoryData?.displayInPanel || false,
        category_display_order: categoryData?.displayOrder || 1,
        category_column_preference: categoryData?.columnPreference || 1,
      };

      if (isEditingType && currentPoiType.id) {
        const { data, error } = await supabase
          .from('poi_types')
          .update(submitData)
          .eq('id', currentPoiType.id)
          .select(); // Return the updated record

        if (error) {
          throw error;
        }
        handleSuccess('POI type updated successfully!');
      } else {
        const { data, error } = await supabase
          .from('poi_types')
          .insert([submitData])
          .select(); // Return the inserted record

        if (error) {
          throw error;
        }
        handleSuccess('POI type created successfully!');
      }
      await fetchData();
      handlePoiTypeCancel();
    } catch (err: any) {
      console.error('Error saving POI type:', err);

      handleError('Failed to save POI type: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPoiType = (type: PoiType) => {
    setCurrentPoiType({
      id: type.id,
      name: type.name,
      icon: type.icon,
      color: type.color,
      category: type.category,
      default_description: type.default_description,
      icon_has_transparent_background: type.icon_has_transparent_background || false,
    });
    setIsEditingType(true);
  };

  const handlePoiTypeCancel = () => {
    setCurrentPoiType(initialFormState);
    setIsEditingType(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setCurrentPoiType(prev => ({ ...prev, [name]: checked }));
    } else {
      setCurrentPoiType(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentPoiType(prev => ({ ...prev, color: e.target.value }));
  };

  const isIconUrl = (icon: string): boolean => {
    return icon.startsWith('http://') || icon.startsWith('https://');
  };

  const getDisplayImageUrl = (icon: string): string => {
    return icon;
  };

  // Enhanced POI type adding within category
  const handleAddNewTypeToCategory = (categoryName: string) => {
    setCurrentPoiType({ ...initialFormState, category: categoryName });
    setIsEditingType(true);
    setCategoryEditModal({ isOpen: false, category: null });
  };

  // Handle creating a new category
  const handleAddNewCategory = () => {
    // Create a temporary category for editing
    const newCategory: CategoryData = {
      name: '',
      displayInPanel: false,
      displayOrder: 1,
      columnPreference: 1,
      poiTypes: [],
      defaultVisible: false,
      availableOnDeepDesert: false,
      availableOnHaggaBasin: false,
    };
    setCategoryEditModal({ isOpen: true, category: newCategory });
  };

  // Enhanced category saving function that handles both new and existing categories
  const handleCategorySave = async (categoryName: string, displayInPanel: boolean, displayOrder: number, columnPreference: number, updatedTypes: PoiType[], defaultVisible: boolean, availableOnDeepDesert: boolean, availableOnHaggaBasin: boolean) => {
    try {
      const trimmedName = categoryName.trim();
      if (!trimmedName) {
        handleError('Category name is required');
        return;
      }

      // Check if this is a new category (no existing POI types)
      const existingCategory = categories.find(c => c.name === trimmedName);
      
      if (!existingCategory) {
        // Create new category by creating a default POI type
        const { error } = await supabase
          .from('poi_types')
          .insert([{
            name: `${trimmedName} Default`,
            category: trimmedName,
            icon: '📍',
            color: '#6B7280',
            default_description: `Default type for ${trimmedName} category`,
            icon_has_transparent_background: false,
            display_in_panel: displayInPanel,
            category_display_order: displayOrder,
            category_column_preference: columnPreference,
            default_visible: defaultVisible,
            available_on_deep_desert: availableOnDeepDesert,
            available_on_hagga_basin: availableOnHaggaBasin,
          }]);

        if (error) throw error;
        handleSuccess('Category created successfully!');
      } else {
        // Update existing category - update display_in_panel for all POI types in this category
        const { error } = await supabase
          .from('poi_types')
          .update({ 
            display_in_panel: displayInPanel,
            category_display_order: displayOrder,
            category_column_preference: columnPreference,
            default_visible: defaultVisible,
            available_on_deep_desert: availableOnDeepDesert,
            available_on_hagga_basin: availableOnHaggaBasin,
          })
          .eq('category', trimmedName);

        if (error) throw error;
        handleSuccess('Category updated successfully!');
      }

      setCategoryEditModal({ isOpen: false, category: null });
      await fetchData();
    } catch (err: any) {
      console.error('Error saving category:', err);
      handleError('Failed to save category: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full border border-gold-300/50 mb-6"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
            <Hexagon className="text-gold-300" size={24} />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-300 mx-auto mb-4"></div>
          <p className="text-gold-300 font-light tracking-wide"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Loading POI management...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-400/40 rounded-lg bg-red-950/20">
        <p className="text-red-300">Error: {error}</p>
        <button
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-light text-gold-300 flex items-center"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          <Hexagon className="mr-4 text-amber-200" size={28} />
          POI Definitions
        </h3>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="text-amber-300 hover:text-amber-200 transition-all duration-300 p-2 rounded-md border border-amber-300/30 hover:border-amber-200/40 hover:bg-amber-200/10 flex items-center"
            title="Refresh data"
          >
            <Settings size={18} className="mr-2" />
            Refresh
          </button>
          <button
            onClick={() => {
              setCurrentPoiType(initialFormState);
              setIsEditingType(true);
            }}
            className="text-green-300 hover:text-green-200 transition-all duration-300 p-2 rounded-md border border-green-300/30 hover:border-green-200/40 hover:bg-green-200/10 flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add New POI Type
          </button>
          <button
            onClick={handleAddNewCategory}
            className="text-purple-300 hover:text-purple-200 transition-all duration-300 p-2 rounded-md border border-purple-300/30 hover:border-purple-200/40 hover:bg-purple-200/10 flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add New Category
          </button>
        </div>
      </div>

      {/* Compact Categories and Types Display */}
      <div className="space-y-4">
        <h4 className="text-lg font-light text-gold-300 tracking-wide flex items-center"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          <FolderPlus className="mr-3 text-gold-200" size={20} />
          Categories & Types
        </h4>

        {/* Live Preview Section */}
        <div className="mb-6 p-4 rounded-lg bg-void-950/30 border border-gold-300/20">
          <h5 className="text-md font-light text-amber-200 mb-3 tracking-wide flex items-center"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            <Eye className="mr-2 text-gold-200" size={16} />
            Map Control Panel Preview
          </h5>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Left Column Preview */}
            <div className="border border-amber-400/20 rounded p-3 bg-slate-900/40">
              <h6 className="text-amber-200 text-xs font-medium mb-2">Left Column</h6>
              <div className="space-y-1">
                {categories
                  .filter(cat => cat.displayInPanel && cat.columnPreference === 1)
                  .map(category => (
                    <div key={`left-${category.name}`} className="flex items-center justify-between text-xs">
                      <span className="text-amber-200/80">{category.name}</span>
                      <span className="text-amber-300/60">#{category.displayOrder}</span>
                    </div>
                  ))}
                {categories.filter(cat => cat.displayInPanel && cat.columnPreference === 1).length === 0 && (
                  <span className="text-amber-300/50 text-xs italic">No categories</span>
                )}
              </div>
            </div>
            
            {/* Right Column Preview */}
            <div className="border border-amber-400/20 rounded p-3 bg-slate-900/40">
              <h6 className="text-amber-200 text-xs font-medium mb-2">Right Column</h6>
              <div className="space-y-1">
                {categories
                  .filter(cat => cat.displayInPanel && cat.columnPreference === 2)
                  .map(category => (
                    <div key={`right-${category.name}`} className="flex items-center justify-between text-xs">
                      <span className="text-amber-200/80">{category.name}</span>
                      <span className="text-amber-300/60">#{category.displayOrder}</span>
                    </div>
                  ))}
                {categories.filter(cat => cat.displayInPanel && cat.columnPreference === 2).length === 0 && (
                  <span className="text-amber-300/50 text-xs italic">No categories</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Other Types Preview */}
          {categories.filter(cat => !cat.displayInPanel).length > 0 && (
            <div className="mt-3 p-2 border border-slate-600/30 rounded bg-slate-800/30">
              <h6 className="text-amber-200 text-xs font-medium mb-1">Other Types</h6>
              <div className="flex flex-wrap gap-1">
                {categories
                  .filter(cat => !cat.displayInPanel)
                  .map(category => (
                    <span key={`other-${category.name}`} className="text-xs text-amber-300/60 px-2 py-1 bg-slate-700/40 rounded">
                      {category.name}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POI Type Form Modal */}
      {isEditingType && (
        <div 
          className="fixed inset-0 bg-night-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-[10000]"
          onClick={(e) => {
            // Only close if clicking the backdrop, not the modal content
            if (e.target === e.currentTarget) {
              handlePoiTypeCancel();
            }
          }}
        >
          <div 
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-lg border border-gold-400/40 bg-gold-950/30 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Purple accent overlay */}
            <div 
              className="absolute inset-0 rounded-lg opacity-20"
              style={{
                background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%)'
              }}
            />
            
            <div className="relative z-10">
            <h5 className="text-lg font-light text-gold-300 mb-6 tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {currentPoiType.id ? 'Edit POI Type' : 'Create New POI Type'}
            </h5>
            
            <form onSubmit={handlePoiTypeSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={currentPoiType.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded 
                             text-amber-200 placeholder-amber-200/40
                             focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                             transition-all duration-300"
                    placeholder="e.g., Spice Harvester"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={currentPoiType.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded 
                             text-amber-200 focus:outline-none focus:ring-2 focus:ring-gold-300/50
                             focus:border-gold-300/60 transition-all duration-300"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  >
                    <option value="" className="bg-void-950 text-amber-200">Select a category...</option>
                    {categories.map(category => (
                      <option key={category.name} value={category.name} className="bg-void-950 text-amber-200">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide">
                    Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      name="color"
                      value={currentPoiType.color}
                      onChange={handleColorChange}
                      className="w-16 h-12 bg-void-950/60 border border-gold-300/30 rounded cursor-pointer
                               focus:ring-2 focus:ring-gold-300/50 transition-all duration-300"
                    />
                    <input
                      type="text"
                      value={currentPoiType.color}
                      onChange={(e) => setCurrentPoiType(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded 
                               text-amber-200 focus:outline-none focus:ring-2 focus:ring-gold-300/50
                               focus:border-gold-300/60 transition-all duration-300"
                      placeholder="#HEXCODE"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    />
                  </div>
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide">
                    Icon *
                  </label>
                  <div className="space-y-2">
                    {/* Text Input */}
                    <input
                      type="text"
                      name="icon"
                      value={isIconUrl(currentPoiType.icon) ? '' : currentPoiType.icon}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-void-950/60 border border-gold-300/30 rounded 
                               text-amber-200 placeholder-amber-200/40
                               focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                               transition-all duration-300"
                      placeholder="🏜️ Enter emoji or text icon"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    />
                    
                    {/* Upload Button and Preview Row */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 py-2 bg-void-950/60 border border-gold-300/30 rounded 
                                 text-amber-200 hover:bg-gold-300/10 transition-all duration-300
                                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm
                                 focus:ring-2 focus:ring-gold-300/50"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-200 mr-2"></div>
                        ) : (
                          <Upload size={14} className="mr-2" />
                        )}
                        Upload Image
                      </button>
                      
                      {/* Icon Preview */}
                      {currentPoiType.icon && (
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-200/70 text-xs">Preview:</span>
                          {isIconUrl(currentPoiType.icon) ? (
                            <img
                              src={currentPoiType.icon}
                              alt="Icon preview"
                              className="w-6 h-6 rounded border border-gold-300/30"
                              style={{
                                backgroundColor: currentPoiType.icon_has_transparent_background ? 'transparent' : currentPoiType.color
                              }}
                            />
                          ) : (
                            <span className="text-xl" style={{ color: currentPoiType.color }}>
                              {currentPoiType.icon}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Description */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide">
                  Default Description
                </label>
                <textarea
                  name="default_description"
                  value={currentPoiType.default_description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded 
                           text-amber-200 placeholder-amber-200/40
                           focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                           resize-none transition-all duration-300"
                  placeholder="Optional default description for new POIs of this type..."
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                />
              </div>

              {/* Transparent Background Checkbox */}
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-void-950/30 border border-gold-300/20">
                <input
                  type="checkbox"
                  name="icon_has_transparent_background"
                  checked={currentPoiType.icon_has_transparent_background || false}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-gold-300 bg-void-950/60 border-gold-300/30 rounded 
                           focus:ring-gold-300/50 focus:ring-2"
                />
                <label className="text-amber-200 text-sm font-light tracking-wide cursor-pointer"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Icon has transparent background (don't apply color overlay)
                </label>
              </div>

              {/* Conversion Stats Display */}
              {conversionStats && (
                <div className="p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
                  <p className="text-green-300 text-sm">
                    ✓ {conversionStats}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gold-300/20">
                <button
                  type="button"
                  onClick={handlePoiTypeCancel}
                  className="px-6 py-3 text-amber-200/70 hover:text-amber-200 border border-amber-200/30 
                           hover:border-amber-200/50 rounded transition-all duration-300 tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading || !currentPoiType.name || !currentPoiType.icon || !currentPoiType.category}
                  className="px-6 py-3 bg-gold-300 hover:bg-amber-200 text-void-950 rounded 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                           flex items-center font-medium tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-void-950 mr-2"></div>
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  {currentPoiType.id ? 'Update POI Type' : 'Create POI Type'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: 'category', item: null, orphanedCount: 0, selectedAction: null })}
        onConfirm={confirmDelete}
        title={`Delete ${deleteModal.type === 'category' ? 'Category' : 'POI Type'}`}
        message={
          deleteModal.type === 'category'
            ? `Are you sure you want to delete the category "${deleteModal.item?.name}"? This action cannot be undone.`
            : `Are you sure you want to delete the POI type "${deleteModal.item?.name}"? This action cannot be undone.`
        }
        orphanedCount={deleteModal.orphanedCount}
        onActionChange={(action) => setDeleteModal(prev => ({ ...prev, selectedAction: action }))}
        selectedAction={deleteModal.selectedAction}
        type={deleteModal.type}
      />

      {/* Category Edit Modal */}
      {categoryEditModal.isOpen && (
        <CategoryEditModal
          isOpen={categoryEditModal.isOpen}
          onClose={() => setCategoryEditModal({ isOpen: false, category: null })}
          category={categoryEditModal.category}
          onSave={handleCategorySave}
          onAddNewType={handleAddNewTypeToCategory}
          onEditType={handleEditPoiType}
          onDeleteType={handleDeletePoiType}
          isIconUrl={isIconUrl}
          getDisplayImageUrl={getDisplayImageUrl}
        />
      )}

      {/* Hidden file input for icon upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="space-y-3 mb-6">
        {categories.map((category) => {
          const categoryPoiTypes = poiTypes.filter(type => type.category === category.name);
          const isUndefinedCategory = category.name === "Undefined";
          
          return (
            <div key={category.name} className="group relative">
              <div className="relative p-4 rounded-lg border border-gold-300/20 bg-void-950/40 hover:bg-gold-300/5 transition-all duration-300">
                {/* Purple hover overlay */}
                <div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%)'
                  }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-amber-200 font-medium text-lg tracking-wide"
                             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                          {category.name}
                        </span>
                        <span className="ml-3 text-amber-200/60 text-sm">
                          ({categoryPoiTypes.length} type{categoryPoiTypes.length !== 1 ? 's' : ''})
                        </span>
                        {category.displayInPanel && (
                          <span className="px-2 py-1 bg-green-500/20 border border-green-400/30 rounded text-green-300 text-xs flex items-center">
                            <Eye size={12} className="mr-1" />
                            In Panel
                          </span>
                        )}
                        <span className="px-2 py-1 bg-amber-500/20 border border-amber-400/30 rounded text-amber-300 text-xs">
                          {category.columnPreference === 1 ? 'Left' : 'Right'} #{category.displayOrder}
                        </span>
                      </div>
                      
                      {/* Compact POI types preview */}
                      <div className="flex flex-wrap gap-2">
                        {categoryPoiTypes.slice(0, 8).map(type => (
                          <div key={type.id} className="flex items-center space-x-1 px-2 py-1 bg-void-950/60 rounded border border-gold-300/20 text-xs">
                            {isIconUrl(type.icon) ? (
                              <img
                                src={type.icon}
                                alt={type.name}
                                className="w-4 h-4 object-contain"
                              />
                            ) : (
                              <span style={{ color: type.color }}>{type.icon}</span>
                            )}
                            <span className="text-amber-200/80 truncate max-w-16">{type.name}</span>
                          </div>
                        ))}
                        {categoryPoiTypes.length > 8 && (
                          <span className="px-2 py-1 text-amber-300/60 text-xs">
                            +{categoryPoiTypes.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => setCategoryEditModal({ isOpen: true, category })}
                        className="p-2 text-gold-300 hover:text-amber-200 transition-colors duration-300 rounded"
                        title="Edit category"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.name)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors duration-300 rounded"
                        title="Delete category"
                        disabled={isUndefinedCategory}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PoiTypeManager;