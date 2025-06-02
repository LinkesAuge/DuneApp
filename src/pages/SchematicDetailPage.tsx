import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, FileText, Info, ExternalLink, Package } from 'lucide-react';
import { getSchematicWithLocations } from '../lib/api/poiItemLinks';
import { SchematicWithLocations, PoiLocationInfo } from '../types';
import { useAuth } from '../components/auth/AuthProvider';

const SchematicDetailPage: React.FC = () => {
  const { schematicId } = useParams<{ schematicId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schematic, setSchematic] = useState<SchematicWithLocations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schematicId) return;
    
    const fetchSchematic = async () => {
      try {
        setLoading(true);
        const data = await getSchematicWithLocations(schematicId);
        setSchematic(data);
      } catch (error) {
        console.error('Error fetching schematic:', error);
        setError('Failed to load schematic details');
      } finally {
        setLoading(false);
      }
    };

    fetchSchematic();
  }, [schematicId]);

  const navigateToLocation = (location: PoiLocationInfo) => {
    if (location.map_type === 'deep_desert' && location.coordinate) {
      navigate(`/deep-desert/grid/${location.coordinate}`);
    } else if (location.map_type === 'hagga_basin') {
      navigate('/hagga-basin');
    }
  };

  const navigateToItem = (itemId: string) => {
    navigate(`/items/${itemId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-200">Loading schematic details...</p>
        </div>
      </div>
    );
  }

  if (error || !schematic) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <Info className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-red-200 mb-2">Error Loading Schematic</h2>
          <p className="text-red-300 mb-4">{error || 'Schematic not found'}</p>
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
              {schematic.name}
            </h1>
            <p className="text-amber-200/80 text-lg">Schematic Details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Schematic Information
              </h2>
              
              <div className="space-y-4">
                {schematic.description && (
                  <div>
                    <label className="block text-sm font-medium text-amber-200/80 mb-1">Description</label>
                    <p className="text-amber-100">{schematic.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schematic.category && (
                    <div>
                      <label className="block text-sm font-medium text-amber-200/80 mb-1">Category</label>
                      <p className="text-amber-100">{schematic.category.name}</p>
                    </div>
                  )}
                  
                  {schematic.type && (
                    <div>
                      <label className="block text-sm font-medium text-amber-200/80 mb-1">Type</label>
                      <p className="text-amber-100">{schematic.type.name}</p>
                    </div>
                  )}
                  
                  {schematic.tier && (
                    <div>
                      <label className="block text-sm font-medium text-amber-200/80 mb-1">Tier</label>
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded text-sm font-medium"
                        style={{ backgroundColor: schematic.tier.color + '20', color: schematic.tier.color }}
                      >
                        {schematic.tier.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Custom Fields */}
                {schematic.field_values && Object.keys(schematic.field_values).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-amber-200/80 mb-2">Additional Details</label>
                    <div className="space-y-2">
                      {Object.entries(schematic.field_values).map(([key, value]) => (
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

            {/* Required Materials */}
            {schematic.required_materials && schematic.required_materials.length > 0 && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Required Materials ({schematic.required_materials.length})
                </h2>
                
                <div className="space-y-3">
                  {schematic.required_materials.map((material) => (
                    <div key={material.item_id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded border border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="text-amber-100 font-medium">{material.item_name}</div>
                        <span className="text-amber-200/60">x{material.quantity}</span>
                        {material.tier && (
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                            style={{ backgroundColor: material.tier.color + '20', color: material.tier.color }}
                          >
                            {material.tier.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-200/60 text-sm">
                          {material.available_locations?.length || 0} location{(material.available_locations?.length || 0) !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => navigateToItem(material.item_id)}
                          className="p-1 text-amber-200/60 hover:text-amber-200 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locations */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Locations ({schematic.poi_locations?.length || 0})
              </h2>
              
              {(!schematic.poi_locations || schematic.poi_locations.length === 0) ? (
                <p className="text-amber-200/60 text-center py-8">
                  No known locations for this schematic yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {schematic.poi_locations.map((location) => (
                    <div
                      key={location.poi_id}
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
            {/* Schematic Icon */}
            {schematic.icon_url && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
                <img src={schematic.icon_url} alt={schematic.name} className="w-24 h-24 mx-auto mb-4 rounded" />
                <p className="text-amber-200/60 text-sm">Schematic Icon</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-amber-200 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-amber-200/80">Locations</span>
                  <span className="text-amber-100 font-medium">{schematic.poi_locations?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200/80">Required Materials</span>
                  <span className="text-amber-100 font-medium">{schematic.required_materials?.length || 0}</span>
                </div>
                {schematic.required_materials && schematic.required_materials.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-amber-200/80">Materials w/ Locations</span>
                    <span className="text-green-300 font-medium">
                      {schematic.required_materials.filter(m => (m.available_locations?.length || 0) > 0).length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Recipe Completion */}
            {schematic.required_materials && schematic.required_materials.length > 0 && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-amber-200 mb-4">Recipe Status</h3>
                <div className="space-y-3">
                  {(() => {
                    const materialsWithLocations = schematic.required_materials!.filter(m => (m.available_locations?.length || 0) > 0).length;
                    const totalMaterials = schematic.required_materials!.length;
                    const completionPercentage = Math.round((materialsWithLocations / totalMaterials) * 100);
                    
                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-amber-200/80">Completion</span>
                          <span className="text-amber-100">{completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${completionPercentage}%`,
                              backgroundColor: completionPercentage === 100 ? '#10b981' : completionPercentage >= 50 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                        <p className="text-xs text-amber-200/60">
                          {materialsWithLocations} of {totalMaterials} materials have known locations
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchematicDetailPage; 