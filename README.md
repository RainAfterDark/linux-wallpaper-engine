<div align="center">

<img src="assests/transperent-logo.png" alt="Linux Wallpaper Engine UI" width="140" />

# Linux Wallpaper Engine UI

A modern desktop GUI for [linux-wallpaperengine](https://github.com/Almamu/linux-wallpaperengine) — browse, manage, and apply your Steam Wallpaper Engine wallpapers on Linux with a polished, native-feeling interface.

<!-- ![License](https://img.shields.io/badge/license-MIT-blue) -->

</div>

---

## Preview

<!-- TODO: Add screenshots / GIFs showcasing the app -->
<!-- Recommended: a short GIF or video showing the main wallpaper grid, applying a wallpaper, and the settings page -->

| Wallpaper Grid | Wallpaper Details |
|:-:|:-:|
| *screenshot here* | *screenshot here* |

| Settings | Display Management |
|:-:|:-:|
| *screenshot here* | *screenshot here* |

<!-- Optional: embed a demo video -->
<!-- https://github.com/user-attachments/assets/VIDEO_ID -->

---

## Features

- **Wallpaper Gallery** — Browse all your Steam Workshop wallpapers in a responsive, animated grid with thumbnails
- **Search, Filter & Sort** — Instantly search by name, filter by type (Scene / Video / Web / Application), tags, or compatibility status, and sort by name, date, size, or recent
- **Detail Panel** — Click any wallpaper to reveal a side panel with preview, metadata (resolution, size, type), tags, and quick-apply controls
- **Multi-Monitor Support** — Detect all connected displays, apply different wallpapers per screen, and view your monitor layout at a glance
- **Per-Wallpaper Overrides** — Fine-tune volume, scaling, audio-reactive effects, mouse interaction, and parallax on a per-wallpaper basis — or fall back to global defaults
- **Compatibility Scanner** — Bulk-test your entire library for Linux compatibility and see at-a-glance status dots (Perfect / Minor / Major / Broken)
- **Theming** — Choose from Light, Dark, Steam, Hard Light, or System themes
- **Dynamic Background** — The app background subtly blurs the selected wallpaper's thumbnail for an immersive feel
- **Performance Controls** — Set FPS limits (up to your display's refresh rate), pause on fullscreen apps, launch on startup, minimize on close
- **Audio Controls** — Global volume, mute, auto-mute behavior, and audio-reactive effect toggles
- **Status Bar** — See the currently active wallpaper, display, and quick mute/stop controls at a glance
- **Guided Onboarding** — A built-in tutorial walks new users through the interface step by step
- **Glassmorphism UI** — Frosted-glass panels, smooth Framer Motion animations, and a clean Radix + Tailwind design system

---

## Installation

### 1. Wallpaper Engine (Steam)

You need to own and install [Wallpaper Engine](https://store.steampowered.com/app/431960/Wallpaper_Engine/) on Steam. The app automatically detects wallpaper assets from standard Steam library paths:

```
~/.local/share/Steam
~/.steam/steam
~/.var/app/com.valvesoftware.Steam/...
```

### 2. linux-wallpaperengine

This app is a **frontend** — it requires [linux-wallpaperengine](https://github.com/Almamu/linux-wallpaperengine) to actually render wallpapers on your desktop.

Follow the build instructions in the [linux-wallpaperengine repo](https://github.com/Almamu/linux-wallpaperengine#building) to compile and install it.

Once built, make sure the binary is accessible in your `$PATH`:

```bash
# If installed to /opt (common)
sudo ln -sf /opt/linux-wallpaperengine/linux-wallpaperengine /usr/local/bin/linux-wallpaperengine

# Or from a custom build directory
sudo ln -sf /path/to/your/build/linux-wallpaperengine /usr/local/bin/linux-wallpaperengine
```

Verify it works:

```bash
linux-wallpaperengine --help
```

### 3. Linux Wallpaper Engine UI

#### Debian / Ubuntu (.deb)

Download the latest `.deb` from [GitHub Releases](https://github.com/jagrat7/linux-wallpaper-engine/releases), then:

```bash
sudo apt install ./linux-wallpaper-engine_<version>_amd64.deb
```

#### Fedora / RHEL (.rpm)

```bash
sudo dnf install ./linux-wallpaper-engine-<version>.x86_64.rpm
```

#### Flatpak

```bash
flatpak install ./linux-wallpaper-engine_<version>_x64.flatpak
```

#### From source (development)

```bash
# Clone the repo
git clone https://github.com/jagrat7/linux-wallpaper-engine.git
cd linux-wallpaper-engine

# Install dependencies
bun install

# Start the app
bun start
```

> **Building for distribution:**
> ```bash
> bun run package   # portable build
> bun run make      # .deb / .rpm / .flatpak installers
> ```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Electron + Vite |
| **Frontend** | React 19 · TypeScript · TailwindCSS v4 |
| **Routing** | TanStack Router |
| **Data** | tRPC (via trpc-electron) · TanStack Query |
| **UI** | Radix UI · shadcn/ui · Framer Motion · Lucide Icons |
| **Backend** | linux-wallpaperengine (native process) |

---

## Roadmap

- [ ] Playlist support — cycle through wallpapers on a schedule or shuffle
- [ ] Steam Workshop integration — browse & download wallpapers directly from the app
- [ ] Tray mode — minimize to system tray with quick wallpaper switching
- [ ] Wallpaper preview — live preview before applying
- [ ] Favorites — mark and quickly access your top wallpapers
- [ ] Import/export settings — share your configuration across machines
- [ ] Auto-update — in-app update mechanism

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

[MIT](LICENSE)
