import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Fetch POIs with proper privacy filtering, link counts, and pagination
 * @param user - The current authenticated user
 * @param page - Page number (1-based)
 * @param limit - Items per page
 * @returns A promise that resolves to paginated POIs the user has access to, with link counts
 */
export const fetchPrivacyFilteredPois = async (user: User | null, page: number = 1, limit: number = 25) => {
  if (!user) {
    // Return empty result for unauthenticated users
    return { items: [], totalCount: 0 };
  }

  try {
    // First, let's fetch ALL POIs and filter manually to debug the issue
    console.log('Fetching POIs for user:', user.id);
    
    const { data: allPois, error: allPoisError } = await supabase
      .from('pois')
      .select('*, poi_types (*), profiles!pois_created_by_fkey (username, display_name, custom_avatar_url, discord_avatar_url, use_discord_avatar)')
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
      
      // Apply pagination to POIs with link counts
      const totalCount = poisWithLinkCounts.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPois = poisWithLinkCounts.slice(startIndex, endIndex);
      
      return { 
        items: paginatedPois,
        totalCount
      };
    }

    console.log('Filtered POIs count:', filteredPois.length);
    
    // Apply pagination
    const totalCount = filteredPois.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPois = filteredPois.slice(startIndex, endIndex);
    
    return { 
      items: paginatedPois.map(poi => ({ ...poi, linkCount: 0 })),
      totalCount
    };
  } catch (error) {
    console.error('Error in fetchPrivacyFilteredPois:', error);
    return { items: [], totalCount: 0 };
  }
}; 