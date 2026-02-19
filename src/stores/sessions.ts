import { Session, SessionStatus } from "../lib/types";

type Listener = () => void;

class SessionStore {
  sessions: Session[] = [];
  activeSessionId: string | null = null;
  private listeners: Listener[] = [];

  subscribe(fn: Listener) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private notify() { this.listeners.forEach(fn => fn()); }

  addSession(session: Session) {
    this.sessions.push(session);
    this.activeSessionId = session.id;
    this.notify();
  }

  updateStatus(sessionId: string, status: SessionStatus) {
    const s = this.sessions.find(s => s.id === sessionId);
    if (s) { s.status = status; this.notify(); }
  }

  removeSession(sessionId: string) {
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = this.sessions[0]?.id ?? null;
    }
    this.notify();
  }

  setActive(sessionId: string) {
    this.activeSessionId = sessionId;
    this.notify();
  }
}

export const sessionStore = new SessionStore();
