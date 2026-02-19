import { useState } from "react";
import { ConnectionProfile, AuthMethod } from "../lib/types";

interface Props {
  profile?: ConnectionProfile;
  onSave: (p: ConnectionProfile) => void;
  onConnect: (p: ConnectionProfile) => void;
  onClose: () => void;
}

function generateId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export function ConnectionDialog({ profile, onSave, onConnect, onClose }: Props) {
  const [name, setName] = useState(profile?.name ?? "");
  const [host, setHost] = useState(profile?.host ?? "");
  const [port, setPort] = useState(profile?.port ?? 22);
  const [username, setUsername] = useState(profile?.username ?? "");
  const [authMethod, setAuthMethod] = useState<AuthMethod>(profile?.authMethod ?? "password");
  const [password, setPassword] = useState(profile?.password ?? "");
  const [keyPath, setKeyPath] = useState(profile?.keyPath ?? "");
  const [group, setGroup] = useState(profile?.group ?? "");
  const [colorTag, setColorTag] = useState(profile?.colorTag ?? "#58a6ff");

  const buildProfile = (): ConnectionProfile => ({
    id: profile?.id ?? generateId(),
    name: name || `${username}@${host}`,
    host, port, username, authMethod,
    ...(authMethod === "password" ? { password } : { keyPath }),
    group: group || undefined,
    colorTag,
  });

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-secondary)", borderRadius: 12, padding: 24,
          width: 420, border: "1px solid var(--border)",
          animation: "fadeIn 0.15s ease",
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>{profile ? "Edit" : "New"} Connection</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="My Server" style={{ width: "100%" }} />
            </div>
            <div>
              <label style={labelStyle}>Group</label>
              <input value={group} onChange={e => setGroup(e.target.value)} placeholder="Production" style={{ width: "100%" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Host</label>
              <input value={host} onChange={e => setHost(e.target.value)} placeholder="192.168.1.1" style={{ width: "100%" }} />
            </div>
            <div>
              <label style={labelStyle}>Port</label>
              <input type="number" value={port} onChange={e => setPort(+e.target.value)} style={{ width: "100%" }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="root" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={labelStyle}>Authentication</label>
            <select value={authMethod} onChange={e => setAuthMethod(e.target.value as AuthMethod)} style={{ width: "100%" }}>
              <option value="password">Password</option>
              <option value="key">SSH Key</option>
            </select>
          </div>
          {authMethod === "password" ? (
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%" }} />
            </div>
          ) : (
            <div>
              <label style={labelStyle}>Key File Path</label>
              <input value={keyPath} onChange={e => setKeyPath(e.target.value)} placeholder="~/.ssh/id_ed25519" style={{ width: "100%" }} />
            </div>
          )}
          <div>
            <label style={labelStyle}>Color Tag</label>
            <input type="color" value={colorTag} onChange={e => setColorTag(e.target.value)} style={{ width: 40, height: 30, padding: 2, cursor: "pointer" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-secondary" onClick={() => onSave(buildProfile())}>Save</button>
          <button className="btn-primary" onClick={() => onConnect(buildProfile())}>Save & Connect</button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 500,
  color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5,
};
