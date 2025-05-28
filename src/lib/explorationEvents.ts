// Utility for broadcasting exploration status changes across components
// This allows dashboard statistics to update when exploration status changes anywhere in the app

import { useEffect } from 'react';

export const EXPLORATION_CHANGED_EVENT = 'explorationStatusChanged';

export interface ExplorationChangeDetails {
  gridSquareId: string;
  coordinate: string;
  isExplored: boolean;
  source: 'upload' | 'crop' | 'recrop' | 'manual';
}

/**
 * Broadcast that exploration status has changed
 */
export const broadcastExplorationChange = (details: ExplorationChangeDetails) => {
  const event = new CustomEvent(EXPLORATION_CHANGED_EVENT, {
    detail: details
  });
  window.dispatchEvent(event);
  console.log('Broadcasted exploration change:', details);
};

/**
 * Listen for exploration status changes
 */
export const addExplorationChangeListener = (callback: (details: ExplorationChangeDetails) => void) => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ExplorationChangeDetails>;
    callback(customEvent.detail);
  };
  
  window.addEventListener(EXPLORATION_CHANGED_EVENT, handler);
  
  // Return cleanup function
  return () => {
    window.removeEventListener(EXPLORATION_CHANGED_EVENT, handler);
  };
};

/**
 * Hook for React components to listen for exploration changes
 */
export const useExplorationChangeListener = (callback: (details: ExplorationChangeDetails) => void) => {
  useEffect(() => {
    const cleanup = addExplorationChangeListener(callback);
    return cleanup;
  }, [callback]);
}; 