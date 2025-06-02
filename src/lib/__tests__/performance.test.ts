import { vi } from 'vitest';
import {
  createPoiItemLinks,
  createPoiItemLinksWithRetry,
  calculateRetryDelay,
  saveOperationToHistory,
  getOperationHistory,
  undoLinkCreation,
} from '../linkingUtils';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  mockSupabaseClient,
  simulateNetworkDelay,
  simulateNetworkError,
  generateTestPois,
  generateTestItems,
  generateTestSchematics,
  createLargeSelectionScenario,
  createMassiveSelectionScenario,
  measureExecutionTime,
  measureMemoryUsage,
} from './testUtils';
import type { LinkingConfig, LinkCreationResult } from '../../types';

// Performance test configuration
const PERFORMANCE_THRESHOLDS = {
  smallSelection: {
    maxExecutionTime: 1000, // 1 second
    maxMemoryUsage: 10 * 1024 * 1024, // 10MB
  },
  mediumSelection: {
    maxExecutionTime: 3000, // 3 seconds
    maxMemoryUsage: 25 * 1024 * 1024, // 25MB
  },
  largeSelection: {
    maxExecutionTime: 10000, // 10 seconds
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  },
  massiveSelection: {
    maxExecutionTime: 30000, // 30 seconds
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  },
};

