import React, { useState, useEffect } from 'react';
import { 
  History, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Undo2, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  Box,
  Package,
  Trash2
} from 'lucide-react';
import { 
  getOperationHistory, 
  clearOperationHistory, 
  undoLinkCreation,
  type LinkingOperation 
} from '../../lib/linkingUtils';

interface LinkingOperationHistoryProps {
  onOperationUndone?: () => void;
  className?: string;
}

export function LinkingOperationHistory({ 
  onOperationUndone, 
  className = '' 
}: LinkingOperationHistoryProps) {
  const [operations, setOperations] = useState<LinkingOperation[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [undoingOperations, setUndoingOperations] = useState<Set<string>>(new Set());

  // Load operations on mount and set up periodic refresh
  useEffect(() => {
    loadOperations();
    const interval = setInterval(loadOperations, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadOperations = () => {
    const history = getOperationHistory();
    setOperations(history);
  };

  const handleUndo = async (operationId: string) => {
    setUndoingOperations(prev => new Set(prev).add(operationId));
    
    try {
      const result = await undoLinkCreation(operationId);
      
      if (result.success) {
        loadOperations(); // Refresh history
        onOperationUndone?.();
      } else {
        console.error('Undo failed:', result.errors);
        // You might want to show an error toast here
      }
    } catch (error) {
      console.error('Undo operation failed:', error);
    } finally {
      setUndoingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(operationId);
        return newSet;
      });
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear the operation history? This cannot be undone.')) {
      clearOperationHistory();
      setOperations([]);
    }
  };

  const getStatusIcon = (operation: LinkingOperation) => {
    switch (operation.status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'undone':
        return <Undo2 className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTimeRemaining = (operation: LinkingOperation): string | null => {
    if (!operation.canUndo) return null;
    
    const now = new Date();
    const expiry = new Date(operation.undoExpiry);
    const remaining = expiry.getTime() - now.getTime();
    
    if (remaining <= 0) return null;
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`;
    }
    return `${seconds}s remaining`;
  };

  const formatOperationType = (operation: LinkingOperation): string => {
    switch (operation.type) {
      case 'create':
        return `Created ${operation.details.linksCreated} link${operation.details.linksCreated !== 1 ? 's' : ''}`;
      case 'undo':
        return `Undid ${Math.abs(operation.details.linksCreated)} link${Math.abs(operation.details.linksCreated) !== 1 ? 's' : ''}`;
      case 'delete':
        return `Deleted ${Math.abs(operation.details.linksCreated)} link${Math.abs(operation.details.linksCreated) !== 1 ? 's' : ''}`;
      default:
        return 'Unknown operation';
    }
  };

  if (operations.length === 0) {
    return (
      <div className={`bg-slate-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center text-slate-500">
          <History className="h-5 w-5 mr-2" />
          <span className="text-sm">No recent operations</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-50 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 font-medium"
        >
          <History className="h-4 w-4" />
          <span className="text-sm">Recent Operations ({operations.length})</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {operations.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-xs text-slate-500 hover:text-red-600 flex items-center space-x-1"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Operations List */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto">
          {operations.map((operation) => {
            const timeRemaining = getTimeRemaining(operation);
            const isUndoing = undoingOperations.has(operation.id);
            
            return (
              <div
                key={operation.id}
                className="p-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 flex-1">
                    {getStatusIcon(operation)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 text-sm">
                        <span className="font-medium text-slate-900">
                          {formatOperationType(operation)}
                        </span>
                        {operation.status === 'failed' && operation.errorInfo && (
                          <span className="text-xs text-red-600">
                            ({operation.errorInfo.type})
                          </span>
                        )}
                      </div>
                      
                      {/* Operation details */}
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{operation.details.poiCount} POIs</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Box className="h-3 w-3" />
                          <span>{operation.details.itemCount} Items</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Package className="h-3 w-3" />
                          <span>{operation.details.schematicCount} Schematics</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-500">
                          {new Date(operation.timestamp).toLocaleString()}
                        </span>
                        {timeRemaining && (
                          <span className="text-xs text-amber-600 font-medium">
                            {timeRemaining}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Undo button */}
                  {operation.canUndo && operation.status !== 'undone' && (
                    <button
                      onClick={() => handleUndo(operation.id)}
                      disabled={isUndoing}
                      className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                    >
                      <Undo2 className={`h-3 w-3 mr-1 ${isUndoing ? 'animate-spin' : ''}`} />
                      {isUndoing ? 'Undoing...' : 'Undo'}
                    </button>
                  )}
                </div>
                
                {/* Error details for failed operations */}
                {operation.status === 'failed' && operation.errorInfo && (
                  <div className="mt-2 p-2 bg-red-50 border-l-2 border-red-200 rounded">
                    <p className="text-xs text-red-700">
                      <strong>Error:</strong> {operation.errorInfo.userMessage}
                    </p>
                    {operation.errorInfo.suggestedAction && (
                      <p className="text-xs text-red-600 mt-1">
                        {operation.errorInfo.suggestedAction}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 