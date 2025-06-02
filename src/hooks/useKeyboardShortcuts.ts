import { useEffect, useCallback, useState, useRef } from 'react';

export type FocusedPanel = 'pois' | 'items-schematics' | 'none';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: () => void;
  condition?: () => boolean;
  preventDefault?: boolean;
}

export interface KeyboardShortcutsState {
  focusedPanel: FocusedPanel;
  shortcutsEnabled: boolean;
  showHelp: boolean;
}

export interface KeyboardShortcutsActions {
  setFocusedPanel: (panel: FocusedPanel) => void;
  setShortcutsEnabled: (enabled: boolean) => void;
  toggleHelp: () => void;
  registerShortcut: (id: string, shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  clearAllShortcuts: () => void;
}

export interface UseKeyboardShortcutsOptions {
  enableGlobalShortcuts?: boolean;
  debugMode?: boolean;
  preventDefaultOnInputs?: boolean;
}

export interface UseKeyboardShortcutsReturn extends KeyboardShortcutsState, KeyboardShortcutsActions {
  activeShortcuts: KeyboardShortcut[];
  availableShortcuts: { [key: string]: KeyboardShortcut };
}

export function useKeyboardShortcuts(
  options: UseKeyboardShortcutsOptions = {}
): UseKeyboardShortcutsReturn {
  const {
    enableGlobalShortcuts = true,
    debugMode = false,
    preventDefaultOnInputs = true
  } = options;

  // State management
  const [focusedPanel, setFocusedPanel] = useState<FocusedPanel>('none');
  const [shortcutsEnabled, setShortcutsEnabled] = useState(enableGlobalShortcuts);
  const [showHelp, setShowHelp] = useState(false);

  // Refs for tracking shortcuts
  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map());
  const debugRef = useRef(debugMode);

  // Update debug mode
  useEffect(() => {
    debugRef.current = debugMode;
  }, [debugMode]);

  // Helper to check if element is an input
  const isInputElement = useCallback((element: Element): boolean => {
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    const contentEditable = element.getAttribute('contenteditable') === 'true';
    
    return inputTypes.includes(tagName) || contentEditable;
  }, []);

  // Helper to match key combination
  const matchesShortcut = useCallback((event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
    return (
      event.key.toLowerCase() === shortcut.key.toLowerCase() &&
      !!event.ctrlKey === !!shortcut.ctrlKey &&
      !!event.altKey === !!shortcut.altKey &&
      !!event.shiftKey === !!shortcut.shiftKey
    );
  }, []);

  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't process if shortcuts are disabled
    if (!shortcutsEnabled) return;

    const target = event.target as Element;
    const isInput = isInputElement(target);

    // Skip processing on inputs unless explicitly allowed
    if (isInput && preventDefaultOnInputs) {
      // Allow Escape on inputs to unfocus/clear
      if (event.key === 'Escape') {
        if (target instanceof HTMLElement) {
          target.blur();
        }
        return;
      }
      return;
    }

    // Debug logging
    if (debugRef.current) {
      console.log('Keyboard event:', {
        key: event.key,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        focusedPanel,
        target: target.tagName,
        isInput
      });
    }

