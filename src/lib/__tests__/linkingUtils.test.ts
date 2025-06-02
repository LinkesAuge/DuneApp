import { vi } from 'vitest';
import {
  createPoiItemLinks,
  createPoiItemLinksWithRetry,
  classifyError,
  calculateRetryDelay,
  shouldRetry,
  saveOperationToHistory,
  getOperationHistory,
  clearOperationHistory,
  undoLinkCreation,
} from '../linkingUtils';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  mockSupabaseClient,
  generateTestUser,
  simulateNetworkError,
  simulateRateLimitError,
  simulateDatabaseError,
  simulateNetworkDelay,
  createSmallSelectionScenario,
  createMediumSelectionScenario,
  createLargeSelectionScenario,
  generateTestEnhancedError,
  generateTestLinkingOperation,
  expectValidLinkCreationResult,
  expectValidEnhancedError,
  measureExecutionTime,
} from './testUtils';
import type { EnhancedError, RetryAttempt } from '../../types';

// Mock the supabase client
vi.mock('../supabase', () => ({
  supabase: vi.fn(),
}));

// Mock the poiItemLinks API
vi.mock('../api/poiItemLinks', () => ({
  createBulkPoiItemLinks: vi.fn(),
  deleteBulkPoiItemLinks: vi.fn(),
}));

import { supabase } from '../supabase';
import { createBulkPoiItemLinks, deleteBulkPoiItemLinks } from '../api/poiItemLinks';

const mockSupabase = supabase as any;
const mockCreateBulkPoiItemLinks = createBulkPoiItemLinks as any;
const mockDeleteBulkPoiItemLinks = deleteBulkPoiItemLinks as any;

