import { Session } from "../lib/types";

interface Props {
  sessions: Session[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
  onToggleSidebar: () => void;
}

export function TabBar({ sessions, activeId, onSelect, onClose, onNew, onToggleSidebar }: Props) {
  const statusColor = (s: Session) => {
    switch (s.status) {
      case "connected": return "var(--success)";
      case "connecting": return "var(--warning)";
      case "error": return "var(--error)";
      default: return "var(--text-muted)";
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", background: "var(--bg-secondary)",
      borderBottom: "1px solid var(--border)", height: 36, flexShrink: 0,
    }}>
      <button
        onClick={onToggleSidebar}
        style={{ padding: "0 12px", height: "100%", fontSize: 14, color: "var(--text-secondary)" }}
        title="Toggle Sidebar"
      >☰</button>
      <div style={{ display: "flex", flex: 1, overflow: "auto", height: "100%" }}>
        {sessions.map(s => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0 12px", height: "100%", cursor: "pointer",
              fontSize: 12, whiteSpace: "nowrap", position: "relative",
              background: s.id === activeId ? "var(--bg-primary)" : "transparent",
              borderBottom: s.id === activeId ? "2px solid var(--accent)" : "2px solid transparent",
              color: s.id === activeId ? "var(--text-primary)" : "var(--text-secondary)",
              transition: "all 0.15s",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor(s) }} />
            <span>{s.profileName}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(s.id); }}
              style={{ fontSize: 14, color: "var(--text-muted)", marginLeft: 4, lineHeight: 1 }}
            >×</button>
          </div>
        ))}
      </div>
      <button
        onClick={onNew}
        style={{ padding: "0 12px", height: "100%", fontSize: 16, color: "var(--text-secondary)" }}
        title="New Connection"
      >+</button>
    </div>
  );
}