    // Process registered shortcuts
    const shortcuts = Array.from(shortcutsRef.current.values());
    
    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut)) {
        // Check condition if provided
        if (shortcut.condition && !shortcut.condition()) {
          continue;
        }

        // Prevent default if specified
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
          event.stopPropagation();
        }

        // Execute action
        try {
          shortcut.action();
          
          if (debugRef.current) {
            console.log('Executed shortcut:', shortcut.description);
          }
        } catch (error) {
          console.error('Error executing shortcut:', error);
        }

        break; // Only execute first matching shortcut
      }
    }
  }, [shortcutsEnabled, focusedPanel, preventDefaultOnInputs, isInputElement, matchesShortcut]);

  // Set up global event listener
  useEffect(() => {
    if (enableGlobalShortcuts) {
      document.addEventListener('keydown', handleKeyDown, { capture: true });
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown, { capture: true });
      };
    }
  }, [enableGlobalShortcuts, handleKeyDown]);

  // Shortcut registration functions
  const registerShortcut = useCallback((id: string, shortcut: KeyboardShortcut) => {
    shortcutsRef.current.set(id, shortcut);
    
    if (debugRef.current) {
      console.log('Registered shortcut:', id, shortcut);
    }
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    const removed = shortcutsRef.current.delete(id);
    
    if (debugRef.current && removed) {
      console.log('Unregistered shortcut:', id);
    }
  }, []);

  const clearAllShortcuts = useCallback(() => {
    shortcutsRef.current.clear();
    
    if (debugRef.current) {
      console.log('Cleared all shortcuts');
    }
  }, []);

  // Help modal toggle
  const toggleHelp = useCallback(() => {
    setShowHelp(prev => !prev);
  }, []);

  // Focus management
  const handleSetFocusedPanel = useCallback((panel: FocusedPanel) => {
    setFocusedPanel(panel);
    
    if (debugRef.current) {
      console.log('Focus changed to panel:', panel);
    }
  }, []);

  // Get active shortcuts (for display purposes)
  const activeShortcuts = Array.from(shortcutsRef.current.values())
    .filter(shortcut => !shortcut.condition || shortcut.condition());

  // Get all available shortcuts
  const availableShortcuts = Object.fromEntries(shortcutsRef.current.entries());

  return {
    // State
    focusedPanel,
    shortcutsEnabled,
    showHelp,
    
    // Actions
    setFocusedPanel: handleSetFocusedPanel,
    setShortcutsEnabled,
    toggleHelp,
    registerShortcut,
    unregisterShortcut,
    clearAllShortcuts,
    
    // Computed
    activeShortcuts,
    availableShortcuts
  };
}

// Helper hook for common POI linking shortcuts
export function usePOILinkingShortcuts({
  onSelectAllPois,
  onSelectAllItems,
  onSelectAllSchematics,
  onClearSelections,
  onCreateLinks,
  onTogglePanel,
  onShowHelp,
  canCreateLinks,
  hasSelections,
  focusedPanel
}: {
  onSelectAllPois: () => void;
  onSelectAllItems: () => void;
  onSelectAllSchematics: () => void;
  onClearSelections: () => void;
  onCreateLinks: () => void;
  onTogglePanel: () => void;
  onShowHelp: () => void;
  canCreateLinks: () => boolean;
  hasSelections: () => boolean;
  focusedPanel: FocusedPanel;
}) {
  const shortcuts = useKeyboardShortcuts({ debugMode: false });

  useEffect(() => {
    // Clear existing shortcuts
    shortcuts.clearAllShortcuts();

    // Register POI linking specific shortcuts
    
    // Ctrl+A - Select all in focused panel
    shortcuts.registerShortcut('select-all', {
      key: 'a',
      ctrlKey: true,
      description: 'Select all items in focused panel',
      action: () => {
        if (focusedPanel === 'pois') {
          onSelectAllPois();
        } else if (focusedPanel === 'items-schematics') {
          // This will need to be handled based on active tab
          onSelectAllItems();
        }
      },
      condition: () => focusedPanel !== 'none'
    });

    // Escape - Clear selections or close modals
    shortcuts.registerShortcut('escape', {
      key: 'Escape',
      description: 'Clear selections or close modals',
      action: () => {
        if (hasSelections()) {
          onClearSelections();
        }
      },
      condition: () => hasSelections()
    });

    // Tab - Switch between panels
    shortcuts.registerShortcut('switch-panels', {
      key: 'Tab',
      description: 'Switch between POI and Items/Schematics panels',
      action: () => {
        onTogglePanel();
      },
      preventDefault: true
    });

    // Enter - Create links when valid
    shortcuts.registerShortcut('create-links', {
      key: 'Enter',
      ctrlKey: true,
      description: 'Create links (when valid selections exist)',
      action: () => {
        if (canCreateLinks()) {
          onCreateLinks();
        }
      },
      condition: () => canCreateLinks()
    });

    // F1 or ? - Show help
    shortcuts.registerShortcut('show-help', {
      key: 'F1',
      description: 'Show keyboard shortcuts help',
      action: onShowHelp
    });

    shortcuts.registerShortcut('show-help-question', {
      key: '?',
      shiftKey: true,
      description: 'Show keyboard shortcuts help',
      action: onShowHelp
    });

    // Cleanup on unmount
    return () => {
      shortcuts.clearAllShortcuts();
    };
  }, [
    shortcuts,
    onSelectAllPois,
    onSelectAllItems,
    onSelectAllSchematics,
    onClearSelections,
    onCreateLinks,
    onTogglePanel,
    onShowHelp,
    canCreateLinks,
    hasSelections,
    focusedPanel
  ]);

  return shortcuts;
} 