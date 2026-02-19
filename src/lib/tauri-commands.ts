import { invoke } from "@tauri-apps/api/core";
import type { ConnectionProfile, Session } from "./types";

export async function connect(profile: ConnectionProfile): Promise<string> {
  return invoke<string>("connect", { profile });
}

export async function disconnect(sessionId: string): Promise<void> {
  return invoke("disconnect", { sessionId });
}

export async function sendInput(sessionId: string, data: string): Promise<void> {
  return invoke("send_input", { sessionId, data });
}

export async function resizeTerminal(sessionId: string, cols: number, rows: number): Promise<void> {
  return invoke("resize_terminal", { sessionId, cols, rows });
}

export async function listSessions(): Promise<Session[]> {
  return invoke<Session[]>("list_sessions");
}

export async function saveProfile(profile: ConnectionProfile): Promise<void> {
  return invoke("save_profile", { profile });
}

export async function getProfiles(): Promise<ConnectionProfile[]> {
  return invoke<ConnectionProfile[]>("get_profiles");
}

export async function deleteProfile(id: string): Promise<void> {
  return invoke("delete_profile", { id });
}

export async function testConnection(profile: ConnectionProfile): Promise<string> {
  return invoke<string>("test_connection", { profile });
}
