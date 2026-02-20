# Arcterm ⚡

A premium SSH terminal client built with Tauri (Rust) + React + TypeScript. Designed for power users who demand both functionality and polish.

![Arcterm Preview](screenshots/arcterm-preview.png)

## ✨ Features

### 🎨 **Theme System**
- **8 Premium Color Schemes**: GitHub Dark, Dracula, Monokai, Nord, Solarized Dark/Light, One Dark, Tokyo Night
- **Unified Theming**: Terminal colors automatically sync with UI chrome
- **Live Theme Switching**: Change themes instantly without restart
- **Custom Color Profiles**: Terminal and UI themes designed to complement each other

### ✂️ **Split Panes**
- **Horizontal & Vertical Splits**: Run multiple terminals side by side
- **Draggable Dividers**: Resize panes by dragging the divider
- **Independent Sessions**: Each pane runs its own SSH session
- **Smart Layout**: Automatic layout management for complex arrangements
- **Keyboard Shortcuts**: `Ctrl+Shift+H` (horizontal), `Ctrl+Shift+V` (vertical)

### 🔍 **Terminal Search**
- **Instant Search**: Press `Ctrl+F` to search terminal output
- **Real-time Highlighting**: Find text as you type
- **Navigation**: `Enter` for next match, `Shift+Enter` for previous
- **Search History**: Remember recent searches
- **RegEx Support**: Advanced pattern matching capabilities

### 📂 **SFTP File Browser** *(Coming Soon)*
- **Integrated File Manager**: Browse remote files alongside terminal
- **Drag & Drop**: Upload files by dragging into the file browser
- **File Operations**: Create, rename, delete, and modify permissions
- **Progress Indicators**: Visual feedback for uploads/downloads
- **File Type Icons**: Recognize files at a glance

### 📌 **Snippet & Command Manager**
- **Quick Command Access**: Save frequently used commands
- **Smart Organization**: Categorize snippets by type (filesystem, system, network, etc.)
- **Command Palette**: `Ctrl+Shift+P` for instant snippet search and execution
- **Usage Analytics**: Track most-used commands
- **Tag System**: Organize with custom tags for better discovery

### 🔔 **Connection Alerts & Auto-Reconnect**
- **Toast Notifications**: Visual alerts for connection status changes
- **Auto-Reconnect**: Intelligent reconnection with exponential backoff
- **Visual Indicators**: Tab icons show connection health (🔴 for disconnected)
- **Connection Monitoring**: Real-time latency and status tracking
- **Configurable Alerts**: Customize notification preferences

### ⌨️ **Keyboard Shortcuts**
- **Power User Focused**: Extensive keyboard navigation
- **Customizable Shortcuts**: Remap keys to your preference
- **Context Aware**: Different shortcuts for different modes
- **Global Shortcuts**: Work regardless of focus

| Action | Default Shortcut | Description |
|--------|------------------|-------------|
| New Tab | `Ctrl+T` | Create new connection |
| Close Tab | `Ctrl+W` | Close current tab |
| Next Tab | `Ctrl+Tab` | Switch to next tab |
| Previous Tab | `Ctrl+Shift+Tab` | Switch to previous tab |
| Split Horizontal | `Ctrl+Shift+H` | Split terminal horizontally |
| Split Vertical | `Ctrl+Shift+V` | Split terminal vertically |
| Search | `Ctrl+F` | Search in terminal |
| Command Palette | `Ctrl+Shift+P` | Open command/snippet palette |
| Toggle Sidebar | `Ctrl+B` | Show/hide sidebar |
| Settings | `Ctrl+,` | Open settings |

### 📊 **Enhanced Status Bar**
- **Connection Stats**: Real-time bytes sent/received
- **Session Uptime**: Track how long you've been connected
- **Latency Monitor**: Live ping/latency indicator with color coding
- **Terminal Info**: Current terminal dimensions (cols × rows)
- **Encoding Display**: Character encoding indicator
- **System Time**: Current time display

### 🎭 **UI Polish & UX**
- **Smooth Animations**: Subtle transitions throughout the interface
- **Context Menus**: Right-click for contextual actions
- **Drag-to-Reorder**: Rearrange tabs by dragging
- **Welcome Screen**: Beautiful onboarding for new users
- **Connection Groups**: Organize connections with colors and icons
- **Responsive Design**: Works on different screen sizes
- **Dark Mode Optimized**: Designed for comfortable extended use

