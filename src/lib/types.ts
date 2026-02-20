export type AuthMethod = "password" | "key";

export interface ConnectionProfile {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authMethod: AuthMethod;
  password?: string;
  keyPath?: string;
  passphrase?: string;
  colorTag?: string;
  group?: string;
}

export type SessionStatus = "connecting" | "connected" | "disconnected" | "reconnecting" | "error";

export interface Session {
  id: string;
  profileName: string;
  host: string;
  username: string;
  status: SessionStatus;
  connectedAt?: number;
}

export interface SessionStatusEvent {
  sessionId: string;
  status: SessionStatus;
  message?: string;
}

export interface TerminalOutputEvent {
  sessionId: string;
  data: number[];
}
