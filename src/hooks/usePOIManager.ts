import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Poi } from '../types';

interface POIManagerConfig {
  mapType: 'hagga_basin' | 'deep_desert';
  gridSquareId?: string | null; // For Deep Desert - specific grid square
  enableRealtime?: boolean; // Allow disabling subscriptions for testing
}

interface POIManagerReturn {
  pois: Poi[];
  loading: boolean;
  error: string | null;
  refreshPOIs: () => Promise<void>;
  addPOI: (poi: Poi) => void;
  updatePOI: (poi: Poi) => void;
  removePOI: (poiId: string) => void;
}

export const usePOIManager = (config: POIManagerConfig): POIManagerReturn => {
  const { mapType, gridSquareId, enableRealtime = true } = config;
  
  const [pois, setPois] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unified POI fetching logic
  const fetchPOIs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('pois')
        .select(`
          *,
          poi_types (*),
          profiles!pois_created_by_fkey (username),
          poi_image_links (
            managed_images (
              id,
              original_url,
              processed_url,
              crop_details,
              uploaded_by,
              created_at
            )
          )
        `)
        .eq('map_type', mapType)
        .order('created_at', { ascending: false });

      // Add grid square filter for Deep Desert
      if (mapType === 'deep_desert' && gridSquareId) {
        query = query.eq('grid_square_id', gridSquareId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform POI data to include screenshots from unified system
      const transformedPOIs = (data || []).map(poi => {
        // Extract screenshots from unified system
        const screenshots = poi.poi_image_links?.map(link => {
          const image = link.managed_images;
          if (!image) return null;
          
          return {
            id: image.id,
            poi_id: poi.id,
            url: image.processed_url || image.original_url, // Use processed if available, otherwise original
            original_url: image.original_url,
            crop_details: image.crop_details,
            uploaded_by: image.uploaded_by,
            upload_date: image.created_at,
            created_at: image.created_at
          };
        }).filter(screenshot => screenshot !== null) || [];

        return {
        ...poi,
          screenshots: screenshots
        };
      });

      setPois(transformedPOIs);
    } catch (err) {
      console.error(`Error fetching ${mapType} POIs:`, err);
      setError(`Failed to load ${mapType} POIs`);
    } finally {
      setLoading(false);
    }
  }, [mapType, gridSquareId]);

  // Safe POI update with deduplication
  const updatePOISafely = useCallback((updatedPoi: Poi) => {
    setPois(prev => {
      // Check if POI already exists
      const existingIndex = prev.findIndex(p => p.id === updatedPoi.id);
      
      if (existingIndex >= 0) {
        // Update existing POI
        const newPois = [...prev];
        newPois[existingIndex] = updatedPoi;
        return newPois;
      } else {
        // Add new POI
        return [updatedPoi, ...prev];
      }
    });
  }, []);

  // Manual POI management functions for external use
  const addPOI = useCallback((poi: Poi) => {
    // Transform poi_image_links to screenshots if needed (same as real-time subscription)
    const transformedPoi = {
      ...poi,
      screenshots: poi.screenshots || (poi.poi_image_links?.map(link => {
        const image = link.managed_images;
        if (!image) return null;
        
        return {
          id: image.id,
          poi_id: poi.id,
          url: image.processed_url || image.original_url,
          original_url: image.original_url,
          crop_details: image.crop_details,
          uploaded_by: image.uploaded_by,
          upload_date: image.created_at,
          created_at: image.created_at
        };
      }).filter(screenshot => screenshot !== null) || [])
    };
    setPois(prev => {
      const existingIndex = prev.findIndex(p => p.id === poi.id);
      if (existingIndex !== -1) {
        // Update existing POI with new data (like screenshots)
        const updatedPois = [...prev];
        updatedPois[existingIndex] = transformedPoi;
        return updatedPois;
      }
      return [transformedPoi, ...prev];
    });
  }, []);

  const updatePOI = useCallback((poi: Poi) => {
    // Transform POI data to handle unified system screenshots (same as addPOI)
    const screenshots = poi.poi_image_links?.map(link => {
      const image = link.managed_images;
      if (!image) return null;
      
      return {
        id: image.id,
        poi_id: poi.id,
        url: image.processed_url || image.original_url, // Use processed if available, otherwise original
        original_url: image.original_url,
        processed_url: image.processed_url, // Preserve for deletion logic
        crop_details: image.crop_details,
        uploaded_by: image.uploaded_by,
        upload_date: image.created_at,
        created_at: image.created_at
      };
    }).filter(screenshot => screenshot !== null) || [];

    const transformedPoi = {
      ...poi,
      screenshots: screenshots
    };
    setPois(prev => prev.map(p => p.id === poi.id ? transformedPoi : p));
  }, []);

  const removePOI = useCallback((poiId: string) => {
    setPois(prev => prev.filter(p => p.id !== poiId));
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchPOIs();
  }, [fetchPOIs]);

  // Unified real-time subscription system
  useEffect(() => {
    if (!enableRealtime) return;
    // Single POI table subscription with smart filtering
    const poiSubscription = supabase
      .channel(`poi-manager-${mapType}${gridSquareId ? `-${gridSquareId}` : ''}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pois',
          filter: mapType === 'deep_desert' && gridSquareId 
            ? `map_type=eq.${mapType}.and.grid_square_id=eq.${gridSquareId}`
            : `map_type=eq.${mapType}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const poiData = payload.new as Poi;
            
            // Verify POI belongs to our scope
            if (poiData.map_type !== mapType) return;
            if (mapType === 'deep_desert' && gridSquareId && poiData.grid_square_id !== gridSquareId) return;

            try {
              // Fetch complete POI data with relations
              const { data: completeData, error } = await supabase
                .from('pois')
                .select(`
                  *,
                  poi_types (*),
                  profiles!pois_created_by_fkey (username),
                  poi_image_links (
                    managed_images (
                      id,
                      original_url,
                      processed_url,
                      crop_details,
                      uploaded_by,
                      created_at
                    )
                  )
                `)
                .eq('id', poiData.id)
                .maybeSingle();

              if (!error && completeData) {
                // Transform POI data to include screenshots from unified system
                const screenshots = completeData.poi_image_links?.map(link => {
                  const image = link.managed_images;
                  if (!image) return null;
                  
                  return {
                    id: image.id,
                    poi_id: completeData.id,
                    url: image.processed_url || image.original_url, // Use processed if available, otherwise original
                    original_url: image.original_url,
                    processed_url: image.processed_url, // Preserve for deletion logic
                    crop_details: image.crop_details,
                    uploaded_by: image.uploaded_by,
                    upload_date: image.created_at,
                    created_at: image.created_at
                  };
                }).filter(screenshot => screenshot !== null) || [];

                const transformedPoi = {
                  ...completeData,
                  screenshots: screenshots
                };
                updatePOISafely(transformedPoi);
              }
            } catch (err) {
              console.error(`[usePOIManager] Error fetching complete POI data:`, err);
            }
          }
          else if (payload.eventType === 'DELETE') {
            const deletedPoiId = payload.old?.id;
            if (deletedPoiId) {
              removePOI(deletedPoiId);
            }
          }
        }
      )
      .subscribe();

    // For Hagga Basin, also listen to POI shares changes
    let sharesSubscription: any = null;
    if (mapType === 'hagga_basin') {
      sharesSubscription = supabase
        .channel(`poi-shares-${mapType}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'poi_shares'
          },
          async (payload) => {
            // When shares change, refresh the affected POI
            let poiId: string | null = null;
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              poiId = payload.new?.poi_id;
            } else if (payload.eventType === 'DELETE') {
              poiId = payload.old?.poi_id;
            }

            if (poiId) {
              try {
                // Fetch updated POI data
                const { data: updatedData, error } = await supabase
                  .from('pois')
                  .select(`
                    *,
                    poi_types (*),
                    profiles!pois_created_by_fkey (username)
                  `)
                  .eq('id', poiId)
                  .eq('map_type', 'hagga_basin')
                  .maybeSingle();

                if (!error && updatedData) {
                  // Transform screenshots for compatibility
                  const transformedPoi = {
                    ...updatedData,
                    screenshots: Array.isArray(updatedData.screenshots) 
                      ? updatedData.screenshots.map((screenshot: any, index: number) => ({
                          id: screenshot.id || `${updatedData.id}_${index}`,
                          url: screenshot.url || screenshot,
                          uploaded_by: screenshot.uploaded_by || updatedData.created_by,
                          upload_date: screenshot.upload_date || updatedData.created_at
                        }))
                      : []
                  };

                  updatePOISafely(transformedPoi);
                }
              } catch (err) {
                console.error(`[usePOIManager] Error refreshing POI after shares change:`, err);
              }
            }
          }
        )
        .subscribe();
    }

    // Cleanup function
    return () => {
      supabase.removeChannel(poiSubscription);
      if (sharesSubscription) {
        supabase.removeChannel(sharesSubscription);
      }
    };
  }, [mapType, gridSquareId, enableRealtime, updatePOISafely, removePOI]);

  return {
    pois,
    loading,
    error,
    refreshPOIs: fetchPOIs,
    addPOI,
    updatePOI,
    removePOI
  };
}; 