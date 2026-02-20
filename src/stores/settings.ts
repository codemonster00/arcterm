import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  action: string;
}

export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: 'new-tab',
    name: 'New Tab',
    description: 'Open a new connection tab',
    keys: ['ctrl', 't'],
    action: 'new-tab',
  },
  {
    id: 'close-tab',
    name: 'Close Tab',
    description: 'Close current tab',
    keys: ['ctrl', 'w'],
    action: 'close-tab',
  },
  {
    id: 'next-tab',
    name: 'Next Tab',
    description: 'Switch to next tab',
    keys: ['ctrl', 'tab'],
    action: 'next-tab',
  },
  {
    id: 'prev-tab',
    name: 'Previous Tab',
    description: 'Switch to previous tab',
    keys: ['ctrl', 'shift', 'tab'],
    action: 'prev-tab',
  },
  {
    id: 'split-horizontal',
    name: 'Split Horizontal',
    description: 'Split terminal horizontally',
    keys: ['ctrl', 'shift', 'h'],
    action: 'split-horizontal',
  },
  {
    id: 'split-vertical',
    name: 'Split Vertical',
    description: 'Split terminal vertically',
    keys: ['ctrl', 'shift', 'v'],
    action: 'split-vertical',
  },
  {
    id: 'search',
    name: 'Search',
    description: 'Search in terminal',
    keys: ['ctrl', 'f'],
    action: 'search',
  },
  {
    id: 'command-palette',
    name: 'Command Palette',
    description: 'Open command/snippet palette',
    keys: ['ctrl', 'shift', 'p'],
    action: 'command-palette',
  },
  {
    id: 'toggle-sidebar',
    name: 'Toggle Sidebar',
    description: 'Show/hide sidebar',
    keys: ['ctrl', 'b'],
    action: 'toggle-sidebar',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Open settings dialog',
    keys: ['ctrl', ','],
    action: 'settings',
  },
];

export interface TerminalSettings {
  fontSize: number;
  fontFamily: string;
  cursorStyle: 'block' | 'underline' | 'bar';
  cursorBlink: boolean;
  scrollback: number;
  bellSound: boolean;
  allowTransparency: boolean;
  macOptionIsMeta: boolean;
  rightClickSelectsWord: boolean;
  scrollSensitivity: number;
  fastScrollSensitivity: number;
  linkTooltipTimeout: number;
}

export interface UISettings {
  animationsEnabled: boolean;
  compactTabs: boolean;
  showStatusBar: boolean;
  showSidebar: boolean;
  sidebarWidth: number;
  tabCloseButton: 'hover' | 'always' | 'never';
  confirmTabClose: boolean;
  confirmExit: boolean;
  autoSaveConnections: boolean;
  recentConnectionsLimit: number;
}

export interface ConnectionSettings {
  autoReconnect: boolean;
  reconnectAttempts: number;
  reconnectDelay: number;
  connectionTimeout: number;
  keepAliveInterval: number;
  sftpEnabled: boolean;
  showConnectionAlerts: boolean;
  logConnections: boolean;
}

interface SettingsState {
  shortcuts: KeyboardShortcut[];
  terminal: TerminalSettings;
  ui: UISettings;
  connection: ConnectionSettings;
  
  // Shortcuts management
  updateShortcut: (id: string, keys: string[]) => void;
  resetShortcuts: () => void;
  getShortcut: (action: string) => KeyboardShortcut | undefined;
  
  // Settings management
  updateTerminalSettings: (updates: Partial<TerminalSettings>) => void;
  updateUISettings: (updates: Partial<UISettings>) => void;
  updateConnectionSettings: (updates: Partial<ConnectionSettings>) => void;
  
  // Utility
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

const DEFAULT_TERMINAL_SETTINGS: TerminalSettings = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
  cursorStyle: 'bar',
  cursorBlink: true,
  scrollback: 1000,
  bellSound: false,
  allowTransparency: true,
  macOptionIsMeta: false,
  rightClickSelectsWord: true,
  scrollSensitivity: 1,
  fastScrollSensitivity: 5,
  linkTooltipTimeout: 500,
};

const DEFAULT_UI_SETTINGS: UISettings = {
  animationsEnabled: true,
  compactTabs: false,
  showStatusBar: true,
  showSidebar: true,
  sidebarWidth: 250,
  tabCloseButton: 'hover',
  confirmTabClose: true,
  confirmExit: true,
  autoSaveConnections: true,
  recentConnectionsLimit: 10,
};

const DEFAULT_CONNECTION_SETTINGS: ConnectionSettings = {
  autoReconnect: true,
  reconnectAttempts: 3,
  reconnectDelay: 2000,
  connectionTimeout: 10000,
  keepAliveInterval: 30000,
  sftpEnabled: true,
  showConnectionAlerts: true,
  logConnections: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      shortcuts: DEFAULT_SHORTCUTS,
      terminal: DEFAULT_TERMINAL_SETTINGS,
      ui: DEFAULT_UI_SETTINGS,
      connection: DEFAULT_CONNECTION_SETTINGS,

      updateShortcut: (id, keys) => {
        set((state) => ({
          shortcuts: state.shortcuts.map((shortcut) =>
            shortcut.id === id ? { ...shortcut, keys } : shortcut
          ),
        }));
      },

      resetShortcuts: () => {
        set({ shortcuts: DEFAULT_SHORTCUTS });
      },

      getShortcut: (action) => {
        return get().shortcuts.find((shortcut) => shortcut.action === action);
      },

      updateTerminalSettings: (updates) => {
        set((state) => ({
          terminal: { ...state.terminal, ...updates },
        }));
      },

      updateUISettings: (updates) => {
        set((state) => ({
          ui: { ...state.ui, ...updates },
        }));
      },

      updateConnectionSettings: (updates) => {
        set((state) => ({
          connection: { ...state.connection, ...updates },
        }));
      },

      resetToDefaults: () => {
        set({
          shortcuts: DEFAULT_SHORTCUTS,
          terminal: DEFAULT_TERMINAL_SETTINGS,
          ui: DEFAULT_UI_SETTINGS,
          connection: DEFAULT_CONNECTION_SETTINGS,
        });
      },

      exportSettings: () => {
        const state = get();
        return JSON.stringify(
          {
            shortcuts: state.shortcuts,
            terminal: state.terminal,
            ui: state.ui,
            connection: state.connection,
          },
          null,
          2
        );
      },

      importSettings: (json) => {
        try {
          const imported = JSON.parse(json);
          if (
            imported.shortcuts &&
            imported.terminal &&
            imported.ui &&
            imported.connection
          ) {
            set({
              shortcuts: imported.shortcuts,
              terminal: imported.terminal,
              ui: imported.ui,
              connection: imported.connection,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'arcterm-settings',
    }
  )
);