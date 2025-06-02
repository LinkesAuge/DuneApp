import { vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import type { 
  Poi, 
  PoiType, 
  Item, 
  Schematic, 
  PoiItemLink, 
  LinkCreationResult,
  EnhancedError,
  LinkingOperation
} from '../../types';

// Mock Supabase client responses
export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  })),
};

// Test data generators
export const generateTestUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-1',
  email: 'test@example.com',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  ...overrides,
} as User);

export const generateTestPoi = (overrides: Partial<Poi> = {}): Poi => ({
  id: `poi-${Math.random().toString(36).substr(2, 9)}`,
  title: `Test POI ${Math.floor(Math.random() * 1000)}`,
  description: 'Test POI description',
  x_coordinate: Math.floor(Math.random() * 4000),
  y_coordinate: Math.floor(Math.random() * 4000),
  poi_type_id: 'test-poi-type-1',
  map_type: 'hagga_basin',
  privacy_level: 'public',
  created_by: 'test-user-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  screenshot_url: null,
  notes: null,
  custom_icon_id: null,
  ...overrides,
});

export const generateTestPoiType = (overrides: Partial<PoiType> = {}): PoiType => ({
  id: `poi-type-${Math.random().toString(36).substr(2, 9)}`,
  name: `Test POI Type ${Math.floor(Math.random() * 1000)}`,
  icon: '📍',
  color: '#ff0000',
  category: 'test-category',
  created_at: new Date().toISOString(),
  display_in_panel: true,
  display_order: 1,
  column_preference: 1,
  icon_has_transparent_background: false,
  default_description: null,
  created_by: null,
  ...overrides,
});

export const generateTestItem = (overrides: Partial<Item> = {}): Item => ({
  id: `item-${Math.random().toString(36).substr(2, 9)}`,
  name: `Test Item ${Math.floor(Math.random() * 1000)}`,
  description: 'Test item description',
  category_id: 'test-category-1',
  type_id: 'test-type-1',
  tier_id: 'test-tier-1',
  icon_image_id: null,
  icon_fallback: '🔧',
  created_by: 'test-user-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  updated_by: 'test-user-1',
  ...overrides,
});

export const generateTestSchematic = (overrides: Partial<Schematic> = {}): Schematic => ({
  id: `schematic-${Math.random().toString(36).substr(2, 9)}`,
  name: `Test Schematic ${Math.floor(Math.random() * 1000)}`,
  description: 'Test schematic description',
  category_id: 'test-category-1',
  type_id: 'test-type-1',
  tier_id: 'test-tier-1',
  icon_image_id: null,
  icon_fallback: '📋',
  created_by: 'test-user-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  updated_by: 'test-user-1',
  ...overrides,
});

export const generateTestPoiItemLink = (overrides: Partial<PoiItemLink> = {}): PoiItemLink => ({
  id: `link-${Math.random().toString(36).substr(2, 9)}`,
  poi_id: 'test-poi-1',
  item_id: 'test-item-1',
  schematic_id: null,
  link_type: 'found_here',
  quantity: 1,
  notes: null,
  created_by: 'test-user-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  updated_by: 'test-user-1',
  ...overrides,
});

export const generateTestEnhancedError = (overrides: Partial<EnhancedError> = {}): EnhancedError => ({
  type: 'network',
  severity: 'medium',
  message: 'Test error message',
  userMessage: 'Test user-friendly error message',
  suggestedAction: 'Try again in a moment',
  retryable: true,
  technicalDetails: 'Error stack trace here',
  errorCode: 'TEST_ERROR',
  ...overrides,
});

export const generateTestLinkingOperation = (overrides: Partial<LinkingOperation> = {}): LinkingOperation => ({
  id: `operation-${Math.random().toString(36).substr(2, 9)}`,
  type: 'create',
  timestamp: new Date(),
  status: 'success',
  details: {
    poiCount: 5,
    itemCount: 3,
    schematicCount: 2,
    linksCreated: 25,
    linkIds: ['link-1', 'link-2', 'link-3'],
    linkType: 'found_here'
  },
  canUndo: true,
  undoExpiry: new Date(Date.now() + 10 * 60 * 1000),
  ...overrides,
});

// Bulk test data generators
export const generateTestPois = (count: number): Poi[] => 
  Array.from({ length: count }, () => generateTestPoi());

export const generateTestItems = (count: number): Item[] => 
  Array.from({ length: count }, () => generateTestItem());

export const generateTestSchematics = (count: number): Schematic[] => 
  Array.from({ length: count }, () => generateTestSchematic());

export const generateTestPoiItemLinks = (count: number): PoiItemLink[] => 
  Array.from({ length: count }, () => generateTestPoiItemLink());

// Performance testing utilities
export const measureExecutionTime = async <T>(fn: () => Promise<T>): Promise<{ result: T; executionTime: number }> => {
  const startTime = performance.now();
  const result = await fn();
  const executionTime = performance.now() - startTime;
  return { result, executionTime };
};

