import { useState } from "react";
import { ConnectionProfile, Session } from "../lib/types";

interface Props {
  profiles: ConnectionProfile[];
  sessions: Session[];
  onConnect: (p: ConnectionProfile) => void;
  onEdit: (p: ConnectionProfile) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function Sidebar({ profiles, sessions, onConnect, onEdit, onNew, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const filtered = profiles.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.host.toLowerCase().includes(search.toLowerCase())
  );

  const groups = new Map<string, ConnectionProfile[]>();
  filtered.forEach(p => {
    const g = p.group || "Ungrouped";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(p);
  });

  const isConnected = (p: ConnectionProfile) =>
    sessions.some(s => s.host === p.host && s.username === p.username && s.status === "connected");

  return (
    <div style={{
      width: 240, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      <div style={{ padding: "12px 12px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: 1 }}>
          Connections
        </span>
        <button onClick={onNew} style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1 }} title="New Connection">+</button>
      </div>
      <div style={{ padding: "0 12px 8px" }}>
        <input
          type="text" placeholder="Search..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", fontSize: 12, padding: "6px 8px" }}
        />
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "0 4px" }}>
        {Array.from(groups.entries()).map(([group, items]) => (
          <div key={group}>
            <button
              onClick={() => {
                const next = new Set(collapsed);
                next.has(group) ? next.delete(group) : next.add(group);
                setCollapsed(next);
              }}
              style={{
                width: "100%", textAlign: "left", padding: "6px 8px", fontSize: 11,
                fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <span style={{ fontSize: 8 }}>{collapsed.has(group) ? "▶" : "▼"}</span>
              {group}
              <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)" }}>{items.length}</span>
            </button>
            {!collapsed.has(group) && items.map(p => (
              <div
                key={p.id}
                onDoubleClick={() => onConnect(p)}
                style={{
                  padding: "6px 8px 6px 20px", fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, borderRadius: 4,
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                  background: isConnected(p) ? "var(--success)" : "var(--text-muted)",
                }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.name || p.host}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    {p.username}@{p.host}:{p.port}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(p); }}
                    style={{ fontSize: 11, color: "var(--text-muted)", padding: 2 }} title="Edit">✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                    style={{ fontSize: 11, color: "var(--text-muted)", padding: 2 }} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        ))}
        {profiles.length === 0 && (
          <div style={{ padding: 16, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
            No saved connections.<br />Click + to add one.
          </div>
        )}
      </div>
    </div>
  );
}
