import { useState, useEffect, useCallback, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { Toaster, toast } from 'react-hot-toast';
import { Sidebar } from "./components/Sidebar";
import { TabBar } from "./components/TabBar";
import { SplitPaneManager } from "./components/SplitPaneManager";
import { ConnectionDialog } from "./components/ConnectionDialog";
import { QuickConnect } from "./components/QuickConnect";
import { EnhancedStatusBar } from "./components/EnhancedStatusBar";
import { CommandPalette } from "./components/CommandPalette";
import { ThemeSelector } from "./components/ThemeSelector";
import { sessionStore } from "./stores/sessions";
import { connectionStore } from "./stores/connections";
import { useThemeStore } from "./stores/theme";
import { useSettingsStore } from "./stores/settings";
import { keyboardManager } from "./lib/keyboard";
import { ConnectionProfile, Session, SessionStatusEvent, TerminalOutputEvent } from "./lib/types";
import * as cmds from "./lib/tauri-commands";
import './styles/global.css';

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<ConnectionProfile[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [editProfile, setEditProfile] = useState<ConnectionProfile | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const terminalDataHandlers = useRef<Map<string, (data: Uint8Array) => void>>(new Map());

  // Theme and settings
  const { getUITheme } = useThemeStore();
  const { ui: uiSettings, shortcuts } = useSettingsStore();
  const theme = getUITheme();

  // Apply theme to document
  useEffect(() => {
    const themeMap: Record<string, string> = {
      'github-dark': 'github-dark',
      'dracula': 'dracula',
      'monokai': 'monokai',
      'nord': 'nord',
      'solarized-dark': 'solarized-dark',
      'solarized-light': 'solarized-light',
      'one-dark': 'one-dark',
      'tokyo-night': 'tokyo-night',
    };
    
    const currentTheme = useThemeStore.getState().currentUITheme;
    document.documentElement.setAttribute('data-theme', themeMap[currentTheme] || 'github-dark');
  }, [useThemeStore.getState().currentUITheme]);

  // Initialize stores and event listeners
  useEffect(() => {
    connectionStore.load();
    const unsub1 = sessionStore.subscribe(() => {
      setSessions([...sessionStore.sessions]);
      setActiveId(sessionStore.activeSessionId);
    });
    const unsub2 = connectionStore.subscribe(() => {
      setProfiles([...connectionStore.profiles]);
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  // Setup event listeners for session updates
  useEffect(() => {
    const unlisten1 = listen<TerminalOutputEvent>("terminal-output", (event) => {
      const handler = terminalDataHandlers.current.get(event.payload.sessionId);
      if (handler) handler(new Uint8Array(event.payload.data));
    });

    const unlisten2 = listen<SessionStatusEvent>("session-status", (event) => {
      const { sessionId, status, message } = event.payload;
      
      sessionStore.updateStatus(sessionId, status);
      
      // Show connection alerts if enabled
      if (uiSettings.showStatusBar) {
        switch (status) {
          case 'connected':
            toast.success(`Connected to session`, {
              duration: 2000,
              position: 'bottom-right'
            });
            break;
          case 'disconnected':
            toast.error(`Session disconnected${message ? `: ${message}` : ''}`, {
              duration: 4000,
              position: 'bottom-right'
            });
            // Auto-remove session after delay
            setTimeout(() => sessionStore.removeSession(sessionId), 2000);
            break;
          case 'reconnecting':
            toast.loading(`Reconnecting to session...`, {
              id: `reconnect-${sessionId}`,
              duration: Infinity,
            });
            break;
        }
      }
    });

    return () => { 
      unlisten1.then(f => f()); 
      unlisten2.then(f => f()); 
    };
  }, [uiSettings.showStatusBar]);

  // Setup keyboard shortcuts
  useEffect(() => {
    // Update keyboard manager with current shortcuts
    keyboardManager.updateShortcuts(
      shortcuts.map(shortcut => ({
        keys: shortcut.keys,
        action: shortcut.action
      }))
    );

    // Register shortcut listeners
    const unregisterNewTab = keyboardManager.registerListener('new-tab', () => {
      setEditProfile(undefined);
      setShowDialog(true);
    });

    const unregisterCloseTab = keyboardManager.registerListener('close-tab', () => {
      if (activeId) {
        handleDisconnect(activeId);
      }
    });

    const unregisterNextTab = keyboardManager.registerListener('next-tab', () => {
      if (sessions.length > 1) {
        const currentIndex = sessions.findIndex(s => s.id === activeId);
        const nextIndex = (currentIndex + 1) % sessions.length;
        sessionStore.setActive(sessions[nextIndex].id);
      }
    });

    const unregisterPrevTab = keyboardManager.registerListener('prev-tab', () => {
      if (sessions.length > 1) {
        const currentIndex = sessions.findIndex(s => s.id === activeId);
        const prevIndex = currentIndex === 0 ? sessions.length - 1 : currentIndex - 1;
        sessionStore.setActive(sessions[prevIndex].id);
      }
    });

    const unregisterCommandPalette = keyboardManager.registerListener('command-palette', () => {
      setShowCommandPalette(true);
    });

    const unregisterToggleSidebar = keyboardManager.registerListener('toggle-sidebar', () => {
      setSidebarOpen(!sidebarOpen);
    });

    return () => {
      unregisterNewTab();
      unregisterCloseTab();
      unregisterNextTab();
      unregisterPrevTab();
      unregisterCommandPalette();
      unregisterToggleSidebar();
    };
  }, [shortcuts, activeId, sessions, sidebarOpen]);

  const handleConnect = useCallback(async (profile: ConnectionProfile) => {
    try {
      const sessionId = await cmds.connect(profile);
      sessionStore.addSession({
        id: sessionId,
        profileName: profile.name || `${profile.username}@${profile.host}`,
        host: profile.host,
        username: profile.username,
        status: "connecting",
        connectedAt: Date.now(),
      });
      
      // Auto-switch to new session
      sessionStore.setActive(sessionId);
    } catch (e) {
      console.error("Connection failed:", e);
      toast.error(`Connection failed: ${e}`, {
        duration: 5000,
        position: 'bottom-right'
      });
    }
  }, []);

  const handleDisconnect = useCallback(async (sessionId: string) => {
    if (uiSettings.confirmTabClose && sessions.length > 0) {
      const session = sessions.find(s => s.id === sessionId);
      if (session && !confirm(`Close connection to ${session.profileName}?`)) {
        return;
      }
    }

    try { 
      await cmds.disconnect(sessionId); 
    } catch (e) {
      console.warn('Disconnect failed:', e);
    }
    sessionStore.removeSession(sessionId);
  }, [sessions, uiSettings.confirmTabClose]);

  const handleCreateNewSession = useCallback(async (): Promise<string> => {
    // For split panes, we'll create a duplicate of the current session's profile
    const activeSession = sessions.find(s => s.id === activeId);
    if (!activeSession) throw new Error('No active session');

    const profile = profiles.find(p => 
      p.name === activeSession.profileName || 
      `${p.username}@${p.host}` === activeSession.profileName
    );
    
    if (!profile) throw new Error('Profile not found for active session');

    const sessionId = await cmds.connect(profile);
    sessionStore.addSession({
      id: sessionId,
      profileName: profile.name || `${profile.username}@${profile.host}`,
      host: profile.host,
      username: profile.username,
      status: "connecting",
      connectedAt: Date.now(),
    });

    return sessionId;
  }, [activeId, sessions, profiles]);

  const registerTerminalHandler = useCallback((sessionId: string, handler: (data: Uint8Array) => void) => {
    terminalDataHandlers.current.set(sessionId, handler);
    return () => { terminalDataHandlers.current.delete(sessionId); };
  }, []);

  const activeSession = sessions.find(s => s.id === activeId);

  return (
    <div className={`app ${uiSettings.animationsEnabled ? 'animations-enabled' : ''}`}>
      <Toaster />
      
      <QuickConnect onConnect={handleConnect} />
      
      <div className="app-body">
        {(sidebarOpen && uiSettings.showSidebar) && (
          <div 
            className="sidebar-container"
            style={{ width: uiSettings.sidebarWidth }}
          >
            <Sidebar
              profiles={profiles}
              sessions={sessions}
              onConnect={handleConnect}
              onEdit={(p) => { setEditProfile(p); setShowDialog(true); }}
              onNew={() => { setEditProfile(undefined); setShowDialog(true); }}
              onDelete={(id) => {
                if (confirm('Delete this connection profile?')) {
                  connectionStore.remove(id);
                }
              }}
            />
          </div>
        )}
        
        <div className="main-content">
          <div className="tab-bar-container">
            <TabBar
              sessions={sessions}
              activeId={activeId}
              onSelect={(id) => sessionStore.setActive(id)}
              onClose={handleDisconnect}
              onNew={() => { setEditProfile(undefined); setShowDialog(true); }}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
            
            <div className="tab-bar-actions">
              <ThemeSelector />
            </div>
          </div>
          
          <div className="terminal-area">
            {sessions.length === 0 ? (
              <div className="welcome-screen">
                <div className="welcome-content">
                  <div className="welcome-logo">⚡</div>
                  <h1 className="welcome-title">Arcterm</h1>
                  <p className="welcome-subtitle">Premium SSH Terminal Client</p>
                  <div className="welcome-actions">
                    <button 
                      className="btn primary"
                      onClick={() => { setEditProfile(undefined); setShowDialog(true); }}
                    >
                      New Connection
                    </button>
                    <button 
                      className="btn"
                      onClick={() => setShowCommandPalette(true)}
                    >
                      Command Palette
                    </button>
                  </div>
                  <div className="welcome-shortcuts">
                    <p>Keyboard shortcuts:</p>
                    <div className="shortcut-grid">
                      <span><kbd>Ctrl+T</kbd> New connection</span>
                      <span><kbd>Ctrl+Shift+P</kbd> Command palette</span>
                      <span><kbd>Ctrl+B</kbd> Toggle sidebar</span>
                      <span><kbd>Ctrl+F</kbd> Search in terminal</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className={`terminal-session ${session.id === activeId ? 'active' : ''}`}
                  >
                    <SplitPaneManager
                      sessionId={session.id}
                      registerDataHandler={registerTerminalHandler}
                      onCreateSession={handleCreateNewSession}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {uiSettings.showStatusBar && (
        <EnhancedStatusBar session={activeSession} />
      )}

      {showDialog && (
        <ConnectionDialog
          profile={editProfile}
          onSave={async (p) => { 
            await connectionStore.save(p); 
            setShowDialog(false); 
          }}
          onConnect={async (p) => { 
            await connectionStore.save(p); 
            setShowDialog(false); 
            handleConnect(p); 
          }}
          onClose={() => setShowDialog(false)}
        />
      )}

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        activeSessionId={activeId || undefined}
      />
    </div>
  );
}