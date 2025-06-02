import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface LinkingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canCreateLinks: boolean;
}

export interface LinkingStats {
  selectedPois: number;
  selectedItems: number;
  selectedSchematics: number;
  totalEntitySelections: number;
  totalPossibleLinks: number;
}

export interface LinkingState {
  // Selection state
  selectedPoiIds: Set<string>;
  selectedItemIds: Set<string>;
  selectedSchematicIds: Set<string>;
  
  // Derived statistics
  stats: LinkingStats;
  validation: LinkingValidation;
  
  // Actions
  togglePoiSelection: (poiId: string) => void;
  toggleItemSelection: (itemId: string) => void;
  toggleSchematicSelection: (schematicId: string) => void;
  
  // Bulk actions
  selectAllPois: (poiIds: string[]) => void;
  selectAllItems: (itemIds: string[]) => void;
  selectAllSchematics: (schematicIds: string[]) => void;
  clearPoiSelection: () => void;
  clearItemSelection: () => void;
  clearSchematicSelection: () => void;
  clearAllSelections: () => void;
  
  // URL management
  updateUrlParams: () => void;
  resetToUrlParams: () => void;
  
  // State queries
  isPoiSelected: (poiId: string) => boolean;
  isItemSelected: (itemId: string) => boolean;
  isSchematicSelected: (schematicId: string) => boolean;
  hasAnySelections: () => boolean;
}

interface UseLinkingStateOptions {
  enableUrlSync?: boolean;
  minPois?: number;
  minItems?: number;
  minSchematics?: number;
  maxSelections?: number;
}

