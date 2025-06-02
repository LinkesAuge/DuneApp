import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Undo2, 
  Clock,
  TrendingUp,
  Users,
  Box,
  Package,
  MapPin
} from 'lucide-react';
import type { LinkCreationResult, EnhancedError } from '../../lib/linkingUtils';

interface EnhancedFeedbackDisplayProps {
  result: LinkCreationResult | null;
  isLoading?: boolean;
  onRetry?: () => void;
  onUndo?: () => void;
  onClose?: () => void;
}

export function EnhancedFeedbackDisplay({
  result,
  isLoading,
  onRetry,
  onUndo,
  onClose
}: EnhancedFeedbackDisplayProps) {
  if (!result) return null;

  // Success state
  if (result.success && result.created > 0) {
    return (
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md space-y-3">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Links Created Successfully!
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Created <strong>{result.created}</strong> new POI link{result.created !== 1 ? 's' : ''} 
                {result.duplicatesSkipped > 0 && (
                  <span className="text-green-600">
                    {' '}(skipped {result.duplicatesSkipped} duplicate{result.duplicatesSkipped !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Success Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="flex items-center space-x-2 text-sm text-green-700">
            <MapPin className="h-4 w-4" />
            <span>{result.analytics.poiBreakdown ? Object.keys(result.analytics.poiBreakdown).length : 0} POIs</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-700">
            <Box className="h-4 w-4" />
            <span>{result.analytics.itemLinks} Items</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-700">
            <Package className="h-4 w-4" />
            <span>{result.analytics.schematicLinks} Schematics</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            <span>{(result.analytics.duration / 1000).toFixed(1)}s</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3 pt-2">
          {result.canUndo && onUndo && (
            <button
              onClick={onUndo}
              className="inline-flex items-center px-3 py-1.5 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Undo2 className="h-4 w-4 mr-1" />
              Undo Operation
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-sm text-green-600 hover:text-green-800"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (result.enhancedErrors.length > 0 || result.errors.length > 0) {
    const primaryError = result.enhancedErrors[0];
    const severityIcon = primaryError?.severity === 'high' || primaryError?.severity === 'critical' 
      ? XCircle 
      : AlertCircle;
    const SeverityIcon = severityIcon;
    const severityColor = primaryError?.severity === 'high' || primaryError?.severity === 'critical'
      ? 'red'
      : primaryError?.severity === 'medium' 
      ? 'yellow' 
      : 'orange';

    return (
      <div className={`bg-${severityColor}-50 border-l-4 border-${severityColor}-400 p-4 rounded-md space-y-3`}>
        <div className="flex items-start">
          <SeverityIcon className={`h-5 w-5 text-${severityColor}-400 mt-0.5`} />
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium text-${severityColor}-800`}>
              {primaryError ? primaryError.userMessage : 'Operation Failed'}
            </h3>
            {primaryError?.suggestedAction && (
              <p className={`mt-1 text-sm text-${severityColor}-700`}>
                {primaryError.suggestedAction}
              </p>
            )}
          </div>
        </div>

        {/* Partial success info */}
        {result.created > 0 && (
          <div className={`bg-${severityColor}-100 p-3 rounded border-l-2 border-${severityColor}-300`}>
            <p className={`text-sm text-${severityColor}-800`}>
              <strong>Partial Success:</strong> {result.created} link{result.created !== 1 ? 's' : ''} were created before the error occurred.
            </p>
          </div>
        )}

        {/* Retry history */}
        {result.retryHistory && result.retryHistory.length > 0 && (
          <div className={`text-sm text-${severityColor}-700`}>
            <p className="font-medium">Retry attempts: {result.retryHistory.length}</p>
          </div>
        )}

        {/* Error details for technical users */}
        {result.enhancedErrors.length > 1 && (
          <details className="mt-3">
            <summary className={`text-sm font-medium text-${severityColor}-800 cursor-pointer`}>
              View all errors ({result.enhancedErrors.length})
            </summary>
            <div className="mt-2 space-y-2">
              {result.enhancedErrors.map((error, index) => (
                <div key={index} className={`text-sm text-${severityColor}-700 pl-4 border-l-2 border-${severityColor}-200`}>
                  <p><strong>{error.type}:</strong> {error.userMessage}</p>
                  {error.suggestedAction && <p className="text-xs mt-1">{error.suggestedAction}</p>}
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Action buttons */}
        <div className="flex items-center space-x-3 pt-2">
          {result.canRetry && onRetry && (
            <button
              onClick={onRetry}
              disabled={isLoading}
              className={`inline-flex items-center px-3 py-1.5 border border-${severityColor}-300 text-sm font-medium rounded-md text-${severityColor}-700 bg-${severityColor}-50 hover:bg-${severityColor}-100 focus:outline-none focus:ring-2 focus:ring-${severityColor}-500 disabled:opacity-50`}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Retrying...' : 'Retry Operation'}
            </button>
          )}
          {result.canUndo && onUndo && result.created > 0 && (
            <button
              onClick={onUndo}
              className={`inline-flex items-center px-3 py-1.5 border border-${severityColor}-300 text-sm font-medium rounded-md text-${severityColor}-700 bg-${severityColor}-50 hover:bg-${severityColor}-100 focus:outline-none focus:ring-2 focus:ring-${severityColor}-500`}
            >
              <Undo2 className="h-4 w-4 mr-1" />
              Undo Partial Success
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className={`text-sm text-${severityColor}-600 hover:text-${severityColor}-800`}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    );
  }

  // No operation performed
  return null;
} 