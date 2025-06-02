import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { UnifiedPoiLinkingPage } from '../../../pages/UnifiedPoiLinkingPage';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  mockSupabaseClient,
  generateTestUser,
  generateTestPois,
  generateTestItems,
  generateTestSchematics,
  simulateNetworkDelay,
  simulateNetworkError,
  createSmallSelectionScenario,
} from '../../../lib/__tests__/testUtils';

// Mock all the required hooks and utilities
vi.mock('../../../hooks/useLinkingState');
vi.mock('../../../lib/supabase', () => ({
  supabase: vi.fn(),
}));
vi.mock('../../../lib/api/poiItemLinks', () => ({
  createBulkPoiItemLinks: vi.fn(),
  deleteBulkPoiItemLinks: vi.fn(),
}));

import { useLinkingState } from '../../../hooks/useLinkingState';
import { supabase } from '../../../lib/supabase';
import { createBulkPoiItemLinks, deleteBulkPoiItemLinks } from '../../../lib/api/poiItemLinks';

const mockUseLinkingState = useLinkingState as any;
const mockSupabase = supabase as any;
const mockCreateBulkPoiItemLinks = createBulkPoiItemLinks as any;
const mockDeleteBulkPoiItemLinks = deleteBulkPoiItemLinks as any;

// Test data
const testUser = generateTestUser();
const testPois = generateTestPois(10);
const testItems = generateTestItems(5);
const testSchematics = generateTestSchematics(3);

