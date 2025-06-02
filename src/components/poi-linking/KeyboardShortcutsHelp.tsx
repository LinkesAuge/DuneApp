import React from 'react';
import { X, Keyboard, Command, Info } from 'lucide-react';
import { FocusedPanel, KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  focusedPanel: FocusedPanel;
  shortcuts: KeyboardShortcut[];
  className?: string;
}

interface ShortcutGroup {
  title: string;
  description: string;
  shortcuts: KeyboardShortcut[];
  icon: React.ReactNode;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
  focusedPanel,
  shortcuts,
  className = ''
}) => {
  if (!isOpen) return null;

  // Helper to format key combinations
  const formatKeyCombo = (shortcut: KeyboardShortcut): string[] => {
    const keys: string[] = [];
    
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    
    // Format special keys
    let key = shortcut.key;
    if (key === ' ') key = 'Space';
    if (key === 'Escape') key = 'Esc';
    if (key === 'Enter') key = '↵';
    if (key === 'Tab') key = '⇥';
    if (key === 'F1') key = 'F1';
    
    keys.push(key.toUpperCase());
    
    return keys;
  };

  // Group shortcuts by category
  const groupShortcuts = (): ShortcutGroup[] => {
    const groups: ShortcutGroup[] = [
      {
        title: 'Selection',
        description: 'Manage item selections in panels',
        shortcuts: [],
        icon: <Command className="w-4 h-4" />
      },
      {
        title: 'Navigation',
        description: 'Move between panels and UI elements',
        shortcuts: [],
        icon: <Keyboard className="w-4 h-4" />
      },
      {
        title: 'Actions',
        description: 'Perform linking operations',
        shortcuts: [],
        icon: <Info className="w-4 h-4" />
      },
      {
        title: 'Help & Utilities',
        description: 'Access help and utility functions',
        shortcuts: [],
        icon: <Info className="w-4 h-4" />
      }
    ];

    // Categorize shortcuts
    shortcuts.forEach(shortcut => {
      const desc = shortcut.description.toLowerCase();
      
      if (desc.includes('select') || desc.includes('clear')) {
        groups[0].shortcuts.push(shortcut);
      } else if (desc.includes('switch') || desc.includes('panel') || desc.includes('navigate')) {
        groups[1].shortcuts.push(shortcut);
      } else if (desc.includes('create') || desc.includes('link') || desc.includes('operation')) {
        groups[2].shortcuts.push(shortcut);
      } else {
        groups[3].shortcuts.push(shortcut);
      }
    });

    // Filter out empty groups
    return groups.filter(group => group.shortcuts.length > 0);
  };

  const shortcutGroups = groupShortcuts();

  // Get focus status message
  const getFocusMessage = (): string => {
    switch (focusedPanel) {
      case 'pois':
        return 'POI panel is currently focused. Selection shortcuts will apply to POIs.';
      case 'items-schematics':
        return 'Items/Schematics panel is currently focused. Selection shortcuts will apply to items or schematics.';
      default:
        return 'No panel is currently focused. Use Tab to focus a panel.';
    }
  };

  const handleEscape = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${className}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleEscape}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Keyboard className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-100">Keyboard Shortcuts</h2>
              <p className="text-sm text-slate-400">Power user efficiency features</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Focus Status */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-start gap-3 p-4 bg-slate-800/50 border border-slate-600/50 rounded-lg">
              <div className="p-1.5 bg-blue-500/10 rounded">
                <Info className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-200 mb-1">Current Focus</h3>
                <p className="text-sm text-slate-400">{getFocusMessage()}</p>
              </div>
            </div>
          </div>

          {/* Shortcut Groups */}
          <div className="p-6 space-y-8">
            {shortcutGroups.map((group, index) => (
              <div key={index}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-amber-500/10 rounded">
                    {group.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-200">{group.title}</h3>
                    <p className="text-sm text-slate-400">{group.description}</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {group.shortcuts.map((shortcut, shortcutIndex) => {
                    const keys = formatKeyCombo(shortcut);
                    const isAvailable = !shortcut.condition || shortcut.condition();
                    
                    return (
                      <div
                        key={shortcutIndex}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isAvailable
                            ? 'bg-slate-800/30 border-slate-700/50'
                            : 'bg-slate-800/10 border-slate-700/30 opacity-50'
                        }`}
                      >
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            isAvailable ? 'text-slate-200' : 'text-slate-500'
                          }`}>
                            {shortcut.description}
                          </p>
                          {!isAvailable && (
                            <p className="text-xs text-slate-500 mt-1">
                              Currently unavailable
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 ml-4">
                          {keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              {keyIndex > 0 && (
                                <span className="text-slate-500 text-xs mx-1">+</span>
                              )}
                              <kbd
                                className={`px-2 py-1 text-xs font-mono rounded border ${
                                  isAvailable
                                    ? 'bg-slate-700 border-slate-600 text-slate-300'
                                    : 'bg-slate-800 border-slate-700 text-slate-500'
                                }`}
                              >
                                {key}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="p-6 border-t border-slate-700/50">
            <h3 className="text-lg font-semibold text-amber-200 mb-4">Tips</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <p>Use <kbd className="px-1 py-0.5 bg-slate-700 border border-slate-600 rounded text-xs">Tab</kbd> to switch focus between panels</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <p>Shortcuts work globally except when typing in input fields</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <p>Press <kbd className="px-1 py-0.5 bg-slate-700 border border-slate-600 rounded text-xs">Esc</kbd> in any input field to unfocus it</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <p>Some shortcuts are context-sensitive and only work when conditions are met</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Press <kbd className="px-1 py-0.5 bg-slate-700 border border-slate-600 rounded">F1</kbd> or{' '}
              <kbd className="px-1 py-0.5 bg-slate-700 border border-slate-600 rounded">?</kbd> anytime to show this help
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp; 