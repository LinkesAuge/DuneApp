import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Poi } from '../types';
import { useAuth } from '../components/auth/AuthProvider';

interface UsePositionChangeProps {
  onPoiUpdated?: (poi: Poi) => void;
  onError?: (error: string) => void;
}

export const usePositionChange = ({ onPoiUpdated, onError }: UsePositionChangeProps = {}) => {
  const { user } = useAuth();
  const [positionChangeMode, setPositionChangeMode] = useState(false);
  const [changingPositionPoi, setChangingPositionPoi] = useState<Poi | null>(null);

  // Start position change mode for a POI
  const startPositionChange = useCallback((poi: Poi) => {
    setChangingPositionPoi(poi);
    setPositionChangeMode(true);
  }, []);

  // Exit position change mode
  const exitPositionChangeMode = useCallback(() => {
    setPositionChangeMode(false);
    setChangingPositionPoi(null);
  }, []);

  // Handle position update for a POI
  const handlePositionUpdate = useCallback(async (poi: Poi, pixelX: number, pixelY: number) => {
    try {
      const { data, error } = await supabase
        .from('pois')
        .update({
          coordinates_x: Math.round(pixelX),
          coordinates_y: Math.round(pixelY),
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', poi.id)
        .select()
        .single();

      if (error) throw error;

      // Update the POI via callback
      if (onPoiUpdated) {
        onPoiUpdated(data);
      }
      
      // Exit position change mode
      exitPositionChangeMode();
      
      console.log(`POI "${poi.title}" position updated to (${Math.round(pixelX)}, ${Math.round(pixelY)})`);
    } catch (error) {
      console.error('Error updating POI position:', error);
      if (onError) {
        onError('Failed to update POI position');
      }
      // Exit position change mode even on error
      exitPositionChangeMode();
    }
  }, [user, onPoiUpdated, onError, exitPositionChangeMode]);

  // Handle ESC key to cancel position change
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && positionChangeMode) {
      exitPositionChangeMode();
    }
  }, [positionChangeMode, exitPositionChangeMode]);

  return {
    positionChangeMode,
    changingPositionPoi,
    startPositionChange,
    exitPositionChangeMode,
    handlePositionUpdate,
    handleEscapeKey
  };
}; 