### 🔧 **Advanced Terminal Features**
- **xterm.js Powered**: Industry-standard terminal emulation
- **WebGL Acceleration**: Hardware-accelerated rendering for smooth performance
- **Image Support**: Display images inline with SIXEL and iTerm protocols
- **Clipboard Integration**: System clipboard access
- **Link Detection**: Clickable URLs and file paths
- **Font Ligatures**: Programming font ligature support
- **Unicode Support**: Full international character support

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Rust** 1.70+
- **Operating System**: Windows, macOS, or Linux

### Installation

#### From Source
```bash
# Clone the repository
git clone https://github.com/codemonster00/arcterm.git
cd arcterm

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
npm run tauri build
```

#### Binary Releases *(Coming Soon)*
Download pre-built binaries from the [Releases](https://github.com/codemonster00/arcterm/releases) page.

### First Launch
1. **Create Connection**: Click "New Connection" or press `Ctrl+T`
2. **Choose Authentication**: Password or SSH key
3. **Connect**: Click "Connect and Save" to establish your first session
4. **Explore**: Try the command palette (`Ctrl+Shift+P`) and themes

## 📸 Screenshots

### Dark Theme with Split Panes
![Split Panes](screenshots/split-panes.png)

### Command Palette
![Command Palette](screenshots/command-palette.png)

### Theme Selector
![Theme Selector](screenshots/themes.png)

### Connection Manager
![Connections](screenshots/connections.png)

## ⚙️ Configuration

### Connection Profiles
Connections are stored locally and encrypted. Each profile supports:
- **Multiple Authentication**: Password, SSH keys, or key with passphrase
- **Custom Settings**: Per-connection terminal preferences  
- **Connection Groups**: Organize by project, environment, etc.
- **Visual Tags**: Color-code connections for quick identification

### Themes & Appearance
- **Automatic Sync**: Terminal and UI themes stay coordinated
- **Live Switching**: Change themes without restart
- **Custom Fonts**: Configure terminal fonts and sizing
- **Transparency**: Optional transparent backgrounds

### Keyboard Shortcuts
All shortcuts are customizable through Settings (`Ctrl+,`):
- **Remap Any Action**: Change shortcuts to match your workflow
- **Conflict Detection**: Prevents duplicate shortcut assignments
- **Context Sensitivity**: Different shortcuts for different modes

## 🔒 Security

- **Local Storage**: Connections stored locally, never in the cloud
- **SSH Key Support**: Full support for RSA, ED25519, and other key types
- **Agent Integration**: Works with ssh-agent and other key managers
- **No Telemetry**: No usage data collection or tracking

## 🛠️ Development

### Architecture
- **Frontend**: React + TypeScript + Zustand for state management
- **Backend**: Rust + Tauri for native performance and security
- **Terminal**: xterm.js with custom addons for enhanced functionality
- **SSH**: Pure Rust SSH implementation for reliability

### Building
```bash
# Frontend only (for testing)
npm run build

# Full application build
npm run tauri build

# Development with hot reload
npm run tauri dev
```

### Contributing
We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 Roadmap

### Near Term (v0.2.0)
- [ ] **SFTP File Browser**: Full-featured file management
- [ ] **Session Recording**: Record and replay terminal sessions
- [ ] **Port Forwarding**: GUI for SSH tunnels and port forwards
- [ ] **Settings UI**: Complete settings management interface

### Medium Term (v0.3.0)
- [ ] **Sync Settings**: Cloud sync for configurations (optional)
- [ ] **Plugin System**: Custom extensions and themes
- [ ] **Advanced Search**: Search across all terminal history
- [ ] **Team Sharing**: Share connection profiles (encrypted)

### Long Term (v1.0.0)
- [ ] **Mobile Support**: iOS/Android companion app
- [ ] **AI Integration**: Smart command suggestions
- [ ] **Advanced Monitoring**: System resource monitoring
- [ ] **Multi-Protocol**: Support for additional protocols (Telnet, Serial, etc.)

## 🤝 Support

- **Documentation**: [docs.arcterm.dev](https://docs.arcterm.dev) *(Coming Soon)*
- **Issues**: [GitHub Issues](https://github.com/codemonster00/arcterm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/codemonster00/arcterm/discussions)
- **Discord**: [Community Discord](https://discord.gg/arcterm) *(Coming Soon)*

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built on the shoulders of giants:
- **[Tauri](https://tauri.app/)**: Cross-platform app framework
- **[xterm.js](https://xtermjs.org/)**: Terminal emulation library
- **[russh](https://crates.io/crates/russh)**: Pure Rust SSH implementation
- **[React](https://react.dev/)**: UI framework
- **[Lucide](https://lucide.dev/)**: Beautiful icons

---

**Made with ❤️ for terminal power users everywhere**

⭐ **Star this repo** if you find Arcterm useful!