import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { useThemeStore, TERMINAL_THEMES, UI_THEMES } from '../stores/theme';

interface ThemeSelectorProps {
  onClose?: () => void;
}

export function ThemeSelector({ onClose }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    currentTerminalTheme, 
    currentUITheme, 
    setTerminalTheme, 
    setUITheme 
  } = useThemeStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeSelect = (themeKey: string) => {
    setTerminalTheme(themeKey);
    setUITheme(themeKey);
    setIsOpen(false);
    onClose?.();
  };

  const getThemePreviewColors = (themeKey: string) => {
    const theme = TERMINAL_THEMES[themeKey];
    if (!theme) return [];
    
    return [
      theme.background,
      theme.foreground,
      theme.red,
      theme.green,
      theme.blue,
      theme.yellow
    ];
  };

  const currentThemeName = TERMINAL_THEMES[currentTerminalTheme]?.name || 'GitHub Dark';

  return (
    <div className="theme-selector" ref={dropdownRef}>
      <button
        className="theme-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Change theme"
      >
        <Palette size={14} />
        <span>{currentThemeName}</span>
        <ChevronDown 
          size={12} 
          className={`chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="theme-selector-dropdown">
          <div className="dropdown-header">
            <Palette size={16} />
            <span>Choose Theme</span>
          </div>
          
          <div className="theme-list">
            {Object.entries(TERMINAL_THEMES).map(([key, theme]) => (
              <button
                key={key}
                className={`theme-option ${key === currentTerminalTheme ? 'selected' : ''}`}
                onClick={() => handleThemeSelect(key)}
              >
                <div className="theme-preview">
                  {getThemePreviewColors(key).map((color, index) => (
                    <div
                      key={index}
                      className="color-dot"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                <div className="theme-info">
                  <span className="theme-name">{theme.name}</span>
                  <div 
                    className="theme-demo"
                    style={{
                      background: theme.background,
                      color: theme.foreground,
                      border: `1px solid ${theme.foreground}33`
                    }}
                  >
                    <span style={{ color: theme.green }}>user@host</span>
                    <span>:</span>
                    <span style={{ color: theme.blue }}>~</span>
                    <span style={{ color: theme.foreground }}>$</span>
                  </div>
                </div>

                {key === currentTerminalTheme && (
                  <Check size={16} className="selected-icon" />
                )}
              </button>
            ))}
          </div>

          <div className="dropdown-footer">
            <p className="footer-text">
              Themes apply to both terminal colors and UI elements
            </p>
          </div>
        </div>
      )}

    </div>
  );
}