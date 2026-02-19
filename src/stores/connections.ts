import { ConnectionProfile } from "../lib/types";
import * as cmds from "../lib/tauri-commands";

type Listener = () => void;

class ConnectionStore {
  profiles: ConnectionProfile[] = [];
  private listeners: Listener[] = [];

  subscribe(fn: Listener) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private notify() { this.listeners.forEach(fn => fn()); }

  async load() {
    try { this.profiles = await cmds.getProfiles(); } catch { this.profiles = []; }
    this.notify();
  }

  async save(profile: ConnectionProfile) {
    await cmds.saveProfile(profile);
    await this.load();
  }

  async remove(id: string) {
    await cmds.deleteProfile(id);
    await this.load();
  }
}

export const connectionStore = new ConnectionStore();
