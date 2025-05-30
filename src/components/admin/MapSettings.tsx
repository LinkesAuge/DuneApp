import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, MapPin, Map } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MapSettingsProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

interface MapSettings {
  showMapGrid: boolean;
  enableMapInteractions: boolean;
  iconScaling: number;
  visiblePoiTypes: string[];
}

const MapSettings: React.FC<MapSettingsProps> = ({
  onError,
  onSuccess
}) => {
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    showMapGrid: true,
    enableMapInteractions: true,
    iconScaling: 1.0,
    visiblePoiTypes: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [poiTypes, setPoiTypes] = useState<any[]>([]);

  useEffect(() => {
    loadMapSettings();
    loadPoiTypes();
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
      onError('Failed to load map settings: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadPoiTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('poi_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setPoiTypes(data || []);

      // Set default visible POI types if not already set
      if (mapSettings.visiblePoiTypes.length === 0 && data) {
        setMapSettings(prev => ({
          ...prev,
          visiblePoiTypes: data.map(type => type.id)
        }));
      }
    } catch (error: any) {
      console.error('Error loading POI types:', error);
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
      onError('Failed to save map settings: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setMapSettings({
      showMapGrid: true,
      enableMapInteractions: true,
      iconScaling: 1.0,
      visiblePoiTypes: poiTypes.map(type => type.id)
    });
  };

  const handlePoiTypeToggle = (poiTypeId: string) => {
    setMapSettings(prev => ({
      ...prev,
      visiblePoiTypes: prev.visiblePoiTypes.includes(poiTypeId)
        ? prev.visiblePoiTypes.filter(id => id !== poiTypeId)
        : [...prev.visiblePoiTypes, poiTypeId]
    }));
  };

  const isIconUrl = (icon: string): boolean => {
    return icon.startsWith('http://') || icon.startsWith('https://');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full border border-gold-300/50 mb-6"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
            <Map className="text-gold-300" size={24} />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-300 mx-auto mb-4"></div>
          <p className="text-gold-300 font-light tracking-wide"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
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
        <h3 className="text-2xl font-light tracking-[0.15em] text-gold-300 flex items-center"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          <Map className="mr-4 text-amber-200" size={28} />
          M A P  S E T T I N G S
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={resetToDefaults}
            className="text-amber-200/70 hover:text-amber-200 transition-all duration-300 p-2 rounded-md border border-amber-200/30 hover:border-amber-200/40 hover:bg-amber-200/10 flex items-center"
            title="Reset to defaults"
          >
            <RefreshCw size={16} className="mr-2" />
            <span className="text-sm font-light tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
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
            <span className="text-sm font-light tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {isSaving ? 'Saving...' : 'Save'}
            </span>
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* General Settings */}
        <div className="relative rounded-lg border border-gold-300/30 backdrop-blur-md"
             style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
          <div className="p-4 border-b border-gold-300/20"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
            <h4 className="text-lg font-light text-gold-300 tracking-[0.1em] flex items-center"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              <Settings className="mr-3 text-amber-200" size={20} />
              G E N E R A L  S E T T I N G S
            </h4>
          </div>

          <div className="p-6 space-y-6">
            {/* Map Grid Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-amber-200 font-medium tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
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
                <label className="text-amber-200 font-medium tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
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
                <label className="text-amber-200 font-medium tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
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
                  style={{
                    background: `linear-gradient(to right, rgb(251 191 36) 0%, rgb(251 191 36) ${((mapSettings.iconScaling - 0.5) / 1.5) * 100}%, rgba(42, 36, 56, 0.6) ${((mapSettings.iconScaling - 0.5) / 1.5) * 100}%, rgba(42, 36, 56, 0.6) 100%)`
                  }}
                />
                <span className="text-amber-200/60 text-sm">2.0x</span>
              </div>
            </div>
          </div>
        </div>

        {/* POI Type Visibility */}
        <div className="relative rounded-lg border border-gold-300/30 backdrop-blur-md"
             style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
          <div className="p-4 border-b border-gold-300/20"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
            <h4 className="text-lg font-light text-gold-300 tracking-[0.1em] flex items-center"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              <MapPin className="mr-3 text-amber-200" size={20} />
              P O I  T Y P E  V I S I B I L I T Y
              <span className="ml-3 text-sm text-amber-200/70">
                ({mapSettings.visiblePoiTypes.length}/{poiTypes.length} visible)
              </span>
            </h4>
          </div>

          <div className="p-6">
            {poiTypes.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-block p-3 rounded-full border border-amber-200/50 mb-3"
                     style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
                  <MapPin className="text-amber-200" size={20} />
                </div>
                <p className="text-amber-200/70 font-light"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  No POI types configured
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All/None */}
                <div className="flex items-center justify-between pb-4 border-b border-gold-300/20">
                  <span className="text-amber-200 font-medium tracking-wide"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Quick Actions
                  </span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setMapSettings(prev => ({ ...prev, visiblePoiTypes: poiTypes.map(type => type.id) }))}
                      className="px-3 py-1 text-xs text-amber-200 border border-amber-200/30 rounded hover:bg-amber-200/10 transition-all duration-300"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    >
                      Show All
                    </button>
                    <button
                      onClick={() => setMapSettings(prev => ({ ...prev, visiblePoiTypes: [] }))}
                      className="px-3 py-1 text-xs text-amber-200 border border-amber-200/30 rounded hover:bg-amber-200/10 transition-all duration-300"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    >
                      Hide All
                    </button>
                  </div>
                </div>

                {/* POI Type Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {poiTypes.map((poiType) => (
                    <label key={poiType.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gold-300/20 hover:border-gold-300/40 transition-all duration-300 cursor-pointer group"
                           style={{ backgroundColor: 'rgba(42, 36, 56, 0.4)' }}>
                      <input
                        type="checkbox"
                        checked={mapSettings.visiblePoiTypes.includes(poiType.id)}
                        onChange={() => handlePoiTypeToggle(poiType.id)}
                        className="w-4 h-4 text-gold-300 bg-void-950/60 border-gold-300/30 rounded focus:ring-gold-300/50 focus:ring-2"
                      />
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded border border-gold-300/30 flex items-center justify-center flex-shrink-0"
                             style={{ 
                               backgroundColor: poiType.icon_has_transparent_background ? 'transparent' : poiType.color + '20',
                               borderColor: poiType.color + '40'
                             }}>
                          {isIconUrl(poiType.icon) ? (
                            <img
                              src={poiType.icon}
                              alt={poiType.name}
                              className="w-5 h-5 rounded"
                              style={{
                                backgroundColor: poiType.icon_has_transparent_background ? 'transparent' : poiType.color
                              }}
                            />
                          ) : (
                            <span className="text-sm" style={{ color: poiType.color }}>
                              {poiType.icon}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-amber-200 font-medium text-sm group-hover:text-gold-300 transition-colors duration-300"
                               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                            {poiType.name}
                          </div>
                          <div className="text-amber-200/60 text-xs font-light">
                            {poiType.category || 'Uncategorized'}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSettings; 