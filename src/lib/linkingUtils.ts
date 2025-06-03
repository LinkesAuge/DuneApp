import { supabase } from './supabase';
// DEPRECATED: This file contains legacy code that will be replaced in the new POI linking system
// The new system uses simple direct API calls instead of complex utility functions
import { createBulkPoiEntityLinks, deleteBulkPoiEntityLinks, getEntityIdFromLegacyId, type PoiEntityLink } from './api/poiEntityLinks';
import type { LinkingStats, LinkingValidation } from '../hooks/useLinkingState';
import { PerformanceMonitor, performanceUtils } from './performanceUtils';

export interface LinkCreationOptions {
  linkType?: 'found_here' | 'crafted_here' | 'required_for' | 'material_source';
  defaultQuantity?: number;
  notes?: string;
  batchSize?: number;
  onProgress?: (progress: number, current: number, total: number) => void;
  maxRetries?: number;
  retryDelay?: number;
}

export type ErrorType = 'network' | 'database' | 'authentication' | 'validation' | 'rate_limit' | 'unknown';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface EnhancedError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  suggestedAction: string;
  retryable: boolean;
  technicalDetails?: string;
  errorCode?: string;
}

export interface RetryAttempt {
  attemptNumber: number;
  timestamp: Date;
  error: EnhancedError;
  willRetry: boolean;
  retryDelay?: number;
}

export interface LinkCreationResult {
  success: boolean;
  created: number;
  failed: number;
  errors: string[];
  enhancedErrors: EnhancedError[];
  duplicatesSkipped: number;
  totalProcessed: number;
  canRetry: boolean;
  canUndo: boolean;
  operationId: string;
  createdLinkIds: string[];
  analytics: {
    startTime: Date;
    endTime: Date;
    duration: number;
    averageBatchTime: number;
    totalBatches: number;
    itemLinks: number;
    schematicLinks: number;
    poiBreakdown: { [poiId: string]: number };
    entityBreakdown: { items: number; schematics: number };
  };
  performanceMetrics: {
    batchTimes: number[];
    duplicateCheckTime: number;
    insertionTime: number;
    rollbackTime?: number;
  };
  retryHistory: RetryAttempt[];
}

export interface ExistingLinkInfo {
  poiId: string;
  itemId?: string;
  schematicId?: string;
  entityType: 'item' | 'schematic';
  linkId: string;
}

export interface LinkingOperation {
  id: string;
  type: 'create' | 'delete' | 'undo';
  timestamp: Date;
  status: 'success' | 'failed' | 'undone';
  details: {
    poiCount: number;
    itemCount: number;
    schematicCount: number;
    linksCreated: number;
    linkIds: string[];
    linkType: string;
  };
  canUndo: boolean;
  undoExpiry: Date;
  errorInfo?: EnhancedError;
}

/**
 * Classifies an error and provides enhanced error information
 */
