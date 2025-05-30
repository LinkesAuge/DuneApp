import React, { useState, useEffect } from 'react';
import { X, Plus, Folder, Users, Lock, Trash2, FolderPlus, Calendar, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { PoiCollection, PoiCollectionWithItems, Poi } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import DiamondIcon from '../common/DiamondIcon';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCollectionCreated?: (collection: PoiCollection) => void;
  onCollectionUpdated?: (collection: PoiCollection) => void;
  existingCollections: PoiCollection[];
  currentPoi?: Poi | null; // For adding POI to collection
}

interface NewCollectionForm {
  name: string;
  description: string;
  isPublic: boolean;
}

const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  onCollectionCreated,
  onCollectionUpdated,
  existingCollections,
  currentPoi
}) => {
  const { user } = useAuth();
  
  // Modal state
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  
  // New collection form state
  const [newCollection, setNewCollection] = useState<NewCollectionForm>({
    name: '',
    description: '',
    isPublic: false
  });
  
  // Collection management state
  const [collectionsWithItems, setCollectionsWithItems] = useState<PoiCollectionWithItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load collection details when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCollectionDetails();
    }
  }, [isOpen, existingCollections]);

  const loadCollectionDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const detailedCollections: PoiCollectionWithItems[] = [];
      
      for (const collection of existingCollections) {
        // Get collection items
        const { data: items, error: itemsError } = await supabase
          .from('poi_collection_items')
          .select('*')
          .eq('collection_id', collection.id);

        if (itemsError) throw itemsError;

        // Get POI details for the items
        const poiIds = items?.map(item => item.poi_id) || [];
        let pois: Poi[] = [];
        
        if (poiIds.length > 0) {
          const { data: poisData, error: poisError } = await supabase
            .from('pois')
            .select(`
              *,
              poi_types (*)
            `)
            .in('id', poiIds);

          if (poisError) throw poisError;
          pois = poisData || [];
        }

        detailedCollections.push({
          ...collection,
          items: items || [],
          pois
        });
      }

      setCollectionsWithItems(detailedCollections);
    } catch (err) {
      console.error('Error loading collection details:', err);
      setError('Failed to load collection details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!user || !newCollection.name.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('poi_collections')
        .insert({
          name: newCollection.name.trim(),
          description: newCollection.description.trim() || null,
          created_by: user.id,
          is_public: newCollection.isPublic
        })
        .select()
        .single();

      if (error) throw error;

      // Reset form
      setNewCollection({ name: '', description: '', isPublic: false });
      setActiveTab('browse');
      
      // Call callback
      if (onCollectionCreated) {
        onCollectionCreated(data);
      }

      // Reload collection details
      await loadCollectionDetails();
      
    } catch (err) {
      console.error('Error creating collection:', err);
      setError('Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const handleAddPoiToCollection = async (collectionId: string) => {
    if (!currentPoi) return;

    try {
      // Check if POI is already in collection
      const { data: existing } = await supabase
        .from('poi_collection_items')
        .select('*')
        .eq('collection_id', collectionId)
        .eq('poi_id', currentPoi.id)
        .single();

      if (existing) {
        setError('POI is already in this collection');
        return;
      }

      const { error } = await supabase
        .from('poi_collection_items')
        .insert({
          collection_id: collectionId,
          poi_id: currentPoi.id
        });

      if (error) throw error;

      // Reload collection details
      await loadCollectionDetails();
      
    } catch (err) {
      console.error('Error adding POI to collection:', err);
      setError('Failed to add POI to collection');
    }
  };

  const handleRemovePoiFromCollection = async (collectionId: string, poiId: string) => {
    try {
      const { error } = await supabase
        .from('poi_collection_items')
        .delete()
        .eq('collection_id', collectionId)
        .eq('poi_id', poiId);

      if (error) throw error;

      // Reload collection details
      await loadCollectionDetails();
      
    } catch (err) {
      console.error('Error removing POI from collection:', err);
      setError('Failed to remove POI from collection');
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('poi_collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      // Reload collection details
      await loadCollectionDetails();
      
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError('Failed to delete collection');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-50 p-4">
      <div className="group relative w-full max-w-2xl max-h-[90vh]">
        {/* Multi-layer background system */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-800/60 to-slate-900/90 rounded-lg" />
        
        <div className="relative rounded-lg border border-amber-400/20 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-amber-400/20">
            <div className="flex items-center gap-4">
              <DiamondIcon
                icon={<Folder size={18} strokeWidth={1.5} />}
                size="md"
                bgColor="bg-void-950"
                actualBorderColor="bg-gold-300"
                borderThickness={2}
                iconColor="text-gold-300"
              />
              <h3 className="text-xl font-light tracking-[0.15em] text-amber-200"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {currentPoi ? `Add "${currentPoi.title}" to Collection` : 'MANAGE COLLECTIONS'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="group/btn relative p-2 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-300" />
              <div className="absolute inset-0 border border-red-400/30 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-300" />
              <X className="relative w-5 h-5 text-amber-300/70 group-hover/btn:text-red-300 transition-all duration-300" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-amber-400/20">
            <button
              onClick={() => setActiveTab('browse')}
              className={`group/tab relative flex items-center gap-2 px-6 py-3 transition-all duration-300 ${
                activeTab === 'browse' ? 'z-10' : ''
              }`}
            >
              {/* Tab background */}
              <div className={`absolute inset-0 transition-all duration-300 ${
                activeTab === 'browse' 
                  ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20' 
                  : 'bg-gradient-to-r from-transparent via-transparent to-transparent group-hover/tab:from-violet-600/10 group-hover/tab:via-violet-500/15 group-hover/tab:to-violet-600/10'
              }`} />
              
              {/* Tab border */}
              <div className={`absolute inset-0 border transition-all duration-300 ${
                activeTab === 'browse' 
                  ? 'border-amber-400/50' 
                  : 'border-transparent group-hover/tab:border-violet-400/30'
              }`} />
              
              {/* Tab content */}
              <div className="relative flex items-center gap-2">
                <Folder className={`w-4 h-4 transition-all duration-300 ${
                  activeTab === 'browse' 
                    ? 'text-amber-300' 
                    : 'text-amber-400/70 group-hover/tab:text-amber-200'
                }`} />
                <span className={`font-light text-sm tracking-wide transition-all duration-300 ${
                  activeTab === 'browse' 
                    ? 'text-amber-200' 
                    : 'text-amber-300/70 group-hover/tab:text-amber-100'
                }`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Browse Collections
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('create')}
              className={`group/tab relative flex items-center gap-2 px-6 py-3 transition-all duration-300 ${
                activeTab === 'create' ? 'z-10' : ''
              }`}
            >
              {/* Tab background */}
              <div className={`absolute inset-0 transition-all duration-300 ${
                activeTab === 'create' 
                  ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20' 
                  : 'bg-gradient-to-r from-transparent via-transparent to-transparent group-hover/tab:from-violet-600/10 group-hover/tab:via-violet-500/15 group-hover/tab:to-violet-600/10'
              }`} />
              
              {/* Tab border */}
              <div className={`absolute inset-0 border transition-all duration-300 ${
                activeTab === 'create' 
                  ? 'border-amber-400/50' 
                  : 'border-transparent group-hover/tab:border-violet-400/30'
              }`} />
              
              {/* Tab content */}
              <div className="relative flex items-center gap-2">
                <FolderPlus className={`w-4 h-4 transition-all duration-300 ${
                  activeTab === 'create' 
                    ? 'text-amber-300' 
                    : 'text-amber-400/70 group-hover/tab:text-amber-200'
                }`} />
                <span className={`font-light text-sm tracking-wide transition-all duration-300 ${
                  activeTab === 'create' 
                    ? 'text-amber-200' 
                    : 'text-amber-300/70 group-hover/tab:text-amber-100'
                }`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Create New
                </span>
              </div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="group/error relative p-4">
              <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-red-900 to-red-950" />
              <div className="relative p-3 border-l-4 border-red-400/50">
                <div className="flex items-center gap-3">
                  <DiamondIcon
                    icon={<X size={14} strokeWidth={1.5} />}
                    size="sm"
                    bgColor="bg-red-900"
                    actualBorderColor="bg-red-400"
                    borderThickness={1}
                    iconColor="text-red-400"
                  />
                  <p className="text-red-300 text-sm font-light tracking-wide">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'browse' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spice-600 mx-auto"></div>
                    <p className="text-sand-600 mt-2">Loading collections...</p>
                  </div>
                ) : collectionsWithItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Folder className="w-12 h-12 text-sand-400 mx-auto mb-4" />
                    <p className="text-sand-600">No collections yet</p>
                    <p className="text-sand-500 text-sm">Create your first collection to organize POIs</p>
                  </div>
                ) : (
                  collectionsWithItems.map(collection => (
                    <div key={collection.id} className="border border-sand-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h4 className="font-medium text-sand-800">{collection.name}</h4>
                            {collection.is_public ? (
                              <Users className="w-4 h-4 text-blue-500 ml-2" title="Public" />
                            ) : (
                              <Lock className="w-4 h-4 text-sand-500 ml-2" title="Private" />
                            )}
                          </div>
                          {collection.description && (
                            <p className="text-sm text-sand-600">{collection.description}</p>
                          )}
                          <p className="text-xs text-sand-500 mt-1">
                            {collection.items.length} POI{collection.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        {/* Collection Actions */}
                        <div className="flex items-center space-x-2">
                          {currentPoi && (
                            <button
                              onClick={() => handleAddPoiToCollection(collection.id)}
                              className="btn btn-sm btn-primary"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                          {collection.created_by === user?.id && (
                            <button
                              onClick={() => handleDeleteCollection(collection.id)}
                              className="btn btn-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* POIs in Collection */}
                      {collection.pois && collection.pois.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-sand-700 uppercase tracking-wide">POIs in this collection:</p>
                          {collection.pois.map(poi => (
                            <div key={poi.id} className="flex items-center justify-between bg-sand-50 p-2 rounded">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-sand-800">{poi.title}</span>
                                <span className="text-xs text-sand-500 ml-2">({poi.map_type})</span>
                              </div>
                              {collection.created_by === user?.id && (
                                <button
                                  onClick={() => handleRemovePoiFromCollection(collection.id, poi.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'create' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sand-700 mb-2">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    value={newCollection.name}
                    onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter collection name..."
                    className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sand-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newCollection.description}
                    onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your collection..."
                    rows={3}
                    className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newCollection.isPublic}
                      onChange={(e) => setNewCollection(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded border-sand-300 text-spice-600 focus:ring-spice-500"
                    />
                    <span className="ml-2 text-sm text-sand-700">Make this collection public</span>
                  </label>
                  <p className="text-xs text-sand-500 mt-1">
                    Public collections can be viewed by all users
                  </p>
                </div>

                <button
                  onClick={handleCreateCollection}
                  disabled={creating || !newCollection.name.trim()}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Collection'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal; 