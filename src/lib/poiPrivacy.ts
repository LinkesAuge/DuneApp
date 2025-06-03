import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Fetch POIs with proper privacy filtering and link counts
 * @param user - The current authenticated user
 * @returns A promise that resolves to an array of POIs the user has access to, with link counts
 */
export const fetchPrivacyFilteredPois = async (user: User | null) => {
  if (!user) {
    // Return empty array for unauthenticated users
    return [];
  }

  try {
    // First, let's fetch ALL POIs and filter manually to debug the issue
    console.log('Fetching POIs for user:', user.id);
    
    const { data: allPois, error: allPoisError } = await supabase
      .from('pois')
      .select('*, poi_types (*), profiles!pois_created_by_fkey (username)')
      .order('created_at', { ascending: false });

    if (allPoisError) {
      console.error('Error fetching all POIs:', allPoisError);
      throw allPoisError;
    }

    console.log('Total POIs fetched:', allPois?.length || 0);

    // Get shared POI IDs
    const { data: sharedPois } = await supabase
      .from('poi_shares')
      .select('poi_id')
      .eq('shared_with_user_id', user.id);

    const sharedPoiIds = sharedPois?.map(share => share.poi_id) || [];
    console.log('Shared POI IDs for user:', sharedPoiIds);

    // Filter POIs manually to ensure proper access control
    const filteredPois = (allPois || []).filter(poi => {
      const hasAccess = (() => {
        // Public POIs are accessible to everyone
        if (poi.privacy_level === 'global') {
          return true;
        }
        
        // Private POIs are only accessible to the creator
        if (poi.privacy_level === 'private') {
          return poi.created_by === user.id;
        }
        
        // Shared POIs are accessible to the creator or users with explicit access
        if (poi.privacy_level === 'shared') {
          return poi.created_by === user.id || sharedPoiIds.includes(poi.id);
        }
        
        return false;
      })();

      if (!hasAccess) {
        console.log('Filtering out POI:', poi.id, 'privacy_level:', poi.privacy_level, 'created_by:', poi.created_by, 'current_user:', user.id);
      }

      return hasAccess;
    });

    // Fetch link counts for filtered POIs
    if (filteredPois.length > 0) {
      const poiIds = filteredPois.map(poi => poi.id);
      
      // Get all links for these POIs
      const { data: allLinks } = await supabase
        .from('poi_entity_links')
        .select('poi_id')
        .in('poi_id', poiIds);

      // Count links per POI manually
      const linkCountMap = (allLinks || []).reduce((acc, link) => {
        acc[link.poi_id] = (acc[link.poi_id] || 0) + 1;
        return acc;
      }, {} as { [poiId: string]: number });

      // Add link counts to POIs
      const poisWithLinkCounts = filteredPois.map(poi => ({
        ...poi,
        linkCount: linkCountMap[poi.id] || 0
      }));

      console.log('Filtered POIs with link counts:', poisWithLinkCounts.length);
      return poisWithLinkCounts;
    }

    console.log('Filtered POIs count:', filteredPois.length);
    return filteredPois.map(poi => ({ ...poi, linkCount: 0 }));
  } catch (error) {
    console.error('Error in fetchPrivacyFilteredPois:', error);
    return [];
  }
}; 