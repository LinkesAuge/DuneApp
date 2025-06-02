import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { EnhancedFeedbackDisplay } from '../EnhancedFeedbackDisplay';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  generateTestEnhancedError,
  expectValidLinkCreationResult,
} from '../../../lib/__tests__/testUtils';
import type { LinkCreationResult, EnhancedError } from '../../../types';

describe('EnhancedFeedbackDisplay', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  afterEach(() => {
    teardownTestEnvironment();
  });

  const mockOnRetry = vi.fn();
  const mockOnUndo = vi.fn();
  const mockOnDismiss = vi.fn();

  const createSuccessResult = (overrides: Partial<LinkCreationResult> = {}): LinkCreationResult => ({
    success: true,
    created: 25,
    failed: 0,
    errors: [],
    enhancedErrors: [],
    duplicatesSkipped: 3,
    totalProcessed: 25,
    canRetry: false,
    canUndo: true,
    operationId: 'test-operation-1',
    createdLinkIds: Array.from({ length: 25 }, (_, i) => `link-${i + 1}`),
    analytics: {
      poiCount: 5,
      itemCount: 3,
      schematicCount: 2,
      duration: 1250,
      linksCreated: 25,
      linkType: 'found_here'
    },
    performanceMetrics: {
      totalDuration: 1250,
      avgLinkCreationTime: 50,
      batchProcessingTime: 1200,
      networkLatency: 50
    },
    retryHistory: [],
    ...overrides,
  });

  const createErrorResult = (overrides: Partial<LinkCreationResult> = {}): LinkCreationResult => ({
    success: false,
    created: 2,
    failed: 3,
    errors: ['Network timeout', 'Database constraint violation'],
    enhancedErrors: [
      generateTestEnhancedError({ 
        type: 'network', 
        severity: 'medium', 
        retryable: true,
        userMessage: 'Connection failed. Please check your internet connection.',
        suggestedAction: 'Try again in a moment'
      }),
      generateTestEnhancedError({ 
        type: 'database', 
        severity: 'high', 
        retryable: false,
        userMessage: 'Database error occurred while saving links.',
        suggestedAction: 'Please check your data and try again'
      }),
    ],
    duplicatesSkipped: 1,
    totalProcessed: 5,
    canRetry: true,
    canUndo: true,
    operationId: 'test-operation-2',
    createdLinkIds: ['link-1', 'link-2'],
    analytics: {
      poiCount: 3,
      itemCount: 2,
      schematicCount: 1,
      duration: 850,
      linksCreated: 2,
      linkType: 'found_here'
    },
    performanceMetrics: {
      totalDuration: 850,
      avgLinkCreationTime: 425,
      batchProcessingTime: 800,
      networkLatency: 50
    },
    retryHistory: [],
    ...overrides,
  });

  describe('Success State Display', () => {
    it('should display success message and analytics correctly', () => {
      const successResult = createSuccessResult();
      
      render(
        <EnhancedFeedbackDisplay
          result={successResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      // Check success message
      expect(screen.getByText(/Successfully created 25 POI links/)).toBeInTheDocument();
      
      // Check analytics breakdown
      expect(screen.getByText('5 POIs')).toBeInTheDocument();
      expect(screen.getByText('3 Items')).toBeInTheDocument();
      expect(screen.getByText('2 Schematics')).toBeInTheDocument();
      expect(screen.getByText('1.25s')).toBeInTheDocument();
      
      // Check duplicates info
      expect(screen.getByText('3 duplicate links were skipped')).toBeInTheDocument();
      
      // Check undo button is present
      expect(screen.getByRole('button', { name: /undo operation/i })).toBeInTheDocument();
      
      // Check dismiss button
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('should handle undo button click', async () => {
      const successResult = createSuccessResult();
      
      render(
        <EnhancedFeedbackDisplay
          result={successResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      const undoButton = screen.getByRole('button', { name: /undo operation/i });
      fireEvent.click(undoButton);

      await waitFor(() => {
        expect(mockOnUndo).toHaveBeenCalledWith(successResult.operationId);
      });
    });

    it('should handle dismiss button click', async () => {
      const successResult = createSuccessResult();
      
      render(
        <EnhancedFeedbackDisplay
          result={successResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });
    });

    it('should not show undo button when canUndo is false', () => {
      const successResult = createSuccessResult({ canUndo: false });
      
      render(
        <EnhancedFeedbackDisplay
          result={successResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByRole('button', { name: /undo operation/i })).not.toBeInTheDocument();
    });

    it('should handle zero duplicates correctly', () => {
      const successResult = createSuccessResult({ duplicatesSkipped: 0 });
      
      render(
        <EnhancedFeedbackDisplay
          result={successResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByText(/duplicate links were skipped/)).not.toBeInTheDocument();
    });
  });

  describe('Error State Display', () => {
    it('should display error message and enhanced errors correctly', () => {
      const errorResult = createErrorResult();
      
      render(
        <EnhancedFeedbackDisplay
          result={errorResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      // Check error message
      expect(screen.getByText(/Failed to create some POI links/)).toBeInTheDocument();
      expect(screen.getByText('Created: 2, Failed: 3')).toBeInTheDocument();
      
      // Check enhanced errors
      expect(screen.getByText(/Connection failed. Please check your internet connection/)).toBeInTheDocument();
      expect(screen.getByText(/Database error occurred while saving links/)).toBeInTheDocument();
      
      // Check suggested actions
      expect(screen.getByText('Try again in a moment')).toBeInTheDocument();
      expect(screen.getByText('Please check your data and try again')).toBeInTheDocument();
      
      // Check retry button is present
      expect(screen.getByRole('button', { name: /retry operation/i })).toBeInTheDocument();
      
      // Check undo button for partial success
      expect(screen.getByRole('button', { name: /undo successful links/i })).toBeInTheDocument();
    });

    it('should display error severity levels correctly', () => {
      const errorResult = createErrorResult();
      
      render(
        <EnhancedFeedbackDisplay
          result={errorResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      // Check for severity indicators (these would be styled differently)
      const networkError = screen.getByText(/Connection failed/);
      const databaseError = screen.getByText(/Database error/);
      
      expect(networkError).toBeInTheDocument();
      expect(databaseError).toBeInTheDocument();
    });

    it('should handle retry button click', async () => {
      const errorResult = createErrorResult();
      
      render(
        <EnhancedFeedbackDisplay
          result={errorResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry operation/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalled();
      });
    });

    it('should handle undo button click for partial success', async () => {
      const errorResult = createErrorResult();
      
      render(
        <EnhancedFeedbackDisplay
          result={errorResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      const undoButton = screen.getByRole('button', { name: /undo successful links/i });
      fireEvent.click(undoButton);

      await waitFor(() => {
        expect(mockOnUndo).toHaveBeenCalledWith(errorResult.operationId);
      });
    });

    it('should not show retry button when canRetry is false', () => {
      const errorResult = createErrorResult({ canRetry: false });
      
      render(
        <EnhancedFeedbackDisplay
          result={errorResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByRole('button', { name: /retry operation/i })).not.toBeInTheDocument();
    });

    it('should not show undo button for complete failure', () => {
      const errorResult = createErrorResult({ 
        created: 0, 
        canUndo: false,
        createdLinkIds: []
      });
      
      render(
        <EnhancedFeedbackDisplay
          result={errorResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument();
    });
  });

  describe('Error Details Expansion', () => {
    it('should expand and collapse error details', async () => {
      const errorResult = createErrorResult();
      
      render(
        <EnhancedFeedbackDisplay
          result={errorResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      // Initially, technical details should be hidden
      expect(screen.queryByText('Error stack trace here')).not.toBeInTheDocument();
      
      // Find and click the expand button
      const expandButton = screen.getByRole('button', { name: /show error details/i });
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Error stack trace here')).toBeInTheDocument();
      });

      // Click again to collapse
      const collapseButton = screen.getByRole('button', { name: /hide error details/i });
      fireEvent.click(collapseButton);

      await waitFor(() => {
        expect(screen.queryByText('Error stack trace here')).not.toBeInTheDocument();
      });
    });

    it('should show technical details for each enhanced error', async () => {
      const errorResult = createErrorResult();
      
      render(
        <EnhancedFeedbackDisplay
          result={errorResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      // Expand error details
      const expandButton = screen.getByRole('button', { name: /show error details/i });
      fireEvent.click(expandButton);

      await waitFor(() => {
        // Should show technical details for each error
        expect(screen.getAllByText('Error stack trace here')).toHaveLength(2);
        expect(screen.getAllByText('TEST_ERROR')).toHaveLength(2);
      });
    });
  });

  describe('Retry History Display', () => {
    it('should display retry history when present', () => {
      const errorResult = createErrorResult({
        retryHistory: [
          {
            attempt: 1,
            timestamp: new Date(),
            success: false,
            enhancedError: generateTestEnhancedError({ type: 'network' }),
            delay: 1000,
          },
          {
            attempt: 2,
            timestamp: new Date(),
            success: false,
            enhancedError: generateTestEnhancedError({ type: 'rate_limit' }),
            delay: 2000,
          },
        ],
      });
      
      render(
        <EnhancedFeedbackDisplay
          result={errorResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText(/Previous attempts:/)).toBeInTheDocument();
      expect(screen.getByText(/Attempt 1/)).toBeInTheDocument();
      expect(screen.getByText(/Attempt 2/)).toBeInTheDocument();
    });

    it('should not display retry history section when empty', () => {
      const errorResult = createErrorResult({ retryHistory: [] });
      
      render(
        <EnhancedFeedbackDisplay
          result={errorResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByText(/Previous attempts:/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      const successResult = createSuccessResult();
      
      render(
        <EnhancedFeedbackDisplay
          result={successResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      // Check for accessibility attributes
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /undo operation/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const successResult = createSuccessResult();
      
      render(
        <EnhancedFeedbackDisplay
          result={successResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      const undoButton = screen.getByRole('button', { name: /undo operation/i });
      
      // Simulate keyboard interaction
      undoButton.focus();
      expect(undoButton).toHaveFocus();
      
      fireEvent.keyDown(undoButton, { key: 'Enter' });
      
      await waitFor(() => {
        expect(mockOnUndo).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle result with no analytics gracefully', () => {
      const resultWithoutAnalytics = createSuccessResult();
      delete (resultWithoutAnalytics as any).analytics;
      
      render(
        <EnhancedFeedbackDisplay
          result={resultWithoutAnalytics}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      // Should still display basic success message
      expect(screen.getByText(/Successfully created 25 POI links/)).toBeInTheDocument();
    });

    it('should handle result with empty enhanced errors array', () => {
      const errorResult = createErrorResult({ enhancedErrors: [] });
      
      render(
        <EnhancedFeedbackDisplay
          result={errorResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      // Should still display basic error message
      expect(screen.getByText(/Failed to create some POI links/)).toBeInTheDocument();
    });

    it('should handle very large numbers correctly', () => {
      const largeResult = createSuccessResult({
        created: 10000,
        analytics: {
          poiCount: 500,
          itemCount: 200,
          schematicCount: 100,
          duration: 45000,
          linksCreated: 10000,
          linkType: 'found_here'
        }
      });
      
      render(
        <EnhancedFeedbackDisplay
          result={largeResult}
          onRetry={mockOnRetry}
          onUndo={mockOnUndo}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText(/Successfully created 10,000 POI links/)).toBeInTheDocument();
      expect(screen.getByText('500 POIs')).toBeInTheDocument();
      expect(screen.getByText('45s')).toBeInTheDocument();
    });
  });
}); 