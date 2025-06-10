import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface MapSettings {
  iconMinSize: number;
  iconMaxSize: number;
  iconBaseSize: number;
  showTooltips: boolean;
  enablePositionChange: boolean;
  defaultVisibleTypes: string[];
  enableAdvancedFiltering: boolean;
  showSharedIndicators: boolean;
}

export const defaultMapSettings: MapSettings = {
  iconMinSize: 64,
  iconMaxSize: 128,
  iconBaseSize: 64,
  showTooltips: true,
  enablePositionChange: true,
  defaultVisibleTypes: [],
  enableAdvancedFiltering: false,
  showSharedIndicators: true
};

export const useMapSettings = () => {
  const [settings, setSettings] = useState<MapSettings>(defaultMapSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'map_settings')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Map settings fetch error:', fetchError);
        throw fetchError;
      }

      if (data && data.setting_value) {
        const newSettings = {
          ...defaultMapSettings,
          ...data.setting_value
        };

        setSettings(newSettings);
      } else {

        setSettings(defaultMapSettings);
      }
    } catch (err: any) {
      console.error('Error loading map settings:', err);
      setError(err.message);
      // Keep using default settings on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();

    // Listen for admin map settings updates
    const handleMapSettingsUpdate = () => {

      loadSettings();
    };

    window.addEventListener('mapSettingsUpdated', handleMapSettingsUpdate);

    return () => {
      window.removeEventListener('mapSettingsUpdated', handleMapSettingsUpdate);
    };
  }, []);

  return { settings, loading, error, reloadSettings: loadSettings };
}; 