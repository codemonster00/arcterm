import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Snippet {
  id: string;
  name: string;
  command: string;
  description?: string;
  category: string;
  tags: string[];
  createdAt: number;
  lastUsed?: number;
  useCount: number;
}

export const DEFAULT_SNIPPETS: Snippet[] = [
  {
    id: '1',
    name: 'List Files',
    command: 'ls -la',
    description: 'List all files with details',
    category: 'filesystem',
    tags: ['list', 'files'],
    createdAt: Date.now(),
    useCount: 0,
  },
  {
    id: '2',
    name: 'Check Disk Usage',
    command: 'df -h',
    description: 'Display filesystem disk space usage',
    category: 'system',
    tags: ['disk', 'space', 'usage'],
    createdAt: Date.now(),
    useCount: 0,
  },
  {
    id: '3',
    name: 'Process Monitor',
    command: 'top -i',
    description: 'Interactive process viewer',
    category: 'system',
    tags: ['process', 'monitor'],
    createdAt: Date.now(),
    useCount: 0,
  },
  {
    id: '4',
    name: 'SSH Port Forward',
    command: 'ssh -L 8080:localhost:80 user@server',
    description: 'Forward port 80 to local 8080',
    category: 'network',
    tags: ['ssh', 'port', 'forward', 'tunnel'],
    createdAt: Date.now(),
    useCount: 0,
  },
  {
    id: '5',
    name: 'Find Large Files',
    command: 'find . -type f -size +100M -exec ls -lh {} \\; | sort -k5 -hr',
    description: 'Find files larger than 100MB',
    category: 'filesystem',
    tags: ['find', 'large', 'files', 'size'],
    createdAt: Date.now(),
    useCount: 0,
  },
];

interface SnippetsState {
  snippets: Snippet[];
  addSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'useCount'>) => void;
  updateSnippet: (id: string, updates: Partial<Snippet>) => void;
  deleteSnippet: (id: string) => void;
  useSnippet: (id: string) => void;
  getSnippetsByCategory: (category: string) => Snippet[];
  searchSnippets: (query: string) => Snippet[];
  getAllCategories: () => string[];
  resetToDefaults: () => void;
}

export const useSnippetsStore = create<SnippetsState>()(
  persist(
    (set, get) => ({
      snippets: DEFAULT_SNIPPETS,
      
      addSnippet: (snippetData) => {
        const snippet: Snippet = {
          ...snippetData,
          id: Date.now().toString(),
          createdAt: Date.now(),
          useCount: 0,
        };
        set((state) => ({
          snippets: [...state.snippets, snippet],
        }));
      },

      updateSnippet: (id, updates) => {
        set((state) => ({
          snippets: state.snippets.map((snippet) =>
            snippet.id === id ? { ...snippet, ...updates } : snippet
          ),
        }));
      },

      deleteSnippet: (id) => {
        set((state) => ({
          snippets: state.snippets.filter((snippet) => snippet.id !== id),
        }));
      },

      useSnippet: (id) => {
        set((state) => ({
          snippets: state.snippets.map((snippet) =>
            snippet.id === id
              ? { ...snippet, useCount: snippet.useCount + 1, lastUsed: Date.now() }
              : snippet
          ),
        }));
      },

      getSnippetsByCategory: (category) => {
        return get().snippets.filter((snippet) => snippet.category === category);
      },

      searchSnippets: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().snippets.filter(
          (snippet) =>
            snippet.name.toLowerCase().includes(lowerQuery) ||
            snippet.command.toLowerCase().includes(lowerQuery) ||
            snippet.description?.toLowerCase().includes(lowerQuery) ||
            snippet.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      },

      getAllCategories: () => {
        const categories = new Set(get().snippets.map((snippet) => snippet.category));
        return Array.from(categories).sort();
      },

      resetToDefaults: () => {
        set({ snippets: DEFAULT_SNIPPETS });
      },
    }),
    {
      name: 'arcterm-snippets',
    }
  )
);