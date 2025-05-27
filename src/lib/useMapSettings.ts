import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface MapSettings {
  iconMinSize: number;
  iconMaxSize: number;
  iconBaseSize: number;
  showTooltips: boolean;
  enablePositionChange: boolean;
  defaultZoom: number;
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
  defaultZoom: 0.4,
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
        .eq('setting_key', 'hagga_basin_settings')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data?.setting_value) {
        const newSettings = { ...defaultMapSettings, ...data.setting_value };
        console.log('🔧 [useMapSettings] Loaded settings from database:', newSettings);
        setSettings(newSettings);
      } else {
        console.log('🔧 [useMapSettings] No settings found in database, using defaults:', defaultMapSettings);
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
  }, []);

  return { settings, loading, error, reloadSettings: loadSettings };
}; 