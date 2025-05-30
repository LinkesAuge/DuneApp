import React, { useState, useEffect, useRef } from 'react';
import { Settings, Save, RefreshCw, Map, Upload, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { HaggaBasinBaseMap } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface MapSettingsProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

interface MapSettings {
  showMapGrid: boolean;
  enableMapInteractions: boolean;
  iconScaling: number;
}

const MapSettings: React.FC<MapSettingsProps> = ({ onError, onSuccess }) => {
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    showMapGrid: true,
    enableMapInteractions: true,
    iconScaling: 1.0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [baseMaps, setBaseMaps] = useState<HaggaBasinBaseMap[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMapSettings();
    loadBaseMaps();
  }, []);

  const loadMapSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'map_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.setting_value) {
        setMapSettings(data.setting_value);
      }
    } catch (error: any) {
      console.error('Error loading map settings:', error);
      onError('Failed to load map settings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBaseMaps = async () => {
    try {
      const { data, error } = await supabase
        .from('hagga_basin_base_maps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBaseMaps(data || []);
    } catch (error: any) {
      console.error('Error loading base maps:', error);
      onError('Failed to load base maps');
    }
  };

  const saveMapSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'map_settings',
          setting_value: mapSettings
        });

      if (error) throw error;
      onSuccess('Map settings saved successfully');
    } catch (error: any) {
      console.error('Error saving map settings:', error);
      onError('Failed to save map settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setMapSettings({
      showMapGrid: true,
      enableMapInteractions: true,
      iconScaling: 1.0,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onError('Please upload a valid image file (PNG, JPEG, JPG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('File size should be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to storage
      const fileName = `base-map-${uuidv4()}-${file.name}`;
      const filePath = `hagga-basin/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);

      // Deactivate existing maps
      await supabase
        .from('hagga_basin_base_maps')
        .update({ is_active: false })
        .neq('id', '');

      // Insert new map
      const { error: insertError } = await supabase
        .from('hagga_basin_base_maps')
        .insert({
          name: file.name.replace(/\.[^/.]+$/, ''),
          image_url: publicUrl,
          is_active: true,
          created_by: (await supabase.auth.getUser()).data.user?.id || ''
        });

      if (insertError) throw insertError;

      await loadBaseMaps();
      onSuccess('Base map uploaded successfully!');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading base map:', error);
      onError('Failed to upload base map');
    } finally {
      setIsUploading(false);
    }
  };

  const setActiveBaseMap = async (mapId: string) => {
    try {
      await supabase
        .from('hagga_basin_base_maps')
        .update({ is_active: false })
        .neq('id', '');

      const { error } = await supabase
        .from('hagga_basin_base_maps')
        .update({ is_active: true })
        .eq('id', mapId);

      if (error) throw error;

      await loadBaseMaps();
      onSuccess('Base map activated successfully!');
    } catch (error: any) {
      console.error('Error setting active base map:', error);
      onError('Failed to activate base map');
    }
  };

  const deleteBaseMap = async (mapId: string) => {
    if (!confirm('Are you sure you want to delete this base map?')) {
      return;
    }

    try {
      const mapToDelete = baseMaps.find(map => map.id === mapId);
      if (!mapToDelete) return;

      // Delete from storage
      if (mapToDelete.image_url.includes('supabase')) {
        const urlParts = mapToDelete.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `hagga-basin/${fileName}`;
        
        await supabase.storage
          .from('screenshots')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('hagga_basin_base_maps')
        .delete()
        .eq('id', mapId);

      if (error) throw error;

      await loadBaseMaps();
      onSuccess('Base map deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting base map:', error);
      onError('Failed to delete base map');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full border border-gold-300/50 mb-6 bg-void-950/80">
            <Map className="text-gold-300" size={24} />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-300 mx-auto mb-4"></div>
          <p className="text-gold-300 font-light tracking-wide" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
            Loading map settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-light text-gold-300 flex items-center" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
          <Map className="mr-4 text-amber-200" size={28} />
          MAP SETTINGS
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={resetToDefaults}
            className="text-amber-200/70 hover:text-amber-200 transition-all duration-300 p-2 rounded-md border border-amber-200/30 hover:border-amber-200/40 hover:bg-amber-200/10 flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            <span className="text-sm font-light tracking-wide" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
              Reset
            </span>
          </button>
          <button
            onClick={saveMapSettings}
            disabled={isSaving}
            className="text-gold-300 hover:text-amber-200 transition-all duration-300 p-2 rounded-md border border-gold-300/30 hover:border-amber-200/40 hover:bg-amber-200/10 flex items-center disabled:opacity-50"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold-300 mr-2"></div>
            ) : (
              <Save size={16} className="mr-2" />
            )}
            <span className="text-sm font-light tracking-wide" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
              {isSaving ? 'Saving...' : 'Save'}
            </span>
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="rounded-lg border border-gold-300/30 backdrop-blur-md bg-void-950/60">
        <div className="p-4 border-b border-gold-300/20 bg-void-950/80">
          <h4 className="text-lg font-light text-gold-300 flex items-center" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
            <Settings className="mr-3 text-amber-200" size={20} />
            GENERAL SETTINGS
          </h4>
        </div>

        <div className="p-6 space-y-6">
          {/* Map Grid Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-amber-200 font-medium tracking-wide" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                Show Map Grid
              </label>
              <p className="text-amber-200/60 text-sm font-light mt-1">
                Display coordinate grid lines on the map
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mapSettings.showMapGrid}
                onChange={(e) => setMapSettings(prev => ({ ...prev, showMapGrid: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-void-950/60 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-300"></div>
            </label>
          </div>

          {/* Map Interactions Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-amber-200 font-medium tracking-wide" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                Enable Map Interactions
              </label>
              <p className="text-amber-200/60 text-sm font-light mt-1">
                Allow zooming, panning, and other map interactions
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mapSettings.enableMapInteractions}
                onChange={(e) => setMapSettings(prev => ({ ...prev, enableMapInteractions: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-void-950/60 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-300"></div>
            </label>
          </div>

          {/* Icon Scaling */}
          <div className="space-y-3">
            <div>
              <label className="text-amber-200 font-medium tracking-wide" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                Icon Scaling: {mapSettings.iconScaling}x
              </label>
              <p className="text-amber-200/60 text-sm font-light mt-1">
                Adjust the size of POI icons on the map
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-amber-200/60 text-sm">0.5x</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={mapSettings.iconScaling}
                onChange={(e) => setMapSettings(prev => ({ ...prev, iconScaling: parseFloat(e.target.value) }))}
                className="flex-1 h-2 bg-void-950/60 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-amber-200/60 text-sm">2.0x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Base Map Upload */}
      <div className="rounded-lg border border-gold-300/30 backdrop-blur-md bg-void-950/60">
        <div className="p-4 border-b border-gold-300/20 bg-void-950/80">
          <h4 className="text-lg font-light text-gold-300 flex items-center" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
            <Upload className="mr-3 text-amber-200" size={20} />
            BASE MAP UPLOAD
          </h4>
        </div>

        <div className="p-6">
          {isUploading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-300 mx-auto mb-4"></div>
              <p className="text-gold-300 font-light tracking-wide" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                Uploading...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
              />
              
              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-gold-300 hover:text-amber-200 transition-all duration-300 p-4 rounded-md border border-gold-300/30 hover:border-amber-200/40 hover:bg-amber-200/10 flex items-center justify-center"
              >
                <Upload className="mr-2" size={20} />
                <span className="font-light tracking-wide" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                  Upload New Base Map
                </span>
              </button>

              {/* Current Base Maps */}
              {baseMaps.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-amber-200 font-medium tracking-wide" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                    Current Base Maps
                  </h5>
                  <div className="grid grid-cols-1 gap-3">
                    {baseMaps.map((baseMap) => (
                      <div key={baseMap.id} className={`p-4 rounded-lg border transition-all duration-300 ${baseMap.is_active ? 'border-gold-300/60 bg-gold-300/10' : 'border-gold-300/20 bg-void-950/40'}`}>
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded border border-gold-300/30 overflow-hidden flex-shrink-0">
                            <img src={baseMap.image_url} alt={baseMap.name} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h6 className="text-amber-200 font-medium text-sm truncate" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                                {baseMap.name}
                              </h6>
                              {baseMap.is_active && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gold-300 bg-gold-300/20 rounded-full">
                                  <Check size={12} className="mr-1" />
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-amber-200/60 text-xs font-light mt-1">
                              Uploaded {new Date(baseMap.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!baseMap.is_active && (
                              <button
                                onClick={() => setActiveBaseMap(baseMap.id)}
                                className="px-3 py-1 text-xs text-gold-300 border border-gold-300/30 rounded hover:bg-gold-300/10 transition-all duration-300"
                                style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => deleteBaseMap(baseMap.id)}
                              className="p-1 text-amber-200/70 hover:text-red-400 transition-all duration-300"
                              title="Delete base map"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="text-amber-200/60 text-sm font-light space-y-1">
                <p>• Recommended resolution: 4000x4000 pixels or higher</p>
                <p>• Supported formats: PNG, JPEG, JPG, WebP</p>
                <p>• Maximum file size: 10MB</p>
                <p>• Only one base map can be active at a time</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapSettings; 