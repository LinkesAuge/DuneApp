import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Info, ExternalLink } from 'lucide-react';
import { getItemWithLocations } from '../lib/api/poiItemLinks';
import { ItemWithLocations, PoiLocationInfo } from '../types';
import { useAuth } from '../components/auth/AuthProvider';

const ItemDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<ItemWithLocations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) return;
    
    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await getItemWithLocations(itemId);
        setItem(data);
      } catch (error) {
        console.error('Error fetching item:', error);
        setError('Failed to load item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  const navigateToLocation = (location: PoiLocationInfo) => {
    if (location.map_type === 'deep_desert' && location.coordinate) {
      navigate(`/deep-desert/grid/${location.coordinate}`);
    } else if (location.map_type === 'hagga_basin') {
      navigate('/hagga-basin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-200">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <Info className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-red-200 mb-2">Error Loading Item</h2>
          <p className="text-red-300 mb-4">{error || 'Item not found'}</p>
          <button
            onClick={() => navigate('/database')}
            className="px-4 py-2 bg-amber-600 text-slate-900 rounded hover:bg-amber-500 transition-colors"
          >
            Return to Database
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/database')}
            className="p-2 text-amber-200 hover:text-amber-100 hover:bg-slate-700 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-amber-100" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
              {item.name}
            </h1>
            <p className="text-amber-200/80 text-lg">Item Details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Item Information
              </h2>
              
              <div className="space-y-4">
                {item.description && (
                  <div>
                    <label className="block text-sm font-medium text-amber-200/80 mb-1">Description</label>
                    <p className="text-amber-100">{item.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.category && (
                    <div>
                      <label className="block text-sm font-medium text-amber-200/80 mb-1">Category</label>
                      <p className="text-amber-100">{item.category.name}</p>
                    </div>
                  )}
                  
                  {item.type && (
                    <div>
                      <label className="block text-sm font-medium text-amber-200/80 mb-1">Type</label>
                      <p className="text-amber-100">{item.type.name}</p>
                    </div>
                  )}
                  
                  {item.tier && (
                    <div>
                      <label className="block text-sm font-medium text-amber-200/80 mb-1">Tier</label>
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded text-sm font-medium"
                        style={{ backgroundColor: item.tier.color + '20', color: item.tier.color }}
                      >
                        {item.tier.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Custom Fields */}
                {item.field_values && Object.keys(item.field_values).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-amber-200/80 mb-2">Additional Details</label>
                    <div className="space-y-2">
                      {Object.entries(item.field_values).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1 border-b border-slate-600/50">
                          <span className="text-amber-200/80 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-amber-100">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* POI Locations */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Locations ({(item.poi_locations?.length || 0) + (item.crafting_locations?.length || 0)})
              </h2>
              
              {(!item.poi_locations || item.poi_locations.length === 0) && 
               (!item.crafting_locations || item.crafting_locations.length === 0) ? (
                <p className="text-amber-200/60 text-center py-8">
                  No known locations for this item yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {/* Combine both poi_locations and crafting_locations */}
                  {[...(item.poi_locations || []), ...(item.crafting_locations || [])].map((location) => (
                    <div
                      key={`${location.poi_id}-${location.link_type}`}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded border border-slate-600 hover:bg-slate-700 transition-colors cursor-pointer"
                      onClick={() => navigateToLocation(location)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {location.poi_type.icon_has_transparent_background && location.poi_type.icon?.startsWith('http') ? (
                            <img src={location.poi_type.icon} alt="" className="w-6 h-6" />
                          ) : (
                            <span>{location.poi_type.icon || '📍'}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-amber-100 font-medium">{location.poi_title}</p>
                          <p className="text-amber-200/60 text-sm">
                            {location.map_type === 'deep_desert' ? `Grid ${location.coordinate}` : 'Hagga Basin'}
                            {location.quantity && ` • Quantity: ${location.quantity}`}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-amber-200/60" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Item Icon */}
            {item.icon_url && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
                <img src={item.icon_url} alt={item.name} className="w-24 h-24 mx-auto mb-4 rounded" />
                <p className="text-amber-200/60 text-sm">Item Icon</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-amber-200 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-amber-200/80">Total Locations</span>
                  <span className="text-amber-100 font-medium">
                    {(item.poi_locations?.length || 0) + (item.crafting_locations?.length || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage; 