// Mock component wrapper with router
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('UnifiedPoiLinkingPage Integration Tests', () => {
  beforeEach(() => {
    setupTestEnvironment();
    
    // Setup default mocks
    mockSupabase.mockReturnValue(mockSupabaseClient as any);
    mockSupabaseClient.auth.getUser.mockResolvedValue({ 
      data: { user: testUser }, 
      error: null 
    });

    // Mock useLinkingState hook
    mockUseLinkingState.mockReturnValue({
      selectedPoiIds: new Set(),
      selectedItemIds: new Set(),
      selectedSchematicIds: new Set(),
      linkType: 'found_here',
      pois: testPois,
      items: testItems,
      schematics: testSchematics,
      poiTypes: [],
      categories: [],
      tiers: [],
      isLoading: false,
      error: null,
      setSelectedPoiIds: vi.fn(),
      setSelectedItemIds: vi.fn(),
      setSelectedSchematicIds: vi.fn(),
      setLinkType: vi.fn(),
      refreshData: vi.fn(),
    });
  });

  afterEach(() => {
    teardownTestEnvironment();
  });

  describe('Complete Workflow Integration', () => {
    it('should complete successful linking workflow from start to finish', async () => {
      const mockSetSelectedPoiIds = vi.fn();
      const mockSetSelectedItemIds = vi.fn();
      const mockSetSelectedSchematicIds = vi.fn();

      // Setup successful creation response
      mockCreateBulkPoiItemLinks.mockResolvedValue({
        success: true,
        created: 6, // 2 POIs * (2 items + 1 schematic)
        failed: 0,
        errors: [],
        duplicatesSkipped: 0,
        createdLinks: Array.from({ length: 6 }, (_, i) => ({ 
          id: `link-${i + 1}`, 
          poi_id: `poi-${Math.floor(i / 3) + 1}`, 
          item_id: i < 4 ? `item-${(i % 2) + 1}` : undefined,
          schematic_id: i >= 4 ? 'schematic-1' : undefined,
        })),
      });

      // Mock state with selections
      mockUseLinkingState.mockReturnValue({
        selectedPoiIds: new Set(['poi-1', 'poi-2']),
        selectedItemIds: new Set(['item-1', 'item-2']),
        selectedSchematicIds: new Set(['schematic-1']),
        linkType: 'found_here',
        pois: testPois,
        items: testItems,
        schematics: testSchematics,
        poiTypes: [],
        categories: [],
        tiers: [],
        isLoading: false,
        error: null,
        setSelectedPoiIds: mockSetSelectedPoiIds,
        setSelectedItemIds: mockSetSelectedItemIds,
        setSelectedSchematicIds: mockSetSelectedSchematicIds,
        setLinkType: vi.fn(),
        refreshData: vi.fn(),
      });

      render(
        <TestWrapper>
          <UnifiedPoiLinkingPage />
        </TestWrapper>
      );

      // 1. Verify initial state and selections are displayed
      expect(screen.getByText('Selected POIs: 2')).toBeInTheDocument();
      expect(screen.getByText('Selected Items: 2')).toBeInTheDocument();
      expect(screen.getByText('Selected Schematics: 1')).toBeInTheDocument();

      // 2. Find and click the "Create Links" button
      const createLinksButton = screen.getByRole('button', { name: /create links/i });
      expect(createLinksButton).toBeInTheDocument();
      fireEvent.click(createLinksButton);

      // 3. Verify confirmation modal appears
      await waitFor(() => {
        expect(screen.getByText(/confirm link creation/i)).toBeInTheDocument();
      });

      // 4. Verify modal shows correct summary
      const modal = screen.getByRole('dialog');
      expect(within(modal).getByText('2 POIs')).toBeInTheDocument();
      expect(within(modal).getByText('2 Items')).toBeInTheDocument();
      expect(within(modal).getByText('1 Schematic')).toBeInTheDocument();
      expect(within(modal).getByText('6 total links')).toBeInTheDocument();

      // 5. Confirm the creation
      const confirmButton = within(modal).getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);

      // 6. Wait for creation to complete
      await waitFor(() => {
        expect(mockCreateBulkPoiItemLinks).toHaveBeenCalledWith(
          expect.objectContaining({
            poiIds: ['poi-1', 'poi-2'],
            itemIds: ['item-1', 'item-2'],
            schematicIds: ['schematic-1'],
            linkType: 'found_here',
          })
        );
      });

      // 7. Verify success feedback is displayed
      await waitFor(() => {
        expect(screen.getByText(/successfully created 6 POI links/i)).toBeInTheDocument();
      });

      // 8. Verify success analytics are shown
      expect(screen.getByText('2 POIs')).toBeInTheDocument();
      expect(screen.getByText('2 Items')).toBeInTheDocument();
      expect(screen.getByText('1 Schematic')).toBeInTheDocument();

      // 9. Verify undo button is available
      expect(screen.getByRole('button', { name: /undo operation/i })).toBeInTheDocument();
    });

    it('should handle error scenarios with retry capability', async () => {
      // Setup error response on first call, success on retry
      let callCount = 0;
      mockCreateBulkPoiItemLinks.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network connection failed'));
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

      // Mock state with small selection
      const selection = createSmallSelectionScenario();
      mockUseLinkingState.mockReturnValue({
        selectedPoiIds: selection.poiIds,
        selectedItemIds: selection.itemIds,
        selectedSchematicIds: selection.schematicIds,
        linkType: 'found_here',
        pois: testPois,
        items: testItems,
        schematics: testSchematics,
        poiTypes: [],
        categories: [],
        tiers: [],
        isLoading: false,
        error: null,
        setSelectedPoiIds: vi.fn(),
        setSelectedItemIds: vi.fn(),
        setSelectedSchematicIds: vi.fn(),
        setLinkType: vi.fn(),
        refreshData: vi.fn(),
      });

      render(
        <TestWrapper>
          <UnifiedPoiLinkingPage />
        </TestWrapper>
      );

      // 1. Initiate link creation
      const createLinksButton = screen.getByRole('button', { name: /create links/i });
      fireEvent.click(createLinksButton);

      // 2. Confirm in modal
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);
      });

      // 3. Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText(/failed to create some POI links/i)).toBeInTheDocument();
      });

      // 4. Verify error details
      expect(screen.getByText(/connection failed/i)).toBeInTheDocument();
      expect(screen.getByText(/try again in a moment/i)).toBeInTheDocument();

      // 5. Click retry button
      const retryButton = screen.getByRole('button', { name: /retry operation/i });
      fireEvent.click(retryButton);

      // 6. Wait for retry to succeed
      await waitFor(() => {
        expect(screen.getByText(/successfully created 3 POI links/i)).toBeInTheDocument();
      });

      // 7. Verify retry was called
      expect(mockCreateBulkPoiItemLinks).toHaveBeenCalledTimes(2);
    });

    it('should handle undo functionality correctly', async () => {
      // Setup successful creation
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

      // Setup successful deletion
      mockDeleteBulkPoiItemLinks.mockResolvedValue({
        success: true,
        deletedCount: 3,
        errors: [],
      });

      const selection = createSmallSelectionScenario();
      mockUseLinkingState.mockReturnValue({
        selectedPoiIds: selection.poiIds,
        selectedItemIds: selection.itemIds,
        selectedSchematicIds: selection.schematicIds,
        linkType: 'found_here',
        pois: testPois,
        items: testItems,
        schematics: testSchematics,
        poiTypes: [],
        categories: [],
        tiers: [],
        isLoading: false,
        error: null,
        setSelectedPoiIds: vi.fn(),
        setSelectedItemIds: vi.fn(),
        setSelectedSchematicIds: vi.fn(),
        setLinkType: vi.fn(),
        refreshData: vi.fn(),
      });

      render(
        <TestWrapper>
          <UnifiedPoiLinkingPage />
        </TestWrapper>
      );

      // 1. Create links successfully
      const createLinksButton = screen.getByRole('button', { name: /create links/i });
      fireEvent.click(createLinksButton);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/successfully created 3 POI links/i)).toBeInTheDocument();
      });

      // 2. Click undo button
      const undoButton = screen.getByRole('button', { name: /undo operation/i });
      fireEvent.click(undoButton);

      // 3. Wait for undo to complete
      await waitFor(() => {
        expect(mockDeleteBulkPoiItemLinks).toHaveBeenCalledWith(['link-1', 'link-2', 'link-3']);
      });

      // 4. Verify undo success message
      await waitFor(() => {
        expect(screen.getByText(/operation has been undone/i)).toBeInTheDocument();
      });
    });
  });

  describe('URL State Management Integration', () => {
    it('should sync selections with URL parameters', async () => {
      // Mock URL with selection parameters
      Object.defineProperty(window, 'location', {
        value: {
          search: '?poiIds=poi-1,poi-2&itemIds=item-1&schematicIds=schematic-1&linkType=found_here',
        },
        writable: true,
      });

      const mockSetSelectedPoiIds = vi.fn();
      const mockSetSelectedItemIds = vi.fn();
      const mockSetSelectedSchematicIds = vi.fn();

      mockUseLinkingState.mockReturnValue({
        selectedPoiIds: new Set(['poi-1', 'poi-2']),
        selectedItemIds: new Set(['item-1']),
        selectedSchematicIds: new Set(['schematic-1']),
        linkType: 'found_here',
        pois: testPois,
        items: testItems,
        schematics: testSchematics,
        poiTypes: [],
        categories: [],
        tiers: [],
        isLoading: false,
        error: null,
        setSelectedPoiIds: mockSetSelectedPoiIds,
        setSelectedItemIds: mockSetSelectedItemIds,
        setSelectedSchematicIds: mockSetSelectedSchematicIds,
        setLinkType: vi.fn(),
        refreshData: vi.fn(),
      });

      render(
        <TestWrapper>
          <UnifiedPoiLinkingPage />
        </TestWrapper>
      );

      // Verify URL parameters are reflected in the UI
      expect(screen.getByText('Selected POIs: 2')).toBeInTheDocument();
      expect(screen.getByText('Selected Items: 1')).toBeInTheDocument();
      expect(screen.getByText('Selected Schematics: 1')).toBeInTheDocument();
    });
  });

  describe('Performance Integration Tests', () => {
    it('should handle large selections efficiently', async () => {
      // Create large test datasets
      const largePois = generateTestPois(100);
      const largeItems = generateTestItems(50);
      const largeSchematics = generateTestSchematics(30);

      // Mock large selections
      const largePoiIds = new Set(largePois.slice(0, 50).map(p => p.id));
      const largeItemIds = new Set(largeItems.slice(0, 25).map(i => i.id));
      const largeSchematicIds = new Set(largeSchematics.slice(0, 15).map(s => s.id));

      mockCreateBulkPoiItemLinks.mockImplementation(async () => {
        await simulateNetworkDelay(200); // Simulate realistic delay
        return {
          success: true,
          created: 1875, // 50 POIs * (25 items + 15 schematics)
          failed: 0,
          errors: [],
          duplicatesSkipped: 0,
          createdLinks: Array.from({ length: 1875 }, (_, i) => ({ 
            id: `link-${i + 1}`, 
            poi_id: `poi-${Math.floor(i / 40) + 1}`, 
            item_id: `item-${(i % 25) + 1}` 
          })),
        };
      });

      mockUseLinkingState.mockReturnValue({
        selectedPoiIds: largePoiIds,
        selectedItemIds: largeItemIds,
        selectedSchematicIds: largeSchematicIds,
        linkType: 'found_here',
        pois: largePois,
        items: largeItems,
        schematics: largeSchematics,
        poiTypes: [],
        categories: [],
        tiers: [],
        isLoading: false,
        error: null,
        setSelectedPoiIds: vi.fn(),
        setSelectedItemIds: vi.fn(),
        setSelectedSchematicIds: vi.fn(),
        setLinkType: vi.fn(),
        refreshData: vi.fn(),
      });

      const startTime = performance.now();

      render(
        <TestWrapper>
          <UnifiedPoiLinkingPage />
        </TestWrapper>
      );

      const renderTime = performance.now() - startTime;

      // Verify large selections are displayed correctly
      expect(screen.getByText('Selected POIs: 50')).toBeInTheDocument();
      expect(screen.getByText('Selected Items: 25')).toBeInTheDocument();
      expect(screen.getByText('Selected Schematics: 15')).toBeInTheDocument();

      // Verify rendering performance is acceptable
      expect(renderTime).toBeLessThan(1000); // Should render within 1 second

      // Test creation workflow
      const createLinksButton = screen.getByRole('button', { name: /create links/i });
      fireEvent.click(createLinksButton);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/successfully created 1,875 POI links/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Error Recovery Integration', () => {
    it('should recover from network errors gracefully', async () => {
      const selection = createSmallSelectionScenario();

      // Mock intermittent network failures
      let callCount = 0;
      mockCreateBulkPoiItemLinks.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Network connection failed'));
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

      mockUseLinkingState.mockReturnValue({
        selectedPoiIds: selection.poiIds,
        selectedItemIds: selection.itemIds,
        selectedSchematicIds: selection.schematicIds,
        linkType: 'found_here',
        pois: testPois,
        items: testItems,
        schematics: testSchematics,
        poiTypes: [],
        categories: [],
        tiers: [],
        isLoading: false,
        error: null,
        setSelectedPoiIds: vi.fn(),
        setSelectedItemIds: vi.fn(),
        setSelectedSchematicIds: vi.fn(),
        setLinkType: vi.fn(),
        refreshData: vi.fn(),
      });

      render(
        <TestWrapper>
          <UnifiedPoiLinkingPage />
        </TestWrapper>
      );

      // Start creation process
      const createLinksButton = screen.getByRole('button', { name: /create links/i });
      fireEvent.click(createLinksButton);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);
      });

      // Should show error after first failure
      await waitFor(() => {
        expect(screen.getByText(/failed to create some POI links/i)).toBeInTheDocument();
      });

      // Retry should also fail initially
      const retryButton = screen.getByRole('button', { name: /retry operation/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to create some POI links/i)).toBeInTheDocument();
      });

      // Third attempt should succeed
      const secondRetryButton = screen.getByRole('button', { name: /retry operation/i });
      fireEvent.click(secondRetryButton);

      await waitFor(() => {
        expect(screen.getByText(/successfully created 3 POI links/i)).toBeInTheDocument();
      });

      // Verify all attempts were made
      expect(mockCreateBulkPoiItemLinks).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility Integration', () => {
    it('should provide complete keyboard navigation support', async () => {
      const selection = createSmallSelectionScenario();

      mockUseLinkingState.mockReturnValue({
        selectedPoiIds: selection.poiIds,
        selectedItemIds: selection.itemIds,
        selectedSchematicIds: selection.schematicIds,
        linkType: 'found_here',
        pois: testPois,
        items: testItems,
        schematics: testSchematics,
        poiTypes: [],
        categories: [],
        tiers: [],
        isLoading: false,
        error: null,
        setSelectedPoiIds: vi.fn(),
        setSelectedItemIds: vi.fn(),
        setSelectedSchematicIds: vi.fn(),
        setLinkType: vi.fn(),
        refreshData: vi.fn(),
      });

      render(
        <TestWrapper>
          <UnifiedPoiLinkingPage />
        </TestWrapper>
      );

      // Test keyboard navigation through the workflow
      const createLinksButton = screen.getByRole('button', { name: /create links/i });
      
      // Focus and activate with keyboard
      createLinksButton.focus();
      expect(createLinksButton).toHaveFocus();
      
      fireEvent.keyDown(createLinksButton, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Navigate in modal with keyboard
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      confirmButton.focus();
      expect(confirmButton).toHaveFocus();

      fireEvent.keyDown(confirmButton, { key: 'Space' });

      // Verify the workflow continues properly
      await waitFor(() => {
        expect(mockCreateBulkPoiItemLinks).toHaveBeenCalled();
      });
    });

    it('should provide proper ARIA labels and screen reader support', () => {
      const selection = createSmallSelectionScenario();

      mockUseLinkingState.mockReturnValue({
        selectedPoiIds: selection.poiIds,
        selectedItemIds: selection.itemIds,
        selectedSchematicIds: selection.schematicIds,
        linkType: 'found_here',
        pois: testPois,
        items: testItems,
        schematics: testSchematics,
        poiTypes: [],
        categories: [],
        tiers: [],
        isLoading: false,
        error: null,
        setSelectedPoiIds: vi.fn(),
        setSelectedItemIds: vi.fn(),
        setSelectedSchematicIds: vi.fn(),
        setLinkType: vi.fn(),
        refreshData: vi.fn(),
      });

      render(
        <TestWrapper>
          <UnifiedPoiLinkingPage />
        </TestWrapper>
      );

      // Verify main regions have proper labels
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create links/i })).toBeInTheDocument();
      
      // Verify selection summaries are accessible
      expect(screen.getByText('Selected POIs: 2')).toBeInTheDocument();
      expect(screen.getByText('Selected Items: 1')).toBeInTheDocument();
      expect(screen.getByText('Selected Schematics: 1')).toBeInTheDocument();
    });
  });
}); 