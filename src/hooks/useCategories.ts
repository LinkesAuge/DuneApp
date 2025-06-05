import { useState, useEffect } from 'react';
import type { Category } from '../types/unified-entities';
import { categoriesAPI } from '../lib/api/categories';

/**
 * Hook to manage categories state - fetches from database
 */
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryNamesLookup, setCategoryNamesLookup] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const categoriesData = await categoriesAPI.getAll();
        setCategories(categoriesData);
        
        // Create lookup object for easy access
        const lookup: Record<number, string> = {};
        categoriesData.forEach(category => {
          lookup[category.id] = category.name;
        });
        setCategoryNamesLookup(lookup);
        
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /**
   * Get category name by ID with fallback
   */
  const getCategoryName = (categoryId: number): string => {
    return categoryNamesLookup[categoryId] || `Category ${categoryId}`;
  };

  /**
   * Check if category ID is valid
   */
  const isValidCategory = (categoryId: number): boolean => {
    return categoryId in categoryNamesLookup;
  };

  return {
    categories,
    categoryNamesLookup,
    loading,
    error,
    getCategoryName,
    isValidCategory,
    refresh: () => {
      // Trigger re-fetch
      setLoading(true);
      categoriesAPI.getAll().then(categoriesData => {
        setCategories(categoriesData);
        const lookup: Record<number, string> = {};
        categoriesData.forEach(category => {
          lookup[category.id] = category.name;
        });
        setCategoryNamesLookup(lookup);
        setLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        setLoading(false);
      });
    }
  };
};

export default useCategories; 