export const simulateNetworkDelay = (delay: number = 100): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, delay));

export const simulateNetworkError = (): never => {
  throw new Error('Network connection failed');
};

export const simulateRateLimitError = (): never => {
  const error = new Error('Rate limit exceeded');
  (error as any).code = 'RATE_LIMIT_EXCEEDED';
  throw error;
};

export const simulateDatabaseError = (): never => {
  const error = new Error('Database constraint violation');
  (error as any).code = '23505';
  throw error;
};

// Test scenario helpers
export const createLargeSelectionScenario = () => ({
  poiIds: new Set(Array.from({ length: 50 }, (_, i) => `poi-${i + 1}`)),
  itemIds: new Set(Array.from({ length: 30 }, (_, i) => `item-${i + 1}`)),
  schematicIds: new Set(Array.from({ length: 20 }, (_, i) => `schematic-${i + 1}`)),
});

export const createMassiveSelectionScenario = () => ({
  poiIds: new Set(Array.from({ length: 200 }, (_, i) => `poi-${i + 1}`)),
  itemIds: new Set(Array.from({ length: 500 }, (_, i) => `item-${i + 1}`)),
  schematicIds: new Set(Array.from({ length: 300 }, (_, i) => `schematic-${i + 1}`)),
});

export const measureMemoryUsage = (): number => {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage().heapUsed;
  }
  return 0;
};

export const createMediumSelectionScenario = () => ({
  poiIds: new Set(Array.from({ length: 10 }, (_, i) => `poi-${i + 1}`)),
  itemIds: new Set(Array.from({ length: 5 }, (_, i) => `item-${i + 1}`)),
  schematicIds: new Set(Array.from({ length: 5 }, (_, i) => `schematic-${i + 1}`)),
});

export const createSmallSelectionScenario = () => ({
  poiIds: new Set(['poi-1', 'poi-2']),
  itemIds: new Set(['item-1']),
  schematicIds: new Set(['schematic-1']),
});

// Mock localStorage for operation history testing
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

// Setup and teardown helpers
export const setupTestEnvironment = () => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  // Mock performance.now for consistent timing tests
  const mockPerformanceNow = vi.fn(() => Date.now());
  Object.defineProperty(window, 'performance', {
    value: { now: mockPerformanceNow },
    writable: true,
  });

  // Reset all mocks
  vi.clearAllMocks();
  mockLocalStorage.clear();
};

export const teardownTestEnvironment = () => {
  vi.restoreAllMocks();
  mockLocalStorage.clear();
};

// Assertion helpers
export const expectValidLinkCreationResult = (result: LinkCreationResult) => {
  expect(result).toHaveProperty('success');
  expect(result).toHaveProperty('created');
  expect(result).toHaveProperty('failed');
  expect(result).toHaveProperty('errors');
  expect(result).toHaveProperty('enhancedErrors');
  expect(result).toHaveProperty('duplicatesSkipped');
  expect(result).toHaveProperty('totalProcessed');
  expect(result).toHaveProperty('canRetry');
  expect(result).toHaveProperty('canUndo');
  expect(result).toHaveProperty('operationId');
  expect(result).toHaveProperty('createdLinkIds');
  expect(result).toHaveProperty('analytics');
  expect(result).toHaveProperty('performanceMetrics');
  expect(result).toHaveProperty('retryHistory');
  
  expect(typeof result.success).toBe('boolean');
  expect(typeof result.created).toBe('number');
  expect(typeof result.failed).toBe('number');
  expect(Array.isArray(result.errors)).toBe(true);
  expect(Array.isArray(result.enhancedErrors)).toBe(true);
  expect(typeof result.duplicatesSkipped).toBe('number');
  expect(typeof result.totalProcessed).toBe('number');
  expect(typeof result.canRetry).toBe('boolean');
  expect(typeof result.canUndo).toBe('boolean');
  expect(typeof result.operationId).toBe('string');
  expect(Array.isArray(result.createdLinkIds)).toBe(true);
  expect(typeof result.analytics).toBe('object');
  expect(typeof result.performanceMetrics).toBe('object');
  expect(Array.isArray(result.retryHistory)).toBe(true);
};

export const expectValidEnhancedError = (error: EnhancedError) => {
  expect(error).toHaveProperty('type');
  expect(error).toHaveProperty('severity');
  expect(error).toHaveProperty('message');
  expect(error).toHaveProperty('userMessage');
  expect(error).toHaveProperty('suggestedAction');
  expect(error).toHaveProperty('retryable');
  
  expect(['network', 'database', 'authentication', 'validation', 'rate_limit', 'unknown']).toContain(error.type);
  expect(['low', 'medium', 'high', 'critical']).toContain(error.severity);
  expect(typeof error.message).toBe('string');
  expect(typeof error.userMessage).toBe('string');
  expect(typeof error.suggestedAction).toBe('string');
  expect(typeof error.retryable).toBe('boolean');
}; 