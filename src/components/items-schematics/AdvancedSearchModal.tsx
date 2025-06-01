import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Save, Bookmark, Trash2, Star, Clock, Tag } from 'lucide-react';
import { useItemsSchematics } from '../../hooks/useItemsSchematics';

// =================================
// Types and Interfaces
// =================================

interface SearchCriteria {
  name?: string;
  description?: string;
  category_id?: string;
  type_id?: string;
  tier_id?: string;
  dateRange?: {
    start?: string;
    end?: string;
    field: 'created_at' | 'updated_at';
  };
  customFields?: {
    field: string;
    operator: 'equals' | 'contains' | 'not_equals' | 'greater_than' | 'less_than';
    value: string;
  }[];
  tags?: string[];
}

interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  criteria: SearchCriteria;
  entityType: 'items' | 'schematics';
  isFavorite: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'items' | 'schematics';
  onSearch: (criteria: SearchCriteria) => void;
  currentCriteria?: SearchCriteria;
}

// =================================
// Mock Data for Development
// =================================

const mockCategories = [
  { id: 'weapons', name: 'Weapons' },
  { id: 'armor', name: 'Armor' },
  { id: 'tools', name: 'Tools' },
  { id: 'materials', name: 'Materials' }
];

const mockTypes = [
  { id: 'melee', name: 'Melee', category_id: 'weapons' },
  { id: 'ranged', name: 'Ranged', category_id: 'weapons' },
  { id: 'light', name: 'Light Armor', category_id: 'armor' },
  { id: 'heavy', name: 'Heavy Armor', category_id: 'armor' }
];

const mockTiers = [
  { id: 'makeshift', name: 'Makeshift' },
  { id: 'common', name: 'Common' },
  { id: 'rare', name: 'Rare' },
  { id: 'epic', name: 'Epic' }
];

// =================================
// Search Form Component
// =================================

