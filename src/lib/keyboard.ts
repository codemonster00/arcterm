export interface ShortcutEvent {
  keys: string[];
  action: string;
  preventDefault?: boolean;
}

export class KeyboardManager {
  private shortcuts: Map<string, ShortcutEvent> = new Map();
  private pressedKeys: Set<string> = new Set();
  private listeners: Map<string, (event: ShortcutEvent) => void> = new Map();

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  private normalizeKey(key: string): string {
    const keyMap: Record<string, string> = {
      ' ': 'space',
      'Control': 'ctrl',
      'Meta': 'cmd',
      'Alt': 'alt',
      'Shift': 'shift',
      'Tab': 'tab',
      'Enter': 'enter',
      'Escape': 'escape',
      'Backspace': 'backspace',
      'Delete': 'delete',
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'Home': 'home',
      'End': 'end',
      'PageUp': 'pageup',
      'PageDown': 'pagedown',
    };

    return keyMap[key] || key.toLowerCase();
  }

  private getKeyCombo(): string[] {
    const modifiers = ['ctrl', 'alt', 'shift', 'cmd'].filter(mod => 
      this.pressedKeys.has(mod)
    );
    const nonModifiers = Array.from(this.pressedKeys).filter(key => 
      !['ctrl', 'alt', 'shift', 'cmd'].includes(key)
    );
    
    return [...modifiers, ...nonModifiers].sort();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Ignore events from input elements unless it's a global shortcut
    const target = event.target as HTMLElement;
    const isInputElement = ['input', 'textarea'].includes(target.tagName.toLowerCase()) ||
                          target.contentEditable === 'true';

    const normalizedKey = this.normalizeKey(event.key);
    this.pressedKeys.add(normalizedKey);

    const combo = this.getKeyCombo();
    const comboString = combo.join('+');
    const shortcut = this.shortcuts.get(comboString);

    if (shortcut) {
      // Only prevent default and trigger if not in input element or it's a global shortcut
      const globalShortcuts = ['ctrl+t', 'ctrl+w', 'ctrl+tab', 'ctrl+shift+tab', 'ctrl+shift+p'];
      
      if (!isInputElement || globalShortcuts.includes(comboString)) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        
        const listener = this.listeners.get(shortcut.action);
        if (listener) {
          listener(shortcut);
        }
      }
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const normalizedKey = this.normalizeKey(event.key);
    this.pressedKeys.delete(normalizedKey);
  }

  private handleBlur(): void {
    this.pressedKeys.clear();
  }

  public registerShortcut(keys: string[], action: string, preventDefault = true): void {
    const comboString = keys.map(key => key.toLowerCase()).sort().join('+');
    this.shortcuts.set(comboString, { keys, action, preventDefault });
  }

  public unregisterShortcut(keys: string[]): void {
    const comboString = keys.map(key => key.toLowerCase()).sort().join('+');
    this.shortcuts.delete(comboString);
  }

  public registerListener(action: string, listener: (event: ShortcutEvent) => void): () => void {
    this.listeners.set(action, listener);
    return () => this.listeners.delete(action);
  }

  public updateShortcuts(shortcuts: { keys: string[]; action: string }[]): void {
    this.shortcuts.clear();
    shortcuts.forEach(({ keys, action }) => {
      this.registerShortcut(keys, action);
    });
  }

  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.shortcuts.clear();
    this.listeners.clear();
    this.pressedKeys.clear();
  }

  public isPressed(key: string): boolean {
    return this.pressedKeys.has(this.normalizeKey(key));
  }

  public getPressedKeys(): string[] {
    return Array.from(this.pressedKeys);
  }
}

// Singleton instance
export const keyboardManager = new KeyboardManager();

// Utility function to format key combinations for display
export function formatKeyCombo(keys: string[]): string {
  const keyMap: Record<string, string> = {
    ctrl: '⌃',
    cmd: '⌘',
    alt: '⌥',
    shift: '⇧',
    tab: '⇥',
    enter: '↩',
    escape: '⎋',
    space: '⎵',
    backspace: '⌫',
    delete: '⌦',
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
    home: '↖',
    end: '↘',
    pageup: '⇞',
    pagedown: '⇟',
  };

  // Detect platform
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');

  return keys
    .map(key => {
      const lower = key.toLowerCase();
      if (isMac && lower === 'ctrl') return keyMap.cmd || '⌘';
      return keyMap[lower] || key.toUpperCase();
    })
    .join(isMac ? '' : '+');
}