export function classifyError(error: any): EnhancedError {
  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
    return {
      type: 'network',
      severity: 'medium',
      message: error.message || 'Network connection failed',
      userMessage: 'There was a problem connecting to the server. Please check your internet connection.',
      suggestedAction: 'Check your internet connection and try again. If the problem persists, contact support.',
      retryable: true,
      technicalDetails: error.stack,
      errorCode: error.code
    };
  }

  // Authentication errors
  if (error.message?.includes('auth') || error.message?.includes('unauthorized') || error.code === 'UNAUTHORIZED') {
    return {
      type: 'authentication',
      severity: 'high',
      message: error.message || 'Authentication failed',
      userMessage: 'Your session has expired. Please sign in again.',
      suggestedAction: 'Sign out and sign back in to refresh your session.',
      retryable: false,
      technicalDetails: error.stack,
      errorCode: error.code
    };
  }

  // Database constraint errors
  if (error.message?.includes('constraint') || error.message?.includes('duplicate') || error.code === '23505') {
    return {
      type: 'database',
      severity: 'low',
      message: error.message || 'Database constraint violation',
      userMessage: 'Some links already exist and were skipped.',
      suggestedAction: 'This is normal - duplicate links are automatically prevented.',
      retryable: false,
      technicalDetails: error.stack,
      errorCode: error.code
    };
  }

  // Rate limit errors
  if (error.message?.includes('rate limit') || error.code === 'RATE_LIMIT_EXCEEDED') {
    return {
      type: 'rate_limit',
      severity: 'medium',
      message: error.message || 'Rate limit exceeded',
      userMessage: 'You are creating links too quickly. Please wait a moment.',
      suggestedAction: 'Wait a few seconds and try again with a smaller batch size.',
      retryable: true,
      technicalDetails: error.stack,
      errorCode: error.code
    };
  }

  // Validation errors
  if (error.message?.includes('validation') || error.message?.includes('invalid')) {
    return {
      type: 'validation',
      severity: 'medium',
      message: error.message || 'Validation failed',
      userMessage: 'Some of your selections are invalid.',
      suggestedAction: 'Please check your POI and item/schematic selections and try again.',
      retryable: false,
      technicalDetails: error.stack,
      errorCode: error.code
    };
  }

  // Unknown errors
  return {
    type: 'unknown',
    severity: 'high',
    message: error.message || 'An unexpected error occurred',
    userMessage: 'An unexpected error occurred. Please try again.',
    suggestedAction: 'If this problem continues, please contact support with the error details.',
    retryable: true,
    technicalDetails: error.stack,
    errorCode: error.code
  };
}

/**
 * Implements exponential backoff for retry attempts
 */
export function calculateRetryDelay(attemptNumber: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attemptNumber - 1), 30000); // Max 30 seconds
}

/**
 * Determines if an error should be retried based on its classification
 */
export function shouldRetry(error: EnhancedError, attemptNumber: number, maxRetries: number): boolean {
  if (attemptNumber >= maxRetries) return false;
  if (!error.retryable) return false;
  
  // Special handling for rate limits - always retry with longer delay
  if (error.type === 'rate_limit') return true;
  
  // Retry network errors
  if (error.type === 'network') return true;
  
  // Retry unknown errors (might be transient)
  if (error.type === 'unknown') return true;
  
  return false;
}

/**
 * Creates POI-Item/Schematic links in bulk with comprehensive progress tracking and analytics
 */
