import { useState, useEffect } from 'react';
import type { Type } from '../types/unified-entities';
import { typesAPI } from '../lib/api/categories';

/**
 * Hook to manage types state - fetches from database
 */
export const useTypes = () => {
  const [types, setTypes] = useState<Type[]>([]);
  const [typeNamesLookup, setTypeNamesLookup] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch types on mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const typesData = await typesAPI.getAll();
        setTypes(typesData);
        
        // Create lookup object for easy access
        const lookup: Record<number, string> = {};
        typesData.forEach(type => {
          lookup[type.id] = type.name;
        });
        setTypeNamesLookup(lookup);
        
      } catch (err) {
        console.error('Error fetching types:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch types');
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  /**
   * Get type name by ID with fallback
   */
  const getTypeName = (typeId: number): string => {
    return typeNamesLookup[typeId] || `Type ${typeId}`;
  };

  /**
   * Check if type ID is valid
   */
  const isValidType = (typeId: number): boolean => {
    return typeId in typeNamesLookup;
  };

  return {
    types,
    typeNamesLookup,
    loading,
    error,
    getTypeName,
    isValidType,
    refresh: () => {
      // Trigger re-fetch
      setLoading(true);
      typesAPI.getAll().then(typesData => {
        setTypes(typesData);
        const lookup: Record<number, string> = {};
        typesData.forEach(type => {
          lookup[type.id] = type.name;
        });
        setTypeNamesLookup(lookup);
        setLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to fetch types');
        setLoading(false);
      });
    }
  };
};

export default useTypes; 