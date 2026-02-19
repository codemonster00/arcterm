import { Session } from "../lib/types";

interface Props {
  session?: Session;
}

export function StatusBar({ session }: Props) {
  const elapsed = session?.connectedAt
    ? Math.floor((Date.now() - session.connectedAt) / 1000)
    : 0;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 12px", height: 24, background: "var(--bg-secondary)",
      borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-secondary)",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {session ? (
          <>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: session.status === "connected" ? "var(--success)" : "var(--text-muted)",
            }} />
            <span>{session.username}@{session.host}</span>
            <span style={{ color: "var(--text-muted)" }}>|</span>
            <span>{mins}m {secs}s</span>
          </>
        ) : (
          <span>No active session</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <span>UTF-8</span>
        <span>Arcterm v0.1.0</span>
      </div>
    </div>
  );
}
