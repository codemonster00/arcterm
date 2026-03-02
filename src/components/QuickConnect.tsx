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
        style={{ flex: 1, background: "var(--bg-primary)", fontSize: 12, padding: "6px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text)", fontFamily: "var(--font-mono)", outline: "none" }}
      />
      <button onClick={handleSubmit} style={{ padding: "6px 14px", fontSize: 12, background: "var(--primary)", border: "1px solid var(--primary)", borderRadius: "var(--radius-sm)", color: "var(--primary-text)", fontWeight: 500, cursor: "pointer" }}>
        Connect
      </button>
    </div>
  );
}
