import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Hash, Clock, Play, Plus, Settings, X, Command } from 'lucide-react';
import { useSnippetsStore, Snippet } from '../stores/snippets';
import { keyboardManager, formatKeyCombo } from '../lib/keyboard';
import { useSettingsStore } from '../stores/settings';
import * as cmds from '../lib/tauri-commands';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessionId?: string;
}

interface PaletteItem {
  id: string;
  type: 'snippet' | 'command' | 'action';
  title: string;
  description?: string;
  command?: string;
  category?: string;
  tags?: string[];
  icon?: React.ReactNode;
  action?: () => void;
}

const BUILT_IN_ACTIONS: PaletteItem[] = [
  {
    id: 'new-snippet',
    type: 'action',
    title: 'New Snippet',
    description: 'Create a new command snippet',
    icon: <Plus size={16} />,
    action: () => {
      // This would open a new snippet dialog
      console.log('Open new snippet dialog');
    }
  },
  {
    id: 'manage-snippets',
    type: 'action',
    title: 'Manage Snippets',
    description: 'Open snippet management interface',
    icon: <Settings size={16} />,
    action: () => {
      // This would open snippet management
      console.log('Open snippet management');
    }
  },
  {
    id: 'settings',
    type: 'action',
    title: 'Settings',
    description: 'Open application settings',
    icon: <Settings size={16} />,
    action: () => {
      // This would open settings
      console.log('Open settings');
    }
  }
];

export function CommandPalette({ isOpen, onClose, activeSessionId }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState<PaletteItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  const { snippets, useSnippet, searchSnippets } = useSnippetsStore();
  const { getShortcut } = useSettingsStore();

  // Convert snippets to palette items
  const snippetItems: PaletteItem[] = snippets.map(snippet => ({
    id: snippet.id,
    type: 'snippet',
    title: snippet.name,
    description: snippet.description || snippet.command,
    command: snippet.command,
    category: snippet.category,
    tags: snippet.tags,
    icon: <Command size={16} />
  }));

  const allItems = [...BUILT_IN_ACTIONS, ...snippetItems];

  // Filter items based on query
  useEffect(() => {
    if (!query.trim()) {
      // Show recent and frequently used snippets when no query
      const recentSnippets = snippets
        .filter(s => s.lastUsed)
        .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
        .slice(0, 5);
      
      const frequentSnippets = snippets
        .filter(s => s.useCount > 0)
        .sort((a, b) => b.useCount - a.useCount)
        .slice(0, 5);

      const combinedSnippets = Array.from(
        new Map(
          [...recentSnippets, ...frequentSnippets]
            .map(s => [s.id, s])
        ).values()
      ).slice(0, 8);

      const recentItems: PaletteItem[] = combinedSnippets.map(snippet => ({
        id: snippet.id,
        type: 'snippet',
        title: snippet.name,
        description: snippet.description || snippet.command,
        command: snippet.command,
        category: snippet.category,
        tags: snippet.tags,
        icon: <Clock size={16} />
      }));

      setFilteredItems([...BUILT_IN_ACTIONS, ...recentItems]);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = allItems.filter(item => {
        if (item.type === 'action') {
          return item.title.toLowerCase().includes(lowerQuery) ||
                 item.description?.toLowerCase().includes(lowerQuery);
        } else {
          return item.title.toLowerCase().includes(lowerQuery) ||
                 item.description?.toLowerCase().includes(lowerQuery) ||
                 item.command?.toLowerCase().includes(lowerQuery) ||
                 item.category?.toLowerCase().includes(lowerQuery) ||
                 item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
        }
      });

      // Sort by relevance
      filtered.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        
        // Exact title match first
        if (aTitle.startsWith(lowerQuery) && !bTitle.startsWith(lowerQuery)) return -1;
        if (!aTitle.startsWith(lowerQuery) && bTitle.startsWith(lowerQuery)) return 1;
        
        // Then by use count for snippets
        if (a.type === 'snippet' && b.type === 'snippet') {
          const aSnippet = snippets.find(s => s.id === a.id);
          const bSnippet = snippets.find(s => s.id === b.id);
          if (aSnippet && bSnippet) {
            return bSnippet.useCount - aSnippet.useCount;
          }
        }
        
        return aTitle.localeCompare(bTitle);
      });

      setFilteredItems(filtered);
    }
    setSelectedIndex(0);
  }, [query, snippets]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeSelectedItem();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && filteredItems.length > 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, filteredItems]);

  const executeSelectedItem = useCallback(() => {
    const item = filteredItems[selectedIndex];
    if (!item) return;

    if (item.type === 'snippet' && item.command && activeSessionId) {
      // Execute snippet command
      cmds.sendInput(activeSessionId, item.command + '\n').catch(console.error);
      useSnippet(item.id);
      onClose();
    } else if (item.type === 'action' && item.action) {
      // Execute action
      item.action();
      onClose();
    }
  }, [filteredItems, selectedIndex, activeSessionId, useSnippet, onClose]);

  const getItemIcon = (item: PaletteItem) => {
    if (item.icon) return item.icon;
    
    switch (item.type) {
      case 'snippet':
        return <Command size={16} />;
      case 'action':
        return <Settings size={16} />;
      default:
        return <Hash size={16} />;
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'var(--text-muted)';
    
    const colors: Record<string, string> = {
      'filesystem': '#f39c12',
      'system': '#e74c3c',
      'network': '#3498db',
      'database': '#9b59b6',
      'development': '#2ecc71',
      'docker': '#2980b9',
    };
    
    return colors[category] || 'var(--text-muted)';
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay">
      <div className="command-palette">
        <div className="command-palette-header">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search snippets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="command-input"
            />
          </div>
          <button onClick={onClose} className="close-button">
            <X size={16} />
          </button>
        </div>

        <div className="command-palette-content">
          {filteredItems.length === 0 ? (
            <div className="no-results">
              <Command size={32} />
              <p>No commands or snippets found</p>
              <p className="no-results-sub">Try a different search term</p>
            </div>
          ) : (
            <div ref={listRef} className="command-list">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedIndex(index);
                    executeSelectedItem();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="command-icon">
                    {getItemIcon(item)}
                  </div>
                  <div className="command-content">
                    <div className="command-title">
                      {item.title}
                      {item.category && (
                        <span 
                          className="command-category"
                          style={{ color: getCategoryColor(item.category) }}
                        >
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <div className="command-description">
                        {item.description}
                      </div>
                    )}
                    {item.command && item.type === 'snippet' && (
                      <div className="command-preview">
                        <code>{item.command}</code>
                      </div>
                    )}
                  </div>
                  <div className="command-actions">
                    {item.type === 'snippet' && (
                      <Play size={14} className="play-icon" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="command-palette-footer">
          <div className="shortcuts">
            <span className="shortcut">
              <kbd>↑↓</kbd> Navigate
            </span>
            <span className="shortcut">
              <kbd>Enter</kbd> Execute
            </span>
            <span className="shortcut">
              <kbd>Esc</kbd> Close
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}