import { useEffect, useRef, useState, useCallback } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { SearchAddon } from "@xterm/addon-search";
import { WebglAddon } from "@xterm/addon-webgl";
import { ClipboardAddon } from "@xterm/addon-clipboard";
import { ImageAddon } from "@xterm/addon-image";
import { SerializeAddon } from "@xterm/addon-serialize";
import "@xterm/xterm/css/xterm.css";
import { Search, X } from "lucide-react";
import { useThemeStore } from "../stores/theme";
import { useSettingsStore } from "../stores/settings";
import { keyboardManager } from "../lib/keyboard";
import * as cmds from "../lib/tauri-commands";

interface SearchBarProps {
  searchAddon: SearchAddon;
  onClose: () => void;
}

function SearchBar({ searchAddon, onClose }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        if (e.shiftKey) {
          handlePrevious();
        } else {
          handleNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value) {
      const result = searchAddon.findNext(value, { incremental: true });
      // Note: SearchAddon doesn't provide match count in current version
      // This would need to be implemented with a custom solution for match counting
      setCurrentMatch(result ? 1 : 0);
      setTotalMatches(result ? 1 : 0);
    } else {
      searchAddon.clearDecorations();
      setCurrentMatch(0);
      setTotalMatches(0);
    }
  }, [searchAddon]);

  const handleNext = useCallback(() => {
    if (query) {
      const result = searchAddon.findNext(query);
      if (result) setCurrentMatch(prev => prev + 1);
    }
  }, [query, searchAddon]);

  const handlePrevious = useCallback(() => {
    if (query) {
      const result = searchAddon.findPrevious(query);
      if (result) setCurrentMatch(prev => Math.max(1, prev - 1));
    }
  }, [query, searchAddon]);

  return (
    <div className="terminal-search-bar">
      <div className="search-input-group">
        <Search size={16} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search terminal..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        {totalMatches > 0 && (
          <span className="search-results">
            {currentMatch}/{totalMatches}
          </span>
        )}
      </div>
      <div className="search-buttons">
        <button onClick={handlePrevious} disabled={!query} title="Previous (Shift+Enter)">
          ↑
        </button>
        <button onClick={handleNext} disabled={!query} title="Next (Enter)">
          ↓
        </button>
        <button onClick={onClose} title="Close (Escape)">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

interface EnhancedTerminalProps {
  sessionId: string;
  registerDataHandler: (sessionId: string, handler: (data: Uint8Array) => void) => () => void;
  onResize?: (cols: number, rows: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function EnhancedTerminal({ 
  sessionId, 
  registerDataHandler, 
  onResize,
  className,
  style 
}: EnhancedTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  
  const { getTerminalTheme } = useThemeStore();
  const { terminal: terminalSettings } = useSettingsStore();
  const theme = getTerminalTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      cursorBlink: terminalSettings.cursorBlink,
      cursorStyle: terminalSettings.cursorStyle,
      fontSize: terminalSettings.fontSize,
      fontFamily: terminalSettings.fontFamily,
      scrollback: terminalSettings.scrollback,
      scrollSensitivity: terminalSettings.scrollSensitivity,
      fastScrollSensitivity: terminalSettings.fastScrollSensitivity,
      rightClickSelectsWord: terminalSettings.rightClickSelectsWord,
      macOptionIsMeta: terminalSettings.macOptionIsMeta,
      allowTransparency: terminalSettings.allowTransparency,
      linkHandler: {
        activate: (event, uri) => {
          console.log('Link clicked:', uri);
          // In Tauri, we'd use the shell API to open links
          // tauri.shell.open(uri);
        },
        hover: (event, uri) => {
          // Show tooltip on hover
          if (event.target) {
            (event.target as HTMLElement).title = uri;
          }
        }
      },
      theme: {
        background: theme.background,
        foreground: theme.foreground,
        cursor: theme.cursor,
        selectionBackground: theme.selectionBackground,
        black: theme.black,
        red: theme.red,
        green: theme.green,
        yellow: theme.yellow,
        blue: theme.blue,
        magenta: theme.magenta,
        cyan: theme.cyan,
        white: theme.white,
        brightBlack: theme.brightBlack,
        brightRed: theme.brightRed,
        brightGreen: theme.brightGreen,
        brightYellow: theme.brightYellow,
        brightBlue: theme.brightBlue,
        brightMagenta: theme.brightMagenta,
        brightCyan: theme.brightCyan,
        brightWhite: theme.brightWhite,
      },
      allowProposedApi: true,
    });

    // Load addons
    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    const clipboardAddon = new ClipboardAddon();
    const imageAddon = new ImageAddon();
    const serializeAddon = new SerializeAddon();
    
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    term.loadAddon(searchAddon);
    term.loadAddon(clipboardAddon);
    term.loadAddon(imageAddon);
    term.loadAddon(serializeAddon);
    
    // Try to load WebGL addon for better performance
    try {
      const webglAddon = new WebglAddon();
      term.loadAddon(webglAddon);
    } catch (e) {
      console.warn('WebGL not supported, falling back to canvas renderer');
      // Canvas addon fallback would go here if needed
    }

    term.open(containerRef.current);
    setTimeout(() => fitAddon.fit(), 50);

    termRef.current = term;
    searchAddonRef.current = searchAddon;

    // Event handlers
    term.onData((data) => {
      cmds.sendInput(sessionId, data).catch(() => {});
    });

    term.onResize(({ cols, rows }) => {
      cmds.resizeTerminal(sessionId, cols, rows).catch(() => {});
      onResize?.(cols, rows);
    });

    term.onSelectionChange(() => {
      const selection = term.getSelection();
      if (selection && selection.length > 0) {
        // Could store selection for context menu actions
      }
    });

    // Data handler registration
    const unregister = registerDataHandler(sessionId, (data) => {
      term.write(data);
    });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      try { 
        fitAddon.fit(); 
      } catch (e) {
        console.warn('Fit addon resize failed:', e);
      }
    });
    resizeObserver.observe(containerRef.current);

    // Cleanup
    return () => {
      unregister();
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [sessionId, registerDataHandler, theme, terminalSettings, onResize]);

  // Keyboard shortcut for search
  useEffect(() => {
    const unregisterSearch = keyboardManager.registerListener('search', () => {
      setShowSearch(true);
    });

    return unregisterSearch;
  }, []);

  // Update terminal theme when it changes
  useEffect(() => {
    if (termRef.current) {
      termRef.current.options.theme = {
        background: theme.background,
        foreground: theme.foreground,
        cursor: theme.cursor,
        selectionBackground: theme.selectionBackground,
        black: theme.black,
        red: theme.red,
        green: theme.green,
        yellow: theme.yellow,
        blue: theme.blue,
        magenta: theme.magenta,
        cyan: theme.cyan,
        white: theme.white,
        brightBlack: theme.brightBlack,
        brightRed: theme.brightRed,
        brightGreen: theme.brightGreen,
        brightYellow: theme.brightYellow,
        brightBlue: theme.brightBlue,
        brightMagenta: theme.brightMagenta,
        brightCyan: theme.brightCyan,
        brightWhite: theme.brightWhite,
      };
    }
  }, [theme]);

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    if (searchAddonRef.current) {
      searchAddonRef.current.clearDecorations();
    }
  }, []);

  return (
    <div className={`enhanced-terminal ${className || ''}`} style={style}>
      <div 
        ref={containerRef} 
        className="terminal-container" 
        style={{ width: "100%", height: "100%", padding: 4 }}
      />
      {showSearch && searchAddonRef.current && (
        <SearchBar 
          searchAddon={searchAddonRef.current}
          onClose={handleCloseSearch}
        />
      )}
    </div>
  );
}