export function useLinkingState(options: UseLinkingStateOptions = {}): LinkingState {
  const {
    enableUrlSync = true,
    minPois = 1,
    minItems = 0,
    minSchematics = 0,
    maxSelections = 1000
  } = options;

  const location = useLocation();
  const navigate = useNavigate();

  // Initialize state from URL parameters
  const getInitialState = () => {
    const params = new URLSearchParams(location.search);
    
    const poiIds = params.get('poi_ids')?.split(',').filter(Boolean) || [];
    const itemIds = params.get('item_ids')?.split(',').filter(Boolean) || [];
    const schematicIds = params.get('schematic_ids')?.split(',').filter(Boolean) || [];

    return {
      selectedPoiIds: new Set(poiIds),
      selectedItemIds: new Set(itemIds),
      selectedSchematicIds: new Set(schematicIds)
    };
  };

  const initialState = getInitialState();
  
  // Selection state
  const [selectedPoiIds, setSelectedPoiIds] = useState<Set<string>>(initialState.selectedPoiIds);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(initialState.selectedItemIds);
  const [selectedSchematicIds, setSelectedSchematicIds] = useState<Set<string>>(initialState.selectedSchematicIds);

  // Derived statistics
  const stats: LinkingStats = useMemo(() => {
    const selectedPois = selectedPoiIds.size;
    const selectedItems = selectedItemIds.size;
    const selectedSchematics = selectedSchematicIds.size;
    const totalEntitySelections = selectedItems + selectedSchematics;
    
    // Calculate total possible links (cartesian product)
    const totalPossibleLinks = selectedPois * totalEntitySelections;

    return {
      selectedPois,
      selectedItems,
      selectedSchematics,
      totalEntitySelections,
      totalPossibleLinks
    };
  }, [selectedPoiIds.size, selectedItemIds.size, selectedSchematicIds.size]);

  // Validation logic
  const validation: LinkingValidation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check minimum requirements
    if (stats.selectedPois < minPois) {
      errors.push(`At least ${minPois} POI${minPois > 1 ? 's' : ''} must be selected`);
    }

    if (stats.totalEntitySelections === 0) {
      errors.push('At least one item or schematic must be selected');
    }

    if (minItems > 0 && stats.selectedItems < minItems) {
      errors.push(`At least ${minItems} item${minItems > 1 ? 's' : ''} must be selected`);
    }

    if (minSchematics > 0 && stats.selectedSchematics < minSchematics) {
      errors.push(`At least ${minSchematics} schematic${minSchematics > 1 ? 's' : ''} must be selected`);
    }

    // Check maximum limits
    const totalSelections = stats.selectedPois + stats.totalEntitySelections;
    if (totalSelections > maxSelections) {
      errors.push(`Too many selections (${totalSelections}). Maximum allowed: ${maxSelections}`);
    }

    // Warnings
    if (stats.totalPossibleLinks > 100) {
      warnings.push(`This will create ${stats.totalPossibleLinks} links. Consider reducing selections for better performance.`);
    }

    if (stats.selectedPois > 20) {
      warnings.push('Large number of POIs selected. Consider filtering to be more specific.');
    }

    if (stats.totalEntitySelections > 50) {
      warnings.push('Large number of items/schematics selected. Consider filtering to be more specific.');
    }

    const isValid = errors.length === 0;
    const canCreateLinks = isValid && stats.totalPossibleLinks > 0;

    return {
      isValid,
      errors,
      warnings,
      canCreateLinks
    };
  }, [stats, minPois, minItems, minSchematics, maxSelections]);

  // URL management
  const updateUrlParams = () => {
    if (!enableUrlSync) return;

    const params = new URLSearchParams(location.search);
    
    // Update or remove parameters
    if (selectedPoiIds.size > 0) {
      params.set('poi_ids', Array.from(selectedPoiIds).join(','));
    } else {
      params.delete('poi_ids');
    }

    if (selectedItemIds.size > 0) {
      params.set('item_ids', Array.from(selectedItemIds).join(','));
    } else {
      params.delete('item_ids');
    }

    if (selectedSchematicIds.size > 0) {
      params.set('schematic_ids', Array.from(selectedSchematicIds).join(','));
    } else {
      params.delete('schematic_ids');
    }

    // Update URL without causing a page reload
    const newUrl = params.toString() ? `${location.pathname}?${params.toString()}` : location.pathname;
    navigate(newUrl, { replace: true });
  };

  const resetToUrlParams = () => {
    const newState = getInitialState();
    setSelectedPoiIds(newState.selectedPoiIds);
    setSelectedItemIds(newState.selectedItemIds);
    setSelectedSchematicIds(newState.selectedSchematicIds);
  };

  // Selection actions
  const togglePoiSelection = (poiId: string) => {
    setSelectedPoiIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(poiId)) {
        newSet.delete(poiId);
      } else {
        newSet.add(poiId);
      }
      return newSet;
    });
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSchematicSelection = (schematicId: string) => {
    setSelectedSchematicIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(schematicId)) {
        newSet.delete(schematicId);
      } else {
        newSet.add(schematicId);
      }
      return newSet;
    });
  };

  // Bulk selection actions
  const selectAllPois = (poiIds: string[]) => {
    setSelectedPoiIds(prev => {
      const newSet = new Set(prev);
      poiIds.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  const selectAllItems = (itemIds: string[]) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      itemIds.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  const selectAllSchematics = (schematicIds: string[]) => {
    setSelectedSchematicIds(prev => {
      const newSet = new Set(prev);
      schematicIds.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  const clearPoiSelection = () => {
    setSelectedPoiIds(new Set());
  };

  const clearItemSelection = () => {
    setSelectedItemIds(new Set());
  };

  const clearSchematicSelection = () => {
    setSelectedSchematicIds(new Set());
  };

  const clearAllSelections = () => {
    setSelectedPoiIds(new Set());
    setSelectedItemIds(new Set());
    setSelectedSchematicIds(new Set());
  };

  // State queries
  const isPoiSelected = (poiId: string) => selectedPoiIds.has(poiId);
  const isItemSelected = (itemId: string) => selectedItemIds.has(itemId);
  const isSchematicSelected = (schematicId: string) => selectedSchematicIds.has(schematicId);
  const hasAnySelections = () => 
    selectedPoiIds.size > 0 || selectedItemIds.size > 0 || selectedSchematicIds.size > 0;

  // Update URL when selections change
  useEffect(() => {
    if (enableUrlSync) {
      updateUrlParams();
    }
  }, [selectedPoiIds, selectedItemIds, selectedSchematicIds, enableUrlSync]);

  return {
    // State
    selectedPoiIds,
    selectedItemIds,
    selectedSchematicIds,
    
    // Derived data
    stats,
    validation,
    
    // Actions
    togglePoiSelection,
    toggleItemSelection,
    toggleSchematicSelection,
    
    // Bulk actions
    selectAllPois,
    selectAllItems,
    selectAllSchematics,
    clearPoiSelection,
    clearItemSelection,
    clearSchematicSelection,
    clearAllSelections,
    
    // URL management
    updateUrlParams,
    resetToUrlParams,
    
    // Queries
    isPoiSelected,
    isItemSelected,
    isSchematicSelected,
    hasAnySelections
  };
} 