describe('linkingUtils', () => {
  beforeEach(() => {
    setupTestEnvironment();
    mockSupabase.mockReturnValue(mockSupabaseClient as any);
  });

  afterEach(() => {
    teardownTestEnvironment();
  });

  describe('classifyError', () => {
    it('should classify network errors correctly', () => {
      const networkError = new Error('Network connection failed');
      const classified = classifyError(networkError);
      
      expectValidEnhancedError(classified);
      expect(classified.type).toBe('network');
      expect(classified.severity).toBe('medium');
      expect(classified.retryable).toBe(true);
      expect(classified.userMessage).toContain('network');
      expect(classified.suggestedAction).toContain('Try again');
    });

    it('should classify rate limit errors correctly', () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).code = 'RATE_LIMIT_EXCEEDED';
      const classified = classifyError(rateLimitError);
      
      expectValidEnhancedError(classified);
      expect(classified.type).toBe('rate_limit');
      expect(classified.severity).toBe('medium');
      expect(classified.retryable).toBe(true);
      expect(classified.userMessage).toContain('rate limit');
      expect(classified.suggestedAction).toContain('moment');
    });

    it('should classify database errors correctly', () => {
      const dbError = new Error('Database constraint violation');
      (dbError as any).code = '23505';
      const classified = classifyError(dbError);
      
      expectValidEnhancedError(classified);
      expect(classified.type).toBe('database');
      expect(classified.severity).toBe('high');
      expect(classified.retryable).toBe(false);
      expect(classified.userMessage).toContain('database');
      expect(classified.suggestedAction).toContain('check');
    });

    it('should classify authentication errors correctly', () => {
      const authError = new Error('Authentication failed');
      (authError as any).code = 'AUTHENTICATION_ERROR';
      const classified = classifyError(authError);
      
      expectValidEnhancedError(classified);
      expect(classified.type).toBe('authentication');
      expect(classified.severity).toBe('high');
      expect(classified.retryable).toBe(false);
      expect(classified.userMessage).toContain('authentication');
      expect(classified.suggestedAction).toContain('sign in');
    });

    it('should classify validation errors correctly', () => {
      const validationError = new Error('Invalid input data');
      (validationError as any).code = 'VALIDATION_ERROR';
      const classified = classifyError(validationError);
      
      expectValidEnhancedError(classified);
      expect(classified.type).toBe('validation');
      expect(classified.severity).toBe('medium');
      expect(classified.retryable).toBe(false);
      expect(classified.userMessage).toContain('data');
      expect(classified.suggestedAction).toContain('selection');
    });

    it('should classify unknown errors correctly', () => {
      const unknownError = new Error('Something unexpected happened');
      const classified = classifyError(unknownError);
      
      expectValidEnhancedError(classified);
      expect(classified.type).toBe('unknown');
      expect(classified.severity).toBe('medium');
      expect(classified.retryable).toBe(true);
      expect(classified.userMessage).toContain('unexpected');
      expect(classified.suggestedAction).toContain('support');
    });
  });

  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      expect(calculateRetryDelay(0)).toBe(1000); // 1 second
      expect(calculateRetryDelay(1)).toBe(2000); // 2 seconds
      expect(calculateRetryDelay(2)).toBe(4000); // 4 seconds
      expect(calculateRetryDelay(3)).toBe(8000); // 8 seconds
    });

    it('should cap delay at maximum value', () => {
      expect(calculateRetryDelay(10)).toBe(30000); // 30 seconds max
      expect(calculateRetryDelay(100)).toBe(30000); // Still 30 seconds max
    });

    it('should handle negative attempts gracefully', () => {
      expect(calculateRetryDelay(-1)).toBe(1000); // Default to first attempt
    });
  });

  describe('shouldRetry', () => {
    it('should allow retry for retryable errors within attempt limit', () => {
      const retryableError = generateTestEnhancedError({ retryable: true });
      expect(shouldRetry(retryableError, 0)).toBe(true);
      expect(shouldRetry(retryableError, 1)).toBe(true);
      expect(shouldRetry(retryableError, 2)).toBe(true);
    });

    it('should not allow retry for non-retryable errors', () => {
      const nonRetryableError = generateTestEnhancedError({ retryable: false });
      expect(shouldRetry(nonRetryableError, 0)).toBe(false);
      expect(shouldRetry(nonRetryableError, 1)).toBe(false);
    });

    it('should not allow retry beyond attempt limit', () => {
      const retryableError = generateTestEnhancedError({ retryable: true });
      expect(shouldRetry(retryableError, 3)).toBe(false);
      expect(shouldRetry(retryableError, 10)).toBe(false);
    });
  });

  describe('operation history management', () => {
    it('should save operation to history', () => {
      const operation = generateTestLinkingOperation();
      saveOperationToHistory(operation);
      
      const history = getOperationHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(operation);
    });

    it('should maintain maximum history size', () => {
      // Add 25 operations (more than the 20 limit)
      for (let i = 0; i < 25; i++) {
        const operation = generateTestLinkingOperation({ id: `operation-${i}` });
        saveOperationToHistory(operation);
      }
      
      const history = getOperationHistory();
      expect(history).toHaveLength(20); // Should cap at 20
      expect(history[0].id).toBe('operation-24'); // Most recent first
      expect(history[19].id).toBe('operation-5'); // Oldest kept
    });

    it('should clear history correctly', () => {
      // Add some operations
      for (let i = 0; i < 5; i++) {
        const operation = generateTestLinkingOperation();
        saveOperationToHistory(operation);
      }
      
      expect(getOperationHistory()).toHaveLength(5);
      
      clearOperationHistory();
      expect(getOperationHistory()).toHaveLength(0);
    });

    it('should handle corrupted localStorage gracefully', () => {
      // Corrupt the localStorage data
      localStorage.setItem('poi_linking_history', 'invalid json');
      
      const history = getOperationHistory();
      expect(history).toHaveLength(0); // Should return empty array for corrupted data
    });
  });

  describe('createPoiItemLinks', () => {
    const testUser = generateTestUser();
    const selection = createSmallSelectionScenario();

    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: testUser }, 
        error: null 
      });
    });

    it('should create links successfully for small selection', async () => {
      mockCreateBulkPoiItemLinks.mockResolvedValue({
        success: true,
        created: 3,
        failed: 0,
        errors: [],
        duplicatesSkipped: 0,
        createdLinks: [
          { id: 'link-1', poi_id: 'poi-1', item_id: 'item-1' },
          { id: 'link-2', poi_id: 'poi-2', item_id: 'item-1' },
          { id: 'link-3', poi_id: 'poi-1', schematic_id: 'schematic-1' },
        ],
      });

      const result = await createPoiItemLinks(
        selection.poiIds,
        selection.itemIds,
        selection.schematicIds,
        'found_here'
      );

      expectValidLinkCreationResult(result);
      expect(result.success).toBe(true);
      expect(result.created).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.createdLinkIds).toHaveLength(3);
      expect(result.canUndo).toBe(true);
      expect(result.analytics.poiCount).toBe(2);
      expect(result.analytics.itemCount).toBe(1);
      expect(result.analytics.schematicCount).toBe(1);
    });

    it('should handle partial failures gracefully', async () => {
      mockCreateBulkPoiItemLinks.mockResolvedValue({
        success: false,
        created: 2,
        failed: 1,
        errors: ['Failed to create link for poi-2 and item-1'],
        duplicatesSkipped: 0,
        createdLinks: [
          { id: 'link-1', poi_id: 'poi-1', item_id: 'item-1' },
          { id: 'link-2', poi_id: 'poi-1', schematic_id: 'schematic-1' },
        ],
      });

      const result = await createPoiItemLinks(
        selection.poiIds,
        selection.itemIds,
        selection.schematicIds,
        'found_here'
      );

      expectValidLinkCreationResult(result);
      expect(result.success).toBe(false);
      expect(result.created).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.canUndo).toBe(true);
      expect(result.createdLinkIds).toHaveLength(2);
    });

    it('should handle authentication errors', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: new Error('Not authenticated')
      });

      const result = await createPoiItemLinks(
        selection.poiIds,
        selection.itemIds,
        selection.schematicIds,
        'found_here'
      );

      expectValidLinkCreationResult(result);
      expect(result.success).toBe(false);
      expect(result.enhancedErrors).toHaveLength(1);
      expect(result.enhancedErrors[0].type).toBe('authentication');
      expect(result.canRetry).toBe(false);
      expect(result.canUndo).toBe(false);
    });

    it('should handle network errors with retry capability', async () => {
      mockCreateBulkPoiItemLinks.mockRejectedValue(new Error('Network connection failed'));

      const result = await createPoiItemLinks(
        selection.poiIds,
        selection.itemIds,
        selection.schematicIds,
        'found_here'
      );

      expectValidLinkCreationResult(result);
      expect(result.success).toBe(false);
      expect(result.enhancedErrors).toHaveLength(1);
      expect(result.enhancedErrors[0].type).toBe('network');
      expect(result.canRetry).toBe(true);
      expect(result.canUndo).toBe(false);
    });
  });

  describe('createPoiItemLinksWithRetry', () => {
    const testUser = generateTestUser();
    const selection = createMediumSelectionScenario();

    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: testUser }, 
        error: null 
      });
    });

    it('should succeed on first attempt without retry', async () => {
      mockCreateBulkPoiItemLinks.mockResolvedValue({
        success: true,
        created: 50,
        failed: 0,
        errors: [],
        duplicatesSkipped: 0,
        createdLinks: Array.from({ length: 50 }, (_, i) => ({ 
          id: `link-${i + 1}`, 
          poi_id: `poi-${Math.floor(i / 5) + 1}`, 
          item_id: `item-${(i % 5) + 1}` 
        })),
      });

      const { result, executionTime } = await measureExecutionTime(() =>
        createPoiItemLinksWithRetry(
          selection.poiIds,
          selection.itemIds,
          selection.schematicIds,
          'found_here'
        )
      );

      expectValidLinkCreationResult(result);
      expect(result.success).toBe(true);
      expect(result.retryHistory).toHaveLength(0); // No retries needed
      expect(executionTime).toBeLessThan(1000); // Should be fast without retries
    });

    it('should retry on network errors and eventually succeed', async () => {
      let attemptCount = 0;
      mockCreateBulkPoiItemLinks.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network connection failed'));
        }
        return Promise.resolve({
          success: true,
          created: 50,
          failed: 0,
          errors: [],
          duplicatesSkipped: 0,
          createdLinks: Array.from({ length: 50 }, (_, i) => ({ 
            id: `link-${i + 1}`, 
            poi_id: `poi-${Math.floor(i / 5) + 1}`, 
            item_id: `item-${(i % 5) + 1}` 
          })),
        });
      });

      const { result } = await measureExecutionTime(() =>
        createPoiItemLinksWithRetry(
          selection.poiIds,
          selection.itemIds,
          selection.schematicIds,
          'found_here'
        )
      );

      expectValidLinkCreationResult(result);
      expect(result.success).toBe(true);
      expect(result.retryHistory).toHaveLength(2); // Two failed attempts
      expect(result.retryHistory[0].success).toBe(false);
      expect(result.retryHistory[1].success).toBe(false);
      expect(attemptCount).toBe(3); // Two retries + final success
    });

    it('should exhaust retries and fail gracefully', async () => {
      mockCreateBulkPoiItemLinks.mockRejectedValue(new Error('Network connection failed'));

      const { result } = await measureExecutionTime(() =>
        createPoiItemLinksWithRetry(
          selection.poiIds,
          selection.itemIds,
          selection.schematicIds,
          'found_here',
          { maxRetries: 2 }
        )
      );

      expectValidLinkCreationResult(result);
      expect(result.success).toBe(false);
      expect(result.retryHistory).toHaveLength(2); // All attempts failed
      expect(result.canRetry).toBe(false); // Exhausted retries
      expect(result.enhancedErrors[0].type).toBe('network');
    });

    it('should not retry non-retryable errors', async () => {
      const dbError = new Error('Database constraint violation');
      (dbError as any).code = '23505';
      mockCreateBulkPoiItemLinks.mockRejectedValue(dbError);

      const { result } = await measureExecutionTime(() =>
        createPoiItemLinksWithRetry(
          selection.poiIds,
          selection.itemIds,
          selection.schematicIds,
          'found_here'
        )
      );

      expectValidLinkCreationResult(result);
      expect(result.success).toBe(false);
      expect(result.retryHistory).toHaveLength(0); // No retries for non-retryable error
      expect(result.canRetry).toBe(false);
      expect(result.enhancedErrors[0].type).toBe('database');
      expect(result.enhancedErrors[0].retryable).toBe(false);
    });
  });

  describe('undoLinkCreation', () => {
    const validOperation = generateTestLinkingOperation({
      status: 'success',
      canUndo: true,
      undoExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      details: {
        ...generateTestLinkingOperation().details,
        linkIds: ['link-1', 'link-2', 'link-3'],
      },
    });

    beforeEach(() => {
      saveOperationToHistory(validOperation);
    });

    it('should successfully undo a valid operation', async () => {
      mockDeleteBulkPoiItemLinks.mockResolvedValue({
        success: true,
        deletedCount: 3,
        errors: [],
      });

      const result = await undoLinkCreation(validOperation.id);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(3);
      expect(result.errors).toHaveLength(0);
      expect(mockDeleteBulkPoiItemLinks).toHaveBeenCalledWith(['link-1', 'link-2', 'link-3']);
      
      // Check that operation is marked as undone in history
      const history = getOperationHistory();
      const updatedOperation = history.find(op => op.id === validOperation.id);
      expect(updatedOperation?.status).toBe('undone');
    });

    it('should reject undo for expired operation', async () => {
      const expiredOperation = generateTestLinkingOperation({
        status: 'success',
        canUndo: true,
        undoExpiry: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      });
      saveOperationToHistory(expiredOperation);

      const result = await undoLinkCreation(expiredOperation.id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('expired');
      expect(mockDeleteBulkPoiItemLinks).not.toHaveBeenCalled();
    });

    it('should reject undo for non-existent operation', async () => {
      const result = await undoLinkCreation('non-existent-operation');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(mockDeleteBulkPoiItemLinks).not.toHaveBeenCalled();
    });

    it('should reject undo for already undone operation', async () => {
      const undoneOperation = generateTestLinkingOperation({
        status: 'undone',
        canUndo: false,
      });
      saveOperationToHistory(undoneOperation);

      const result = await undoLinkCreation(undoneOperation.id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already been undone');
      expect(mockDeleteBulkPoiItemLinks).not.toHaveBeenCalled();
    });

    it('should handle deletion errors gracefully', async () => {
      mockDeleteBulkPoiItemLinks.mockResolvedValue({
        success: false,
        deletedCount: 1,
        errors: ['Failed to delete link-2', 'Failed to delete link-3'],
      });

      const result = await undoLinkCreation(validOperation.id);

      expect(result.success).toBe(false);
      expect(result.deletedCount).toBe(1);
      expect(result.errors).toHaveLength(2);
      expect(result.error).toContain('Some links could not be deleted');
    });
  });

  describe('performance tests', () => {
    const testUser = generateTestUser();

    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: testUser }, 
        error: null 
      });
    });

    it('should handle large selections efficiently', async () => {
      const largeSelection = createLargeSelectionScenario();
      
      mockCreateBulkPoiItemLinks.mockResolvedValue({
        success: true,
        created: 1500, // 50 POIs * (30 items + 20 schematics)
        failed: 0,
        errors: [],
        duplicatesSkipped: 0,
        createdLinks: Array.from({ length: 1500 }, (_, i) => ({ 
          id: `link-${i + 1}`, 
          poi_id: `poi-${Math.floor(i / 50) + 1}`, 
          item_id: `item-${(i % 30) + 1}` 
        })),
      });

      const { result, executionTime } = await measureExecutionTime(() =>
        createPoiItemLinks(
          largeSelection.poiIds,
          largeSelection.itemIds,
          largeSelection.schematicIds,
          'found_here'
        )
      );

      expectValidLinkCreationResult(result);
      expect(result.success).toBe(true);
      expect(result.created).toBe(1500);
      expect(result.analytics.poiCount).toBe(50);
      expect(result.analytics.itemCount).toBe(30);
      expect(result.analytics.schematicCount).toBe(20);
      
      // Performance assertion - should complete within reasonable time
      expect(executionTime).toBeLessThan(5000); // 5 seconds max for large operations
    });

    it('should handle memory efficiently with large link arrays', async () => {
      const largeSelection = createLargeSelectionScenario();
      const largeLinkArray = Array.from({ length: 10000 }, (_, i) => ({ 
        id: `link-${i + 1}`, 
        poi_id: `poi-${Math.floor(i / 200) + 1}`, 
        item_id: `item-${(i % 100) + 1}` 
      }));

      mockCreateBulkPoiItemLinks.mockResolvedValue({
        success: true,
        created: 10000,
        failed: 0,
        errors: [],
        duplicatesSkipped: 0,
        createdLinks: largeLinkArray,
      });

      const initialMemory = process.memoryUsage().heapUsed;
      
      const result = await createPoiItemLinks(
        largeSelection.poiIds,
        largeSelection.itemIds,
        largeSelection.schematicIds,
        'found_here'
      );

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      expectValidLinkCreationResult(result);
      expect(result.success).toBe(true);
      expect(result.createdLinkIds).toHaveLength(10000);
      
      // Memory usage should be reasonable (less than 50MB increase)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('error scenarios', () => {
    const testUser = generateTestUser();
    const selection = createSmallSelectionScenario();

    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: testUser }, 
        error: null 
      });
    });

    it('should handle rate limiting with appropriate backoff', async () => {
      let attemptCount = 0;
      mockCreateBulkPoiItemLinks.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          const error = new Error('Rate limit exceeded');
          (error as any).code = 'RATE_LIMIT_EXCEEDED';
          return Promise.reject(error);
        }
        return Promise.resolve({
          success: true,
          created: 3,
          failed: 0,
          errors: [],
          duplicatesSkipped: 0,
          createdLinks: [
            { id: 'link-1', poi_id: 'poi-1', item_id: 'item-1' },
            { id: 'link-2', poi_id: 'poi-2', item_id: 'item-1' },
            { id: 'link-3', poi_id: 'poi-1', schematic_id: 'schematic-1' },
          ],
        });
      });

      const startTime = Date.now();
      const result = await createPoiItemLinksWithRetry(
        selection.poiIds,
        selection.itemIds,
        selection.schematicIds,
        'found_here'
      );
      const totalTime = Date.now() - startTime;

      expectValidLinkCreationResult(result);
      expect(result.success).toBe(true);
      expect(result.retryHistory).toHaveLength(2);
      expect(result.retryHistory[0].enhancedError.type).toBe('rate_limit');
      
      // Should have waited for exponential backoff (1s + 2s = 3s minimum)
      expect(totalTime).toBeGreaterThan(3000);
    });

    it('should handle timeout scenarios gracefully', async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 100);
      });
      
      mockCreateBulkPoiItemLinks.mockReturnValue(timeoutPromise as any);

      const result = await createPoiItemLinks(
        selection.poiIds,
        selection.itemIds,
        selection.schematicIds,
        'found_here'
      );

      expectValidLinkCreationResult(result);
      expect(result.success).toBe(false);
      expect(result.enhancedErrors).toHaveLength(1);
      expect(result.enhancedErrors[0].type).toBe('network');
      expect(result.canRetry).toBe(true);
    });

    it('should handle concurrent operations safely', async () => {
      mockCreateBulkPoiItemLinks.mockImplementation(async () => {
        await simulateNetworkDelay(50);
        return {
          success: true,
          created: 3,
          failed: 0,
          errors: [],
          duplicatesSkipped: 0,
          createdLinks: [
            { id: 'link-1', poi_id: 'poi-1', item_id: 'item-1' },
            { id: 'link-2', poi_id: 'poi-2', item_id: 'item-1' },
            { id: 'link-3', poi_id: 'poi-1', schematic_id: 'schematic-1' },
          ],
        };
      });

      // Start multiple concurrent operations
      const promises = Array.from({ length: 5 }, () =>
        createPoiItemLinks(
          selection.poiIds,
          selection.itemIds,
          selection.schematicIds,
          'found_here'
        )
      );

      const results = await Promise.all(promises);

      // All operations should succeed independently
      results.forEach(result => {
        expectValidLinkCreationResult(result);
        expect(result.success).toBe(true);
        expect(result.operationId).toBeDefined();
      });

      // All operation IDs should be unique
      const operationIds = results.map(r => r.operationId);
      const uniqueIds = new Set(operationIds);
      expect(uniqueIds.size).toBe(5);
    });
  });
}); 