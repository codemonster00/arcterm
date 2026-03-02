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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  background: "var(--bg-primary)",
  color: "var(--text)",
  fontSize: 13,
  fontFamily: "var(--font-sans)",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%237d8590' viewBox='0 0 16 16'%3E%3Cpath d='M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: 32,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-muted)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const btnBase: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: "var(--radius-sm)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.15s ease",
  border: "1px solid var(--border)",
  fontFamily: "var(--font-sans)",
};

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
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-secondary)",
          borderRadius: 12,
          padding: 28,
          width: 460,
          border: "1px solid var(--border)",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.4)",
          animation: "fadeIn 0.15s ease",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "var(--text)" }}>
          {profile ? "Edit" : "New"} Connection
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="My Server" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Group</label>
              <input value={group} onChange={e => setGroup(e.target.value)} placeholder="Production" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Host</label>
              <input value={host} onChange={e => setHost(e.target.value)} placeholder="192.168.1.1" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Port</label>
              <input type="number" value={port} onChange={e => setPort(+e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="root" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Authentication</label>
            <select value={authMethod} onChange={e => setAuthMethod(e.target.value as AuthMethod)} style={selectStyle}>
              <option value="password">Password</option>
              <option value="key">SSH Key</option>
            </select>
          </div>
          {authMethod === "password" ? (
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </div>
          ) : (
            <div>
              <label style={labelStyle}>Key File Path</label>
              <input value={keyPath} onChange={e => setKeyPath(e.target.value)} placeholder="~/.ssh/id_ed25519" style={inputStyle} />
            </div>
          )}
          <div>
            <label style={labelStyle}>Color Tag</label>
            <input type="color" value={colorTag} onChange={e => setColorTag(e.target.value)} 
              style={{ width: 40, height: 32, padding: 2, cursor: "pointer", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg-primary)" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ ...btnBase, background: "transparent", color: "var(--text-muted)" }}>Cancel</button>
          <button onClick={() => onSave(buildProfile())} style={{ ...btnBase, background: "var(--surface-hover)", color: "var(--text)" }}>Save</button>
          <button onClick={() => onConnect(buildProfile())} style={{ ...btnBase, background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-text)", fontWeight: 600 }}>Save & Connect</button>
        </div>
      </div>
    </div>
  );
}