const SearchForm: React.FC<{
  criteria: SearchCriteria;
  onChange: (criteria: SearchCriteria) => void;
  entityType: 'items' | 'schematics';
}> = ({ criteria, onChange, entityType }) => {
  const [customFieldInput, setCustomFieldInput] = useState({ field: '', operator: 'contains' as const, value: '' });

  const updateCriteria = (updates: Partial<SearchCriteria>) => {
    onChange({ ...criteria, ...updates });
  };

  const addCustomField = () => {
    if (customFieldInput.field && customFieldInput.value) {
      const existingFields = criteria.customFields || [];
      updateCriteria({
        customFields: [...existingFields, { ...customFieldInput }]
      });
      setCustomFieldInput({ field: '', operator: 'contains', value: '' });
    }
  };

  const removeCustomField = (index: number) => {
    const fields = criteria.customFields || [];
    updateCriteria({
      customFields: fields.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Text Search */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            value={criteria.name || ''}
            onChange={(e) => updateCriteria({ name: e.target.value })}
            placeholder={`Search ${entityType} names...`}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <input
            type="text"
            value={criteria.description || ''}
            onChange={(e) => updateCriteria({ description: e.target.value })}
            placeholder="Search descriptions..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Category/Type/Tier Filters */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Category</label>
          <select
            value={criteria.category_id || ''}
            onChange={(e) => updateCriteria({ category_id: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {mockCategories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Type</label>
          <select
            value={criteria.type_id || ''}
            onChange={(e) => updateCriteria({ type_id: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {mockTypes
              .filter(type => !criteria.category_id || type.category_id === criteria.category_id)
              .map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Tier</label>
          <select
            value={criteria.tier_id || ''}
            onChange={(e) => updateCriteria({ tier_id: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tiers</option>
            {mockTiers.map(tier => (
              <option key={tier.id} value={tier.id}>{tier.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">Date Range</label>
        <div className="grid grid-cols-3 gap-3">
          <select
            value={criteria.dateRange?.field || 'created_at'}
            onChange={(e) => updateCriteria({
              dateRange: {
                ...criteria.dateRange,
                field: e.target.value as 'created_at' | 'updated_at'
              }
            })}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at">Created Date</option>
            <option value="updated_at">Updated Date</option>
          </select>
          <input
            type="date"
            value={criteria.dateRange?.start || ''}
            onChange={(e) => updateCriteria({
              dateRange: {
                ...criteria.dateRange,
                field: criteria.dateRange?.field || 'created_at',
                start: e.target.value
              }
            })}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={criteria.dateRange?.end || ''}
            onChange={(e) => updateCriteria({
              dateRange: {
                ...criteria.dateRange,
                field: criteria.dateRange?.field || 'created_at',
                end: e.target.value
              }
            })}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Custom Fields */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">Custom Field Filters</label>
        
        {/* Existing Custom Fields */}
        {criteria.customFields && criteria.customFields.length > 0 && (
          <div className="space-y-2">
            {criteria.customFields.map((field, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">{field.field}</span>
                <span className="text-sm text-slate-500">{field.operator}</span>
                <span className="text-sm">{field.value}</span>
                <button
                  onClick={() => removeCustomField(index)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Custom Field */}
        <div className="grid grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Field name"
            value={customFieldInput.field}
            onChange={(e) => setCustomFieldInput({ ...customFieldInput, field: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={customFieldInput.operator}
            onChange={(e) => setCustomFieldInput({ ...customFieldInput, operator: e.target.value as any })}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="contains">Contains</option>
            <option value="equals">Equals</option>
            <option value="not_equals">Not Equals</option>
            <option value="greater_than">Greater Than</option>
            <option value="less_than">Less Than</option>
          </select>
          <input
            type="text"
            placeholder="Value"
            value={customFieldInput.value}
            onChange={(e) => setCustomFieldInput({ ...customFieldInput, value: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addCustomField}
            disabled={!customFieldInput.field || !customFieldInput.value}
            className="btn btn-secondary disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

// =================================
// Saved Searches Component
// =================================

const SavedSearches: React.FC<{
  savedSearches: SavedSearch[];
  entityType: 'items' | 'schematics';
  onLoad: (criteria: SearchCriteria) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}> = ({ savedSearches, entityType, onLoad, onDelete, onToggleFavorite }) => {
  const filteredSearches = savedSearches.filter(search => search.entityType === entityType);
  const favoriteSearches = filteredSearches.filter(search => search.isFavorite);
  const recentSearches = filteredSearches
    .filter(search => !search.isFavorite)
    .sort((a, b) => new Date(b.lastUsed || b.createdAt).getTime() - new Date(a.lastUsed || a.createdAt).getTime())
    .slice(0, 5);

  const SearchItem: React.FC<{ search: SavedSearch }> = ({ search }) => (
    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-slate-900">{search.name}</h4>
          {search.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
        </div>
        {search.description && (
          <p className="text-sm text-slate-600 mt-1">{search.description}</p>
        )}
        <p className="text-xs text-slate-500 mt-1">
          {search.lastUsed ? `Last used: ${new Date(search.lastUsed).toLocaleDateString()}` : `Created: ${new Date(search.createdAt).toLocaleDateString()}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleFavorite(search.id)}
          className="p-1 text-slate-400 hover:text-yellow-500"
        >
          <Star className={`w-4 h-4 ${search.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
        </button>
        <button
          onClick={() => onLoad(search.criteria)}
          className="btn btn-sm btn-primary"
        >
          Load
        </button>
        <button
          onClick={() => onDelete(search.id)}
          className="p-1 text-slate-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Favorites */}
      {favoriteSearches.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-slate-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Favorite Searches
          </h3>
          <div className="space-y-2">
            {favoriteSearches.map(search => (
              <SearchItem key={search.id} search={search} />
            ))}
          </div>
        </div>
      )}

      {/* Recent */}
      {recentSearches.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Recent Searches
          </h3>
          <div className="space-y-2">
            {recentSearches.map(search => (
              <SearchItem key={search.id} search={search} />
            ))}
          </div>
        </div>
      )}

      {filteredSearches.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Bookmark className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p>No saved searches yet</p>
          <p className="text-sm">Save your searches to access them quickly later</p>
        </div>
      )}
    </div>
  );
};

// =================================
// Save Search Modal
// =================================

const SaveSearchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Save Search</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Search Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for this search"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =================================
// Main Modal Component
// =================================

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  entityType,
  onSearch,
  currentCriteria = {}
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');
  const [criteria, setCriteria] = useState<SearchCriteria>(currentCriteria);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  // Load saved searches on component mount
  useEffect(() => {
    // TODO: Load from localStorage or API
    const saved = localStorage.getItem(`advanced-searches-${entityType}`);
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved searches:', error);
      }
    }
  }, [entityType]);

  // Save searches to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`advanced-searches-${entityType}`, JSON.stringify(savedSearches));
  }, [savedSearches, entityType]);

  const handleSearch = () => {
    onSearch(criteria);
    onClose();
  };

  const handleClearAll = () => {
    setCriteria({});
  };

  const handleSaveSearch = (name: string, description?: string) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      description,
      criteria,
      entityType,
      isFavorite: false,
      createdAt: new Date().toISOString()
    };

    setSavedSearches(prev => [...prev, newSearch]);
  };

  const handleLoadSearch = (loadedCriteria: SearchCriteria) => {
    setCriteria(loadedCriteria);
    setActiveTab('search');
  };

  const handleDeleteSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setSavedSearches(prev => prev.map(search => 
      search.id === id 
        ? { ...search, isFavorite: !search.isFavorite }
        : search
    ));
  };

  const hasActiveCriteria = Object.keys(criteria).some(key => {
    const value = criteria[key as keyof SearchCriteria];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== undefined && v !== '');
    }
    return value !== undefined && value !== '';
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Search - {entityType === 'items' ? 'Items' : 'Schematics'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Search Criteria
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'saved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Saved Searches ({savedSearches.filter(s => s.entityType === entityType).length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'search' ? (
              <SearchForm
                criteria={criteria}
                onChange={setCriteria}
                entityType={entityType}
              />
            ) : (
              <SavedSearches
                savedSearches={savedSearches}
                entityType={entityType}
                onLoad={handleLoadSearch}
                onDelete={handleDeleteSearch}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </div>

          {/* Footer */}
          {activeTab === 'search' && (
            <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearAll}
                  className="btn btn-secondary"
                  disabled={!hasActiveCriteria}
                >
                  Clear All
                </button>
                <button
                  onClick={() => setSaveModalOpen(true)}
                  disabled={!hasActiveCriteria}
                  className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save Search
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSearch}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Apply Search
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Search Modal */}
      <SaveSearchModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={handleSaveSearch}
      />
    </>
  );
};

export default AdvancedSearchModal; 