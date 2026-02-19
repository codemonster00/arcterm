import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import * as cmds from "../lib/tauri-commands";

interface Props {
  sessionId: string;
  registerDataHandler: (sessionId: string, handler: (data: Uint8Array) => void) => () => void;
}

export function Terminal({ sessionId, registerDataHandler }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: "bar",
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      theme: {
        background: "#0a0a0a",
        foreground: "#e6edf3",
        cursor: "#58a6ff",
        selectionBackground: "#264f78",
        black: "#484f58",
        red: "#f85149",
        green: "#3fb950",
        yellow: "#d29922",
        blue: "#58a6ff",
        magenta: "#bc8cff",
        cyan: "#39d353",
        white: "#e6edf3",
        brightBlack: "#6e7681",
        brightRed: "#ffa198",
        brightGreen: "#56d364",
        brightYellow: "#e3b341",
        brightBlue: "#79c0ff",
        brightMagenta: "#d2a8ff",
        brightCyan: "#56d364",
        brightWhite: "#ffffff",
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    term.open(containerRef.current);

    setTimeout(() => fitAddon.fit(), 50);

    term.onData((data) => {
      cmds.sendInput(sessionId, data).catch(() => {});
    });

    term.onResize(({ cols, rows }) => {
      cmds.resizeTerminal(sessionId, cols, rows).catch(() => {});
    });

    const unregister = registerDataHandler(sessionId, (data) => {
      term.write(data);
    });

    const resizeObserver = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch {}
    });
    resizeObserver.observe(containerRef.current);

    termRef.current = term;

    return () => {
      unregister();
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [sessionId, registerDataHandler]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", padding: 4 }} />;
}
