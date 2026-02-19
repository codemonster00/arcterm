import { useState, useEffect, useCallback, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { Sidebar } from "./components/Sidebar";
import { TabBar } from "./components/TabBar";
import { Terminal } from "./components/Terminal";
import { ConnectionDialog } from "./components/ConnectionDialog";
import { QuickConnect } from "./components/QuickConnect";
import { StatusBar } from "./components/StatusBar";
import { sessionStore } from "./stores/sessions";
import { connectionStore } from "./stores/connections";
import { ConnectionProfile, Session, SessionStatusEvent, TerminalOutputEvent } from "./lib/types";
import * as cmds from "./lib/tauri-commands";

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<ConnectionProfile[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editProfile, setEditProfile] = useState<ConnectionProfile | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const terminalDataHandlers = useRef<Map<string, (data: Uint8Array) => void>>(new Map());

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

  useEffect(() => {
    const unlisten1 = listen<TerminalOutputEvent>("terminal-output", (event) => {
      const handler = terminalDataHandlers.current.get(event.payload.sessionId);
      if (handler) handler(new Uint8Array(event.payload.data));
    });
    const unlisten2 = listen<SessionStatusEvent>("session-status", (event) => {
      sessionStore.updateStatus(event.payload.sessionId, event.payload.status);
      if (event.payload.status === "disconnected") {
        setTimeout(() => sessionStore.removeSession(event.payload.sessionId), 2000);
      }
    });
    return () => { unlisten1.then(f => f()); unlisten2.then(f => f()); };
  }, []);

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
    } catch (e) {
      console.error("Connection failed:", e);
    }
  }, []);

  const handleDisconnect = useCallback(async (sessionId: string) => {
    try { await cmds.disconnect(sessionId); } catch {}
    sessionStore.removeSession(sessionId);
  }, []);

  const registerTerminalHandler = useCallback((sessionId: string, handler: (data: Uint8Array) => void) => {
    terminalDataHandlers.current.set(sessionId, handler);
    return () => { terminalDataHandlers.current.delete(sessionId); };
  }, []);

  const activeSession = sessions.find(s => s.id === activeId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <QuickConnect onConnect={handleConnect} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {sidebarOpen && (
          <Sidebar
            profiles={profiles}
            sessions={sessions}
            onConnect={handleConnect}
            onEdit={(p) => { setEditProfile(p); setShowDialog(true); }}
            onNew={() => { setEditProfile(undefined); setShowDialog(true); }}
            onDelete={(id) => connectionStore.remove(id)}
          />
        )}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <TabBar
            sessions={sessions}
            activeId={activeId}
            onSelect={(id) => sessionStore.setActive(id)}
            onClose={handleDisconnect}
            onNew={() => { setEditProfile(undefined); setShowDialog(true); }}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <div style={{ flex: 1, position: "relative", background: "var(--bg-terminal)" }}>
            {sessions.map(session => (
              <div
                key={session.id}
                style={{
                  position: "absolute", inset: 0,
                  display: session.id === activeId ? "block" : "none",
                }}
              >
                <Terminal
                  sessionId={session.id}
                  registerDataHandler={registerTerminalHandler}
                />
              </div>
            ))}
            {sessions.length === 0 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100%", color: "var(--text-muted)", flexDirection: "column", gap: 16,
              }}>
                <div style={{ fontSize: 48, opacity: 0.3 }}>⚡</div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>Arcterm</div>
                <div style={{ fontSize: 13 }}>Press Ctrl+N or use the sidebar to connect</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <StatusBar session={activeSession} />
      {showDialog && (
        <ConnectionDialog
          profile={editProfile}
          onSave={async (p) => { await connectionStore.save(p); setShowDialog(false); }}
          onConnect={async (p) => { await connectionStore.save(p); setShowDialog(false); handleConnect(p); }}
          onClose={() => setShowDialog(false)}
        />
      )}
    </div>
  );
}
