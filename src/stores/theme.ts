import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TerminalTheme {
  name: string;
  background: string;
  foreground: string;
  cursor: string;
  selectionBackground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

export const TERMINAL_THEMES: Record<string, TerminalTheme> = {
  'github-dark': {
    name: 'GitHub Dark',
    background: '#0a0a0a',
    foreground: '#e6edf3',
    cursor: '#58a6ff',
    selectionBackground: '#264f78',
    black: '#484f58',
    red: '#f85149',
    green: '#3fb950',
    yellow: '#d29922',
    blue: '#58a6ff',
    magenta: '#bc8cff',
    cyan: '#39d353',
    white: '#e6edf3',
    brightBlack: '#6e7681',
    brightRed: '#ffa198',
    brightGreen: '#56d364',
    brightYellow: '#e3b341',
    brightBlue: '#79c0ff',
    brightMagenta: '#d2a8ff',
    brightCyan: '#56d364',
    brightWhite: '#ffffff',
  },
  'dracula': {
    name: 'Dracula',
    background: '#282a36',
    foreground: '#f8f8f2',
    cursor: '#f8f8f2',
    selectionBackground: '#44475a',
    black: '#000000',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#bfbfbf',
    brightBlack: '#4d4d4d',
    brightRed: '#ff6e67',
    brightGreen: '#5af78e',
    brightYellow: '#f4f99d',
    brightBlue: '#caa9fa',
    brightMagenta: '#ff92d0',
    brightCyan: '#9aedfe',
    brightWhite: '#e6e6e6',
  },
  'monokai': {
    name: 'Monokai',
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    selectionBackground: '#49483e',
    black: '#272822',
    red: '#f92672',
    green: '#a6e22e',
    yellow: '#f4bf75',
    blue: '#66d9ef',
    magenta: '#ae81ff',
    cyan: '#a1efe4',
    white: '#f8f8f2',
    brightBlack: '#75715e',
    brightRed: '#f92672',
    brightGreen: '#a6e22e',
    brightYellow: '#f4bf75',
    brightBlue: '#66d9ef',
    brightMagenta: '#ae81ff',
    brightCyan: '#a1efe4',
    brightWhite: '#f9f8f5',
  },
  'nord': {
    name: 'Nord',
    background: '#2e3440',
    foreground: '#d8dee9',
    cursor: '#d8dee9',
    selectionBackground: '#434c5e',
    black: '#3b4252',
    red: '#bf616a',
    green: '#a3be8c',
    yellow: '#ebcb8b',
    blue: '#81a1c1',
    magenta: '#b48ead',
    cyan: '#88c0d0',
    white: '#e5e9f0',
    brightBlack: '#4c566a',
    brightRed: '#bf616a',
    brightGreen: '#a3be8c',
    brightYellow: '#ebcb8b',
    brightBlue: '#81a1c1',
    brightMagenta: '#b48ead',
    brightCyan: '#8fbcbb',
    brightWhite: '#eceff4',
  },
  'solarized-dark': {
    name: 'Solarized Dark',
    background: '#002b36',
    foreground: '#839496',
    cursor: '#93a1a1',
    selectionBackground: '#073642',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
    brightBlack: '#002b36',
    brightRed: '#cb4b16',
    brightGreen: '#586e75',
    brightYellow: '#657b83',
    brightBlue: '#839496',
    brightMagenta: '#6c71c4',
    brightCyan: '#93a1a1',
    brightWhite: '#fdf6e3',
  },
  'solarized-light': {
    name: 'Solarized Light',
    background: '#fdf6e3',
    foreground: '#657b83',
    cursor: '#586e75',
    selectionBackground: '#eee8d5',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
    brightBlack: '#002b36',
    brightRed: '#cb4b16',
    brightGreen: '#586e75',
    brightYellow: '#657b83',
    brightBlue: '#839496',
    brightMagenta: '#6c71c4',
    brightCyan: '#93a1a1',
    brightWhite: '#fdf6e3',
  },
  'one-dark': {
    name: 'One Dark',
    background: '#282c34',
    foreground: '#abb2bf',
    cursor: '#528bff',
    selectionBackground: '#3e4451',
    black: '#282c34',
    red: '#e06c75',
    green: '#98c379',
    yellow: '#e5c07b',
    blue: '#61afef',
    magenta: '#c678dd',
    cyan: '#56b6c2',
    white: '#abb2bf',
    brightBlack: '#5c6370',
    brightRed: '#e06c75',
    brightGreen: '#98c379',
    brightYellow: '#e5c07b',
    brightBlue: '#61afef',
    brightMagenta: '#c678dd',
    brightCyan: '#56b6c2',
    brightWhite: '#ffffff',
  },
  'tokyo-night': {
    name: 'Tokyo Night',
    background: '#1a1b26',
    foreground: '#c0caf5',
    cursor: '#c0caf5',
    selectionBackground: '#283457',
    black: '#15161e',
    red: '#f7768e',
    green: '#9ece6a',
    yellow: '#e0af68',
    blue: '#7aa2f7',
    magenta: '#bb9af7',
    cyan: '#7dcfff',
    white: '#a9b1d6',
    brightBlack: '#414868',
    brightRed: '#f7768e',
    brightGreen: '#9ece6a',
    brightYellow: '#e0af68',
    brightBlue: '#7aa2f7',
    brightMagenta: '#bb9af7',
    brightCyan: '#7dcfff',
    brightWhite: '#c0caf5',
  },
};

export interface UITheme {
  name: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  danger: string;
  dangerHover: string;
  success: string;
  warning: string;
}

export const UI_THEMES: Record<string, UITheme> = {
  'github-dark': {
    name: 'GitHub Dark',
    background: '#010409',
    surface: '#0d1117',
    border: '#30363d',
    text: '#e6edf3',
    textMuted: '#7d8590',
    primary: '#238636',
    primaryHover: '#2ea043',
    danger: '#da3633',
    dangerHover: '#f85149',
    success: '#238636',
    warning: '#d29922',
  },
  'dracula': {
    name: 'Dracula',
    background: '#21222c',
    surface: '#282a36',
    border: '#44475a',
    text: '#f8f8f2',
    textMuted: '#6272a4',
    primary: '#bd93f9',
    primaryHover: '#caa9fa',
    danger: '#ff5555',
    dangerHover: '#ff6e67',
    success: '#50fa7b',
    warning: '#f1fa8c',
  },
  'monokai': {
    name: 'Monokai',
    background: '#1e1f1c',
    surface: '#272822',
    border: '#49483e',
    text: '#f8f8f2',
    textMuted: '#75715e',
    primary: '#a6e22e',
    primaryHover: '#b8f53c',
    danger: '#f92672',
    dangerHover: '#ff4081',
    success: '#a6e22e',
    warning: '#f4bf75',
  },
  'nord': {
    name: 'Nord',
    background: '#242933',
    surface: '#2e3440',
    border: '#3b4252',
    text: '#eceff4',
    textMuted: '#4c566a',
    primary: '#88c0d0',
    primaryHover: '#8fbcbb',
    danger: '#bf616a',
    dangerHover: '#d08770',
    success: '#a3be8c',
    warning: '#ebcb8b',
  },
  'solarized-dark': {
    name: 'Solarized Dark',
    background: '#001e27',
    surface: '#002b36',
    border: '#073642',
    text: '#fdf6e3',
    textMuted: '#586e75',
    primary: '#268bd2',
    primaryHover: '#2aa198',
    danger: '#dc322f',
    dangerHover: '#cb4b16',
    success: '#859900',
    warning: '#b58900',
  },
  'solarized-light': {
    name: 'Solarized Light',
    background: '#fdf6e3',
    surface: '#ffffff',
    border: '#eee8d5',
    text: '#002b36',
    textMuted: '#657b83',
    primary: '#268bd2',
    primaryHover: '#2aa198',
    danger: '#dc322f',
    dangerHover: '#cb4b16',
    success: '#859900',
    warning: '#b58900',
  },
  'one-dark': {
    name: 'One Dark',
    background: '#21252b',
    surface: '#282c34',
    border: '#3e4451',
    text: '#abb2bf',
    textMuted: '#5c6370',
    primary: '#61afef',
    primaryHover: '#7cb7ff',
    danger: '#e06c75',
    dangerHover: '#ff7b86',
    success: '#98c379',
    warning: '#e5c07b',
  },
  'tokyo-night': {
    name: 'Tokyo Night',
    background: '#16161e',
    surface: '#1a1b26',
    border: '#283457',
    text: '#c0caf5',
    textMuted: '#414868',
    primary: '#7aa2f7',
    primaryHover: '#7dcfff',
    danger: '#f7768e',
    dangerHover: '#ff9db4',
    success: '#9ece6a',
    warning: '#e0af68',
  },
};

interface ThemeState {
  currentTerminalTheme: string;
  currentUITheme: string;
  setTerminalTheme: (theme: string) => void;
  setUITheme: (theme: string) => void;
  getTerminalTheme: () => TerminalTheme;
  getUITheme: () => UITheme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTerminalTheme: 'github-dark',
      currentUITheme: 'github-dark',
      setTerminalTheme: (theme: string) => set({ currentTerminalTheme: theme }),
      setUITheme: (theme: string) => set({ currentUITheme: theme }),
      getTerminalTheme: () => TERMINAL_THEMES[get().currentTerminalTheme] || TERMINAL_THEMES['github-dark'],
      getUITheme: () => UI_THEMES[get().currentUITheme] || UI_THEMES['github-dark'],
    }),
    {
      name: 'arcterm-theme',
    }
  )
);