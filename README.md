# ⚡ Arcterm

A blazing-fast, cross-platform SSH terminal client built with Tauri + React.

![Rust](https://img.shields.io/badge/rust-1.70+-orange.svg)
![Tauri](https://img.shields.io/badge/tauri-2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

- **SSH2 Protocol** — Powered by `russh` for fast, secure connections
- **Multiple Sessions** — Tabbed interface with concurrent SSH sessions
- **Connection Manager** — Save, organize, and group connection profiles
- **Quick Connect** — `user@host:port` instant connection bar
- **Authentication** — Password, SSH key (RSA, Ed25519, ECDSA), key with passphrase
- **Terminal** — Full xterm.js terminal with 256-color support, clickable URLs
- **Dark Theme** — Professional GitHub-dark inspired UI
- **Cross-Platform** — Linux, macOS, Windows

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Rust + Tauri 2 |
| SSH | russh |
| Frontend | React + TypeScript |
| Terminal | xterm.js |
| Build | Vite |

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Project Structure

```
arcterm/
├── src-tauri/          # Rust backend (SSH, PTY, config)
│   └── src/
│       ├── ssh/        # SSH connection, session, auth
│       ├── terminal/   # PTY handling
│       ├── config/     # Profile storage
│       └── commands.rs # Tauri IPC commands
├── src/                # React frontend
│   ├── components/     # Terminal, Sidebar, TabBar, etc.
│   ├── stores/         # State management
│   └── lib/            # Types, Tauri command wrappers
└── .github/workflows/  # CI/CD
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New connection |
| `Ctrl+W` | Close tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |

## License

MIT
