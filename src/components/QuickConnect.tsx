import { useState } from "react";
import { ConnectionProfile } from "../lib/types";

interface Props {
  onConnect: (p: ConnectionProfile) => void;
}

export function QuickConnect({ onConnect }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    // Parse user@host:port
    let input = value.trim();
    let username = "root";
    let host = input;
    let port = 22;

    if (input.includes("@")) {
      [username, host] = input.split("@", 2);
    }
    if (host.includes(":")) {
      const parts = host.split(":");
      host = parts[0];
      port = parseInt(parts[1]) || 22;
    }

    onConnect({
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      name: `${username}@${host}`,
      host, port, username,
      authMethod: "password",
    });
    setValue("");
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 12px", background: "var(--bg-secondary)",
      borderBottom: "1px solid var(--border)",
    }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>⚡</span>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
        placeholder="Quick connect: user@host:port"
        style={{ flex: 1, background: "var(--bg-tertiary)", fontSize: 12, padding: "5px 10px", border: "1px solid var(--border)", borderRadius: 4 }}
      />
      <button className="btn-primary" onClick={handleSubmit} style={{ padding: "5px 12px", fontSize: 12 }}>
        Connect
      </button>
    </div>
  );
}