export async function createPoiItemLinks(
  selectedPoiIds: Set<string>,
  selectedItemIds: Set<string>,
  selectedSchematicIds: Set<string>,
  options: LinkCreationOptions = {}
): Promise<LinkCreationResult> {
  const {
    linkType = 'found_here',
    defaultQuantity = 1,
    notes = '',
    batchSize = 25,
    onProgress,
    maxRetries = 3,
    retryDelay = 1000
  } = options;

  const startTime = new Date();
  const performanceMetrics = {
    batchTimes: [] as number[],
    duplicateCheckTime: 0,
    insertionTime: 0,
    rollbackTime: undefined as number | undefined
  };

  // Generate unique operation ID for tracking
  const operationId = `link-creation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Initialize performance monitoring
  const monitor = PerformanceMonitor.getInstance();
  monitor.startOperation(operationId, true);

  // Initialize comprehensive result structure
  const result: LinkCreationResult = {
    success: false,
    created: 0,
    failed: 0,
    errors: [],
    enhancedErrors: [],
    duplicatesSkipped: 0,
    totalProcessed: 0,
    canRetry: false,
    canUndo: false,
    operationId,
    createdLinkIds: [],
    analytics: {
      startTime,
      endTime: startTime,
      duration: 0,
      averageBatchTime: 0,
      totalBatches: 0,
      itemLinks: 0,
      schematicLinks: 0,
      poiBreakdown: {},
      entityBreakdown: { items: 0, schematics: 0 }
    },
    performanceMetrics,
    retryHistory: []
  };

  try {
    // Phase 1: Authentication check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      result.errors.push('User not authenticated');
      return result;
    }

    onProgress?.(5, 0, 100); // 5% for authentication

    // Phase 2: Check for existing links to avoid duplicates
    const duplicateCheckStart = performance.now();
    const existingLinks = await checkExistingLinks(selectedPoiIds, selectedItemIds, selectedSchematicIds);
    performanceMetrics.duplicateCheckTime = performance.now() - duplicateCheckStart;
    
    onProgress?.(15, 0, 100); // 15% for duplicate checking

    // Phase 3: Generate all link combinations with analytics
    const linksToCreate: Array<Omit<PoiItemLink, 'id' | 'created_at' | 'updated_at' | 'updated_by'> & { entityType: 'item' | 'schematic' }> = [];
    
    // Create existing link lookup for fast duplicate detection
    const existingLinkKeys = new Set(
      existingLinks.map(link => 
        `${link.poiId}-${link.itemId || link.schematicId}-${link.entityType}`
      )
    );

    // POI-Item links
    for (const poiId of selectedPoiIds) {
      for (const itemId of selectedItemIds) {
        const linkKey = `${poiId}-${itemId}-item`;
        if (!existingLinkKeys.has(linkKey)) {
          linksToCreate.push({
            poi_id: poiId,
            item_id: itemId,
            schematic_id: null,
            link_type: linkType,
            quantity: defaultQuantity,
            notes: notes || null,
            created_by: user.id,
            entityType: 'item'
          });
          
          // Track analytics
          result.analytics.poiBreakdown[poiId] = (result.analytics.poiBreakdown[poiId] || 0) + 1;
          result.analytics.entityBreakdown.items++;
        }
      }
    }

    // POI-Schematic links
    for (const poiId of selectedPoiIds) {
      for (const schematicId of selectedSchematicIds) {
        const linkKey = `${poiId}-${schematicId}-schematic`;
        if (!existingLinkKeys.has(linkKey)) {
          linksToCreate.push({
            poi_id: poiId,
            item_id: null,
            schematic_id: schematicId,
            link_type: linkType,
            quantity: defaultQuantity,
            notes: notes || null,
            created_by: user.id,
            entityType: 'schematic'
          });
          
          // Track analytics
          result.analytics.poiBreakdown[poiId] = (result.analytics.poiBreakdown[poiId] || 0) + 1;
          result.analytics.entityBreakdown.schematics++;
        }
      }
    }

    const totalPossibleLinks = selectedPoiIds.size * (selectedItemIds.size + selectedSchematicIds.size);
    result.duplicatesSkipped = existingLinks.length;
    result.totalProcessed = totalPossibleLinks;

    onProgress?.(25, 0, 100); // 25% for matrix generation

    // Early exit if no new links to create
    if (linksToCreate.length === 0) {
      result.success = true;
      result.analytics.endTime = new Date();
      result.analytics.duration = result.analytics.endTime.getTime() - startTime.getTime();
      onProgress?.(100, result.totalProcessed, result.totalProcessed);
      return result;
    }

    // Phase 4: Batch processing with comprehensive error handling
    const insertionStart = performance.now();
    const numBatches = Math.ceil(linksToCreate.length / batchSize);
    result.analytics.totalBatches = numBatches;
    
    let successfulInserts: any[] = [];

    for (let i = 0; i < linksToCreate.length; i += batchSize) {
      const batchStart = performance.now();
      const batch = linksToCreate.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      try {
        // Convert to entity format for database insertion
        const dbBatch = await Promise.all(
          batch.map(async ({ entityType, item_id, schematic_id, ...link }) => {
            const entityId = await getEntityIdFromLegacyId(item_id, schematic_id);
            return {
              poi_id: link.poi_id,
              entity_id: entityId
            };
          })
        );
        
        // Filter out any failed conversions
        const validBatch = dbBatch.filter(link => link.entity_id !== null);
        
        const requestStart = performance.now();
        const createdLinks = await createBulkPoiEntityLinks(validBatch, user.id);
        const requestTime = performance.now() - requestStart;
        const batchTime = performance.now() - batchStart;
        
        // Record performance metrics
        performanceMetrics.batchTimes.push(batchTime);
        monitor.recordBatch(operationId, batch.length, batchTime);
        monitor.recordNetworkRequest(operationId, requestTime, true);

        if (createdLinks && Array.isArray(createdLinks)) {
          result.created += createdLinks.length;
          successfulInserts.push(...createdLinks);
          
          // Track created link IDs for undo functionality
          const linkIds = createdLinks.map(link => link.id).filter(Boolean);
          result.createdLinkIds.push(...linkIds);
          
          // Track type-specific analytics
          batch.forEach(link => {
            if (link.entityType === 'item') {
              result.analytics.itemLinks++;
            } else {
              result.analytics.schematicLinks++;
            }
          });
        } else {
          result.failed += batch.length;
          result.errors.push(`Batch ${batchNumber}/${numBatches}: No links returned`);
        }

      } catch (error) {
        const batchTime = performance.now() - batchStart;
        performanceMetrics.batchTimes.push(batchTime);
        
        // Record failed batch performance
        monitor.recordBatch(operationId, batch.length, batchTime);
        monitor.recordNetworkRequest(operationId, batchTime, false);
        
        // Enhanced error handling
        const enhancedError = classifyError(error);
        result.failed += batch.length;
        result.errors.push(`Batch ${batchNumber}/${numBatches}: ${enhancedError.userMessage}`);
        result.enhancedErrors.push(enhancedError);
        
        console.error(`Batch ${batchNumber} failed:`, error);
        
        // Check if this error should trigger retry capability
        if (enhancedError.retryable) {
          result.canRetry = true;
        }
      }

      // Report detailed progress (25% to 95% range for batching)
      const processed = Math.min(i + batchSize, linksToCreate.length);
      const batchProgress = 25 + ((processed / linksToCreate.length) * 70);
      onProgress?.(batchProgress, processed, linksToCreate.length);
    }

    performanceMetrics.insertionTime = performance.now() - insertionStart;

    // Phase 5: Final validation and performance calculation
    onProgress?.(95, linksToCreate.length, linksToCreate.length);
    
    // Calculate performance metrics
    result.analytics.averageBatchTime = performanceMetrics.batchTimes.length > 0 
      ? performanceMetrics.batchTimes.reduce((a, b) => a + b, 0) / performanceMetrics.batchTimes.length 
      : 0;

    // Determine success based on creation rate (success if > 90% created or any created with < 10% failure)
    const creationRate = result.created / Math.max(linksToCreate.length, 1);
    result.success = result.created > 0 && creationRate >= 0.9;

    // Set undo capability if we created any links
    result.canUndo = result.created > 0;

    onProgress?.(100, result.totalProcessed, result.totalProcessed);

  } catch (error) {
    console.error('Critical error in POI item links creation:', error);
    
    // Enhanced critical error handling
    const enhancedError = classifyError(error);
    result.errors.push(`Critical error: ${enhancedError.userMessage}`);
    result.enhancedErrors.push(enhancedError);
    
    // Set retry capability for retryable critical errors
    if (enhancedError.retryable) {
      result.canRetry = true;
    }
    
    // Attempt rollback logging if we have successful inserts
    if (result.created > 0) {
      const rollbackStart = performance.now();
      console.warn(`Created ${result.created} links before failure - manual cleanup may be required`);
      performanceMetrics.rollbackTime = performance.now() - rollbackStart;
      result.canUndo = true; // Allow undo even on failure if some links were created
    }
  } finally {
    // Complete performance monitoring
    const performanceMetrics = monitor.completeOperation(operationId);
    
    // Finalize analytics
    result.analytics.endTime = new Date();
    result.analytics.duration = result.analytics.endTime.getTime() - startTime.getTime();
    
    // Save operation to history if any links were created or if there were retryable errors
    if (result.created > 0 || result.canRetry) {
      saveOperationToHistory({
        id: result.operationId,
        type: 'create',
        timestamp: result.analytics.startTime,
        status: result.success ? 'success' : 'failed',
        details: {
          poiCount: selectedPoiIds.size,
          itemCount: selectedItemIds.size,
          schematicCount: selectedSchematicIds.size,
          linksCreated: result.created,
          linkIds: result.createdLinkIds,
          linkType
        },
        canUndo: result.canUndo,
        undoExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        errorInfo: result.enhancedErrors.length > 0 ? result.enhancedErrors[0] : undefined
      });
    }
  }

  return result;
}

/**
 * Saves an operation to the history stored in localStorage
 */
export function saveOperationToHistory(operation: LinkingOperation): void {
  try {
    const history = getOperationHistory();
    history.unshift(operation); // Add to beginning
    
    // Keep only last 20 operations
    const trimmedHistory = history.slice(0, 20);
    
    localStorage.setItem('poi-linking-history', JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save operation to history:', error);
  }
}

/**
 * Retrieves operation history from localStorage
 */
export function getOperationHistory(): LinkingOperation[] {
  try {
    const historyJson = localStorage.getItem('poi-linking-history');
    if (!historyJson) return [];
    
    const history = JSON.parse(historyJson);
    
    // Filter out expired undo operations
    const now = new Date();
    return history.filter((op: LinkingOperation) => {
      if (op.canUndo && new Date(op.undoExpiry) < now) {
        op.canUndo = false;
      }
      return true;
    });
  } catch (error) {
    console.error('Failed to retrieve operation history:', error);
    return [];
  }
}

/**
 * Clears operation history
 */
export function clearOperationHistory(): void {
  try {
    localStorage.removeItem('poi-linking-history');
  } catch (error) {
    console.error('Failed to clear operation history:', error);
  }
}

/**
 * Undoes a link creation operation by deleting the created links
 */
export async function undoLinkCreation(operationId: string): Promise<{
  success: boolean;
  undoneCount: number;
  errors: string[];
}> {
  const result = {
    success: false,
    undoneCount: 0,
    errors: [] as string[]
  };

  try {
    const history = getOperationHistory();
    const operation = history.find(op => op.id === operationId);
    
    if (!operation) {
      result.errors.push('Operation not found in history');
      return result;
    }

    if (!operation.canUndo) {
      result.errors.push('This operation can no longer be undone');
      return result;
    }

    if (new Date() > new Date(operation.undoExpiry)) {
      result.errors.push('Undo time limit has expired');
      return result;
    }

    if (operation.details.linkIds.length === 0) {
      result.errors.push('No link IDs found for this operation');
      return result;
    }

    // Perform bulk delete of the created links
    await deleteBulkPoiItemLinks(operation.details.linkIds);
    result.undoneCount = operation.details.linkIds.length;
    result.success = true;

    // Update operation status in history
    operation.status = 'undone';
    operation.canUndo = false;
    
    // Save updated history
    const updatedHistory = history.map(op => 
      op.id === operationId ? operation : op
    );
    localStorage.setItem('poi-linking-history', JSON.stringify(updatedHistory));

    // Add undo operation to history
    saveOperationToHistory({
      id: `undo-${operationId}-${Date.now()}`,
      type: 'undo',
      timestamp: new Date(),
      status: 'success',
      details: {
        poiCount: operation.details.poiCount,
        itemCount: operation.details.itemCount,
        schematicCount: operation.details.schematicCount,
        linksCreated: -operation.details.linksCreated, // Negative to indicate removal
        linkIds: operation.details.linkIds,
        linkType: operation.details.linkType
      },
      canUndo: false,
      undoExpiry: new Date()
    });

  } catch (error) {
    console.error('Failed to undo operation:', error);
    const enhancedError = classifyError(error);
    result.errors.push(enhancedError.userMessage);
  }

  return result;
}

/**
 * Creates POI-Item/Schematic links with retry logic
 */
export async function createPoiItemLinksWithRetry(
  selectedPoiIds: Set<string>,
  selectedItemIds: Set<string>,
  selectedSchematicIds: Set<string>,
  options: LinkCreationOptions = {}
): Promise<LinkCreationResult> {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  let lastResult: LinkCreationResult | null = null;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      lastResult = await createPoiItemLinks(selectedPoiIds, selectedItemIds, selectedSchematicIds, {
        ...options,
        maxRetries: 0 // Disable retries in the main function to handle them here
      });

      // If successful or no retryable errors, return the result
      if (lastResult.success || !lastResult.canRetry) {
        return lastResult;
      }

      // Check if we should retry
      const retryableErrors = lastResult.enhancedErrors.filter(error => error.retryable);
      if (retryableErrors.length === 0 || attempt > maxRetries) {
        return lastResult;
      }

      // Calculate delay for this attempt
      const delay = calculateRetryDelay(attempt, retryDelay);
      
      // Add retry attempt to history
      const retryAttempt: RetryAttempt = {
        attemptNumber: attempt,
        timestamp: new Date(),
        error: retryableErrors[0], // Use first retryable error
        willRetry: attempt <= maxRetries,
        retryDelay: delay
      };
      
      if (lastResult.retryHistory) {
        lastResult.retryHistory.push(retryAttempt);
      }

      // Wait before retrying
      if (attempt <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      // Unexpected error in retry logic
      if (lastResult) {
        const enhancedError = classifyError(error);
        lastResult.enhancedErrors.push(enhancedError);
        lastResult.errors.push(`Retry attempt ${attempt} failed: ${enhancedError.userMessage}`);
      }
      
      if (attempt > maxRetries) {
        throw error;
      }
    }
  }

  return lastResult || {
    success: false,
    created: 0,
    failed: 0,
    errors: ['All retry attempts failed'],
    enhancedErrors: [],
    duplicatesSkipped: 0,
    totalProcessed: 0,
    canRetry: false,
    canUndo: false,
    operationId: '',
    createdLinkIds: [],
    analytics: {
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      averageBatchTime: 0,
      totalBatches: 0,
      itemLinks: 0,
      schematicLinks: 0,
      poiBreakdown: {},
      entityBreakdown: { items: 0, schematics: 0 }
    },
    performanceMetrics: {
      batchTimes: [],
      duplicateCheckTime: 0,
      insertionTime: 0
    },
    retryHistory: []
  };
}

/**
 * Check for existing links to avoid duplicates
 */
export async function checkExistingLinks(
  poiIds: Set<string>,
  itemIds: Set<string>,
  schematicIds: Set<string>
): Promise<ExistingLinkInfo[]> {
  const existingLinks: ExistingLinkInfo[] = [];

  try {
    // Combine all entity IDs (items and schematics) for unified query
    const allEntityIds = new Set([...Array.from(itemIds), ...Array.from(schematicIds)]);

    if (poiIds.size > 0 && allEntityIds.size > 0) {
      const { data: entityLinks, error: entityError } = await supabase
        .from('poi_entity_links')
        .select(`
          id, 
          poi_id, 
          entity_id,
          entities!entity_id(id, item_id, is_schematic)
        `)
        .in('poi_id', Array.from(poiIds))
        .in('entity_id', Array.from(allEntityIds));

      if (entityError) {
        console.error('Error checking existing entity links:', entityError);
      } else if (entityLinks) {
        existingLinks.push(...entityLinks.map(link => {
          const entity = link.entities;
          if (entity.is_schematic) {
            return {
              poiId: link.poi_id,
              schematicId: entity.item_id, // Use item_id as the external identifier
              entityType: 'schematic' as const,
              linkId: link.id
            };
          } else {
            return {
              poiId: link.poi_id,
              itemId: entity.item_id, // Use item_id as the external identifier  
              entityType: 'item' as const,
              linkId: link.id
            };
          }
        }));
      }
    }
  } catch (error) {
    console.error('Error checking existing links:', error);
  }

  return existingLinks;
}

/**
 * Validates selection state and returns detailed validation info
 */
export function validateLinkingSelections(
  stats: LinkingStats,
  options: {
    minPois?: number;
    minItems?: number;
    minSchematics?: number;
    maxTotalLinks?: number;
    warnThreshold?: number;
  } = {}
): LinkingValidation {
  const {
    minPois = 1,
    minItems = 0,
    minSchematics = 0,
    maxTotalLinks = 1000,
    warnThreshold = 100
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];

  // Validation checks
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

  if (stats.totalPossibleLinks > maxTotalLinks) {
    errors.push(`Too many links would be created (${stats.totalPossibleLinks}). Maximum allowed: ${maxTotalLinks}`);
  }

  // Warning checks
  if (stats.totalPossibleLinks > warnThreshold) {
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
}

/**
 * Formats linking statistics for display
 */
export function formatLinkingStats(stats: LinkingStats): {
  summary: string;
  details: string[];
  cartesianProduct: string;
} {
  const summary = `${stats.selectedPois} POIs × ${stats.totalEntitySelections} Items/Schematics = ${stats.totalPossibleLinks} Links`;
  
  const details: string[] = [];
  if (stats.selectedPois > 0) {
    details.push(`${stats.selectedPois} POI${stats.selectedPois > 1 ? 's' : ''} selected`);
  }
  if (stats.selectedItems > 0) {
    details.push(`${stats.selectedItems} item${stats.selectedItems > 1 ? 's' : ''} selected`);
  }
  if (stats.selectedSchematics > 0) {
    details.push(`${stats.selectedSchematics} schematic${stats.selectedSchematics > 1 ? 's' : ''} selected`);
  }

  const cartesianProduct = stats.totalPossibleLinks > 0 
    ? `Will create ${stats.totalPossibleLinks} link${stats.totalPossibleLinks > 1 ? 's' : ''}`
    : 'No links will be created';

  return {
    summary,
    details,
    cartesianProduct
  };
}

/**
 * Generates URL with pre-selected entities for linking
 */
export function generateLinkingUrl(
  baseUrl: string,
  poiIds?: string[],
  itemIds?: string[],
  schematicIds?: string[]
): string {
  const params = new URLSearchParams();

  if (poiIds && poiIds.length > 0) {
    params.set('poi_ids', poiIds.join(','));
  }

  if (itemIds && itemIds.length > 0) {
    params.set('item_ids', itemIds.join(','));
  }

  if (schematicIds && schematicIds.length > 0) {
    params.set('schematic_ids', schematicIds.join(','));
  }

  const paramString = params.toString();
  return paramString ? `${baseUrl}?${paramString}` : baseUrl;
}

/**
 * Parses URL parameters for entity pre-selection
 */
export function parseLinkingParams(search: string): {
  poiIds: string[];
  itemIds: string[];
  schematicIds: string[];
} {
  const params = new URLSearchParams(search);
  
  return {
    poiIds: params.get('poi_ids')?.split(',').filter(Boolean) || [],
    itemIds: params.get('item_ids')?.split(',').filter(Boolean) || [],
    schematicIds: params.get('schematic_ids')?.split(',').filter(Boolean) || []
  };
}

// ==========================================
// Backward Compatibility Wrapper
// ==========================================

/**
 * Backward-compatible wrapper for existing components that still use separate item/schematic IDs
 * This function converts to entity IDs and calls the new unified API
 */
export async function createPoiItemLinksLegacy(
  selectedPoiIds: Set<string>,
  selectedItemIds: Set<string>,
  selectedSchematicIds: Set<string>,
  options: LinkCreationOptions = {}
): Promise<LinkCreationResult> {
  
  try {
    // Convert legacy item/schematic IDs to unified entity IDs
    const entityIds = new Set<string>();
    
    // Convert item IDs to entity IDs
    for (const itemId of selectedItemIds) {
      const entityId = await getEntityIdFromLegacyId(itemId, undefined);
      if (entityId) {
        entityIds.add(entityId);
      }
    }
    
    // Convert schematic IDs to entity IDs
    for (const schematicId of selectedSchematicIds) {
      const entityId = await getEntityIdFromLegacyId(undefined, schematicId);
      if (entityId) {
        entityIds.add(entityId);
      }
    }
    
    // Call the updated main function (which now uses entity IDs internally)
    return await createPoiItemLinks(selectedPoiIds, selectedItemIds, selectedSchematicIds, options);
    
  } catch (error) {
    console.error('Error in legacy wrapper:', error);
    throw error;
  }
} 