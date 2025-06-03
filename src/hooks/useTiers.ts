import { useState, useEffect } from 'react';
import type { Tier } from '../types/unified-entities';
import { tiersAPI } from '../lib/api/tiers';

/**
 * Hook to manage tiers state - fetches from database instead of hardcoded constants
 */
export const useTiers = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [tierNamesLookup, setTierNamesLookup] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tiers on mount
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const tiersData = await tiersAPI.getAll();
        setTiers(tiersData);
        
        // Create lookup object for easy access
        const lookup: Record<number, string> = {};
        tiersData.forEach(tier => {
          lookup[tier.tier_number] = tier.tier_name;
        });
        setTierNamesLookup(lookup);
        
      } catch (err) {
        console.error('Error fetching tiers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tiers');
      } finally {
        setLoading(false);
      }
    };

    fetchTiers();
  }, []);

  /**
   * Get tier name by number with fallback
   */
  const getTierName = (tierNumber: number): string => {
    return tierNamesLookup[tierNumber] || `Tier ${tierNumber}`;
  };

  /**
   * Check if tier number is valid
   */
  const isValidTier = (tierNumber: number): boolean => {
    return tierNumber in tierNamesLookup;
  };

  return {
    tiers,
    tierNamesLookup,
    loading,
    error,
    getTierName,
    isValidTier,
    refresh: () => {
      // Trigger re-fetch
      setLoading(true);
      tiersAPI.getAll().then(tiersData => {
        setTiers(tiersData);
        const lookup: Record<number, string> = {};
        tiersData.forEach(tier => {
          lookup[tier.tier_number] = tier.tier_name;
        });
        setTierNamesLookup(lookup);
        setLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to fetch tiers');
        setLoading(false);
      });
    }
  };
};

export default useTiers; 