describe('POI Linking Performance Tests', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  afterEach(() => {
    teardownTestEnvironment();
  });

  describe('Bulk Operation Performance', () => {
    it('should handle small selections efficiently', async () => {
      const scenario = createLargeSelectionScenario(); // 10 POIs, 20 items, 10 schematics
      const config: LinkingConfig = {
        poiIds: Array.from(scenario.poiIds),
        itemIds: Array.from(scenario.itemIds),
        schematicIds: Array.from(scenario.schematicIds),
        linkType: 'found_here',
      };

      // Mock successful responses with realistic delay
      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockImplementation(async () => {
          await simulateNetworkDelay(10); // 10ms per insert
          return { data: [{ id: 'test-id' }], error: null };
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }));

      const startTime = performance.now();
      const startMemory = measureMemoryUsage();

      const result = await createPoiItemLinks(config);

      const executionTime = performance.now() - startTime;
      const endMemory = measureMemoryUsage();
      const memoryUsed = endMemory - startMemory;

      // Verify performance meets thresholds
      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.smallSelection.maxExecutionTime);
      expect(memoryUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.smallSelection.maxMemoryUsage);
      
      // Verify operation succeeded
      expect(result.success).toBe(true);
      expect(result.created).toBe(config.poiIds.length * (config.itemIds.length + config.schematicIds.length));
    });

    it('should handle medium selections efficiently', async () => {
      const pois = generateTestPois(50);
      const items = generateTestItems(100);
      const schematics = generateTestSchematics(50);

      const config: LinkingConfig = {
        poiIds: pois.map(p => p.id),
        itemIds: items.map(i => i.id),
        schematicIds: schematics.map(s => s.id),
        linkType: 'found_here',
      };

      // Expected links: 50 POIs * (100 items + 50 schematics) = 7,500 links
      const expectedLinks = 7500;

      // Mock batch processing with realistic performance
      let insertCallCount = 0;
      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockImplementation(async (data) => {
          insertCallCount++;
          const batchSize = Array.isArray(data) ? data.length : 1;
          await simulateNetworkDelay(Math.max(50, batchSize * 2)); // Realistic batch delay
          
          return { 
            data: Array.from({ length: batchSize }, (_, i) => ({ 
              id: `link-${insertCallCount}-${i + 1}` 
            })), 
            error: null 
          };
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }));

      const { result, executionTime, memoryUsed } = await measureExecutionTime(async () => {
        return await createPoiItemLinks(config);
      });

      // Verify performance meets thresholds
      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.mediumSelection.maxExecutionTime);
      expect(memoryUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.mediumSelection.maxMemoryUsage);
      
      // Verify operation handled the load correctly
      expect(result.success).toBe(true);
      expect(result.created).toBe(expectedLinks);
      
      // Verify batch processing efficiency
      expect(insertCallCount).toBeLessThan(expectedLinks / 10); // Should batch effectively
    });

    it('should handle large selections with proper batching', async () => {
      const scenario = createMassiveSelectionScenario(); // 200 POIs, 500 items, 300 schematics
      const config: LinkingConfig = {
        poiIds: Array.from(scenario.poiIds).slice(0, 100), // Limit for test performance
        itemIds: Array.from(scenario.itemIds).slice(0, 200),
        schematicIds: Array.from(scenario.schematicIds).slice(0, 100),
        linkType: 'found_here',
      };

      // Expected links: 100 POIs * (200 items + 100 schematics) = 30,000 links
      const expectedLinks = 30000;

      // Mock optimized batch processing
      let batchCount = 0;
      const batchSizes: number[] = [];
      
      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockImplementation(async (data) => {
          batchCount++;
          const batchSize = Array.isArray(data) ? data.length : 1;
          batchSizes.push(batchSize);
          
          // Simulate efficient batch processing
          await simulateNetworkDelay(Math.min(500, batchSize * 1)); // Scale with batch size
          
          return { 
            data: Array.from({ length: batchSize }, (_, i) => ({ 
              id: `link-${batchCount}-${i + 1}` 
            })), 
            error: null 
          };
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }));

      const { result, executionTime, memoryUsed } = await measureExecutionTime(async () => {
        return await createPoiItemLinks(config);
      });

      // Verify performance meets thresholds for large operations
      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.largeSelection.maxExecutionTime);
      expect(memoryUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.largeSelection.maxMemoryUsage);
      
      // Verify operation succeeded
      expect(result.success).toBe(true);
      expect(result.created).toBe(expectedLinks);
      
      // Verify efficient batching (should use reasonable batch sizes)
      const avgBatchSize = batchSizes.reduce((a, b) => a + b, 0) / batchSizes.length;
      expect(avgBatchSize).toBeGreaterThan(50); // Should batch effectively
      expect(avgBatchSize).toBeLessThan(1000); // Should not create overly large batches
      
      // Verify total number of API calls is reasonable
      expect(batchCount).toBeLessThan(expectedLinks / 20); // At least 20 links per batch on average
    });
  });

  describe('Error Recovery Performance', () => {
    it('should handle retry scenarios efficiently', async () => {
      const scenario = createLargeSelectionScenario();
      const config: LinkingConfig = {
        poiIds: Array.from(scenario.poiIds),
        itemIds: Array.from(scenario.itemIds),
        schematicIds: Array.from(scenario.schematicIds),
        linkType: 'found_here',
      };

      // Mock initial failures followed by success
      let attemptCount = 0;
      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockImplementation(async () => {
          attemptCount++;
          if (attemptCount <= 2) {
            await simulateNetworkDelay(100); // Delay before failure
            throw new Error('Network timeout');
          }
          await simulateNetworkDelay(50); // Success delay
          return { data: [{ id: 'test-id' }], error: null };
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }));

      const { result, executionTime } = await measureExecutionTime(async () => {
        return await createPoiItemLinksWithRetry(config, { maxRetries: 3, baseDelay: 100 });
      });

      // Verify retry performance (should include backoff delays but stay reasonable)
      expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds even with retries
      expect(result.success).toBe(true);
      expect(result.retryHistory).toHaveLength(2); // Two failed attempts
      expect(attemptCount).toBe(3); // Two failures + one success
    });

    it('should calculate retry delays efficiently', () => {
      const calculations = [];
      const startTime = performance.now();

      // Test many delay calculations
      for (let attempt = 1; attempt <= 10; attempt++) {
        for (let baseDelay = 100; baseDelay <= 1000; baseDelay += 100) {
          const delay = calculateRetryDelay(attempt, baseDelay);
          calculations.push(delay);
        }
      }

      const calculationTime = performance.now() - startTime;

      // Verify calculations are fast
      expect(calculationTime).toBeLessThan(10); // Should be nearly instantaneous
      expect(calculations.length).toBe(100); // All calculations completed
      
      // Verify exponential backoff behavior
      const delays = [1, 2, 3, 4, 5].map(attempt => calculateRetryDelay(attempt, 1000));
      for (let i = 1; i < delays.length; i++) {
        expect(delays[i]).toBeGreaterThan(delays[i - 1]); // Should increase
      }
    });
  });

  describe('Memory Management Performance', () => {
    it('should handle operation history efficiently', async () => {
      const startMemory = measureMemoryUsage();

      // Generate many operations
      const operations = Array.from({ length: 100 }, (_, i) => ({
        operationId: `operation-${i + 1}`,
        timestamp: new Date(),
        config: {
          poiIds: [`poi-${i + 1}`],
          itemIds: [`item-${i + 1}`],
          schematicIds: [`schematic-${i + 1}`],
          linkType: 'found_here' as const,
        },
        result: {
          success: true,
          created: 3,
          failed: 0,
          errors: [],
          enhancedErrors: [],
          duplicatesSkipped: 0,
          totalProcessed: 3,
          canRetry: false,
          canUndo: true,
          operationId: `operation-${i + 1}`,
          createdLinkIds: [`link-${i + 1}-1`, `link-${i + 1}-2`, `link-${i + 1}-3`],
        },
      }));

      // Save all operations
      const saveStartTime = performance.now();
      for (const operation of operations) {
        saveOperationToHistory(operation.operationId, operation.config, operation.result);
      }
      const saveTime = performance.now() - saveStartTime;

      // Retrieve history
      const retrieveStartTime = performance.now();
      const history = getOperationHistory();
      const retrieveTime = performance.now() - retrieveStartTime;

      const endMemory = measureMemoryUsage();
      const memoryUsed = endMemory - startMemory;

      // Verify performance
      expect(saveTime).toBeLessThan(1000); // Save should be fast
      expect(retrieveTime).toBeLessThan(100); // Retrieval should be very fast
      expect(memoryUsed).toBeLessThan(5 * 1024 * 1024); // Memory usage should be reasonable
      
      // Verify history management (should limit to recent operations)
      expect(history.length).toBeLessThanOrEqual(20); // Should limit history
      expect(history[0].operationId).toBe('operation-100'); // Most recent first
    });

    it('should handle undo operations efficiently', async () => {
      // Create operation with many links
      const manyLinkIds = Array.from({ length: 1000 }, (_, i) => `link-${i + 1}`);
      
      // Mock bulk delete
      mockSupabaseClient.from.mockImplementation(() => ({
        delete: vi.fn().mockImplementation(async () => {
          await simulateNetworkDelay(200); // Realistic bulk delete delay
          return { data: null, error: null };
        }),
        in: vi.fn().mockReturnThis(),
      }));

      const { executionTime, memoryUsed } = await measureExecutionTime(async () => {
        return await undoLinkCreation('test-operation-id', manyLinkIds);
      });

      // Verify undo performance
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(memoryUsed).toBeLessThan(10 * 1024 * 1024); // Memory usage should be reasonable
    });
  });

  describe('Concurrent Operation Performance', () => {
    it('should handle multiple simultaneous operations', async () => {
      const concurrentOperations = 5;
      const operations = Array.from({ length: concurrentOperations }, (_, i) => {
        const scenario = createLargeSelectionScenario();
        return {
          config: {
            poiIds: Array.from(scenario.poiIds).map(id => `${id}-${i}`),
            itemIds: Array.from(scenario.itemIds).map(id => `${id}-${i}`),
            schematicIds: Array.from(scenario.schematicIds).map(id => `${id}-${i}`),
            linkType: 'found_here' as const,
          },
        };
      });

      // Mock responses for all operations
      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockImplementation(async () => {
          await simulateNetworkDelay(50); // Simulate concurrent processing
          return { data: [{ id: 'test-id' }], error: null };
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }));

      const { results, executionTime, memoryUsed } = await measureExecutionTime(async () => {
        return await Promise.all(
          operations.map(op => createPoiItemLinks(op.config))
        );
      });

      // Verify concurrent performance
      expect(executionTime).toBeLessThan(15000); // Should complete all within 15 seconds
      expect(memoryUsed).toBeLessThan(50 * 1024 * 1024); // Memory usage should be reasonable
      
      // Verify all operations succeeded
      expect(results).toHaveLength(concurrentOperations);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Timeout and Edge Case Performance', () => {
    it('should handle operation timeouts gracefully', async () => {
      const config: LinkingConfig = {
        poiIds: ['poi-1'],
        itemIds: ['item-1'],
        schematicIds: ['schematic-1'],
        linkType: 'found_here',
      };

      // Mock very slow response
      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockImplementation(async () => {
          await simulateNetworkDelay(15000); // 15 second delay
          return { data: [{ id: 'test-id' }], error: null };
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }));

      const timeoutPromise = new Promise<LinkCreationResult>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), 10000);
      });

      const operationPromise = createPoiItemLinks(config);

      // Race between operation and timeout
      try {
        await Promise.race([operationPromise, timeoutPromise]);
        fail('Should have timed out');
      } catch (error) {
        expect((error as Error).message).toBe('Operation timeout');
      }
    });

    it('should handle rapid successive operations', async () => {
      const rapidOperations = 20;
      const config: LinkingConfig = {
        poiIds: ['poi-1'],
        itemIds: ['item-1'],
        schematicIds: [],
        linkType: 'found_here',
      };

      // Mock fast responses
      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockImplementation(async () => {
          await simulateNetworkDelay(10); // Very fast response
          return { data: [{ id: 'test-id' }], error: null };
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }));

      const { results, executionTime } = await measureExecutionTime(async () => {
        const promises = Array.from({ length: rapidOperations }, () => 
          createPoiItemLinks(config)
        );
        return await Promise.all(promises);
      });

      // Verify rapid operation performance
      expect(executionTime).toBeLessThan(5000); // Should complete quickly
      expect(results).toHaveLength(rapidOperations);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });
}); 