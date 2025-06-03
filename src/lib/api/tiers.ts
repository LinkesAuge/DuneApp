import { supabase } from '../supabase';
import type { Tier, TierResponse } from '../../types/unified-entities';

/**
 * Tiers API - Database-driven tier management
 * Replaces hardcoded TIER_NAMES constant with dynamic database fetching
 */
export const tiersAPI = {
  /**
   * Get all tiers from database
   */
  getAll: async (): Promise<Tier[]> => {
    const { data, error } = await supabase
      .from('tiers')
      .select('*')
      .order('tier_number', { ascending: true });

    if (error) {
      console.error('Error fetching tiers:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get tier by number
   */
  getByNumber: async (tierNumber: number): Promise<Tier | null> => {
    const { data, error } = await supabase
      .from('tiers')
      .select('*')
      .eq('tier_number', tierNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching tier:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get tier name by number (convenience function)
   */
  getTierName: async (tierNumber: number): Promise<string> => {
    const tier = await tiersAPI.getByNumber(tierNumber);
    return tier?.tier_name || `Tier ${tierNumber}`;
  },

  /**
   * Create tier names lookup object from database
   * Returns Record<number, string> similar to old TIER_NAMES constant
   */
  getTierNamesLookup: async (): Promise<Record<number, string>> => {
    const tiers = await tiersAPI.getAll();
    const lookup: Record<number, string> = {};
    
    tiers.forEach(tier => {
      lookup[tier.tier_number] = tier.tier_name;
    });
    
    return lookup;
  },

  /**
   * Validate if tier number exists in database
   */
  isValidTierNumber: async (tierNumber: number): Promise<boolean> => {
    const tier = await tiersAPI.getByNumber(tierNumber);
    return tier !== null;
  }
};

// Export default for easier importing
export default tiersAPI; 