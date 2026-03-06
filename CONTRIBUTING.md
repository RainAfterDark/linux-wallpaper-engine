# Contributing

Thanks for your interest in contributing! For bug reports and feature requests, please use the [issue templates](https://github.com/jagrat7/linux-wallpaper-engine/issues/new/choose). This guide is for code contributions.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Guide](#development-guide)
- [Submitting Changes](#submitting-changes)
- [Becoming a Collaborator](#becoming-a-collaborator)


## Getting Started

### Prerequisites

- [Node.js & Bun](https://bun.sh/) - you'll need both for development
- [linux-wallpaperengine](https://github.com/Almamu/linux-wallpaperengine) installed and binary accessible in your `$PATH`
- [Wallpaper Engine](https://store.steampowered.com/app/431960/Wallpaper_Engine/) installed on Steam with wallpapers downloaded


### Development Setup

```bash
git clone https://github.com/jagrat7/linux-wallpaper-engine.git
cd linux-wallpaper-engine
```

For Nix, you can enter the dev shell that will set up bun + electron for you (in a FHS environment):

```bash
nix develop
```

Then, on any distro, proceed to:

```bash
bun install
bun start
```

### Building Packages

```bash
bun run make
```

Builds packages for your current platform using Electron Forge. Build configuration is in `forge.config.ts`. The results will be in the `out/` directory.

For Nix, the rpm and flatpak makers fail to build inside the FHS environment. To build for Nix, you can run:

```bash
# Build the flake package for Nix
nix build # or nom build, for better output logs

# Run the binary
./result/bin/linux-wallpaper-engine

# Inside the dev shell, you can also use bun
bun run package
```


## Project Structure

The app follows a 3-layer Electron architecture:

```text
src/
├── main/              # Electron main process (backend)
│   ├── services/      # Business logic (singleton pattern)
│   └── trpc/routes/   # tRPC API endpoints
├── renderer/          # React UI (frontend)
│   ├── components/    # UI components (+ shadcn/ui in components/ui/)
│   ├── hooks/         # Custom React hooks
│   ├── contexts/      # React context providers
│   ├── routes/        # TanStack Router pages
│   └── lib/           # Utilities (cn, formatFileSize, etc.)
├── preload/           # IPC bridge
└── shared/            # Types & constants shared across layers

forge.config.ts            # Electron Forge (packaging, makers, publishers)
vite.main.config.mts       # Vite config for main process
vite.renderer.config.mts   # Vite config for renderer (React, TanStack Router, Tailwind)
vite.preload.config.mts    # Vite config for preload script
```

Each Vite config has `@` and `~` aliases pointing to its respective `src/` subdirectory.

The renderer communicates with the main process through tRPC — no manual IPC. This gives full type safety across process boundaries.

TLDR: UI React stuff is in `renderer/` and the "backend" logic is in `main/`.

## Development Guide

Make your best effort to keep it DRY and organized. Before writing new code, check if something reusable already exists. If feel this is not most optimial way to do things, do let me know. Here's where things go:

### Shared

- **Constants** — `src/shared/constants.ts`
- **Import aliases** — Use `@` or `~` import aliases instead of relative paths (e.g. `import { cn } from '@/lib/utils'`)

### "Backend" (`src/main/`)

- **Services** — `src/main/services/`, follow the singleton pattern. Keep complex logic here, not in the API layer. Big services should be split into smaller, focused services and utilities
- **tRPC routes** — `src/main/trpc/routes/`, this layer is for assembling service calls and returning data. Low-complexity logic (e.g. `window.ts`) can live here directly, but anything more complex should go in a service. You should always validate tRPC input with Zod

### "Frontend" (`src/renderer/`)

- **Hooks** — `src/renderer/hooks/`, create reusable hooks for UI logic
- **Utility functions** — `src/renderer/lib/utils.ts` (e.g. `cn()` for classnames, date formatting)
- **UI components** — use existing shadcn/ui components in `components/ui/` or install new ones via shadcn CLI for React
- **Styling** — use Tailwind CSS

### Configuration (`forge.config.ts`, `vite.*.config.mts`)

- **Forge config** — controls packaging, makers, and publishing. Changes here affect how the app is built and distributed
- **Vite configs** — one per layer (main, renderer, preload). The renderer config includes React, TanStack Router, and Tailwind plugins

### Code Rules

- No semicolons in files
- Avoid hardcoded values — extract to `src/shared/constants.ts`
- No hardcoded colors like `text-red-500` — use Tailwind theme variables from `global.css`
- Use kebab-case for file and folder names
- Group related components in their own folder
- Run `bun run check` before submitting or have the eslint extension



## Submitting Changes

### Fork + PR (recommended)

1. Fork the repo on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/your-username/linux-wallpaper-engine.git
   cd linux-wallpaper-engine
   ```

3. Create a branch from `main`:

   ```bash
   git checkout -b feat/your-feature-name
   ```

4. Push to your fork and open a pull request against `main`
5. In the PR description, explain what you changed and link any related issues (e.g. "Closes #12")

### Branch Naming

| Prefix      | Use for               |
| ----------- | --------------------- |
| `feat/`     | New features          |
| `fix/`      | Bug fixes             |
| `docs/`     | Documentation changes |
| `refactor/` | Code refactoring      |
| `misc/`     | Miscellaneous changes |

## Becoming a Collaborator

If you're a regular contributor and/or want direct push access (no forking needed), reach out via:

- A [GitHub Issue](https://github.com/jagrat7/linux-wallpaper-engine/issues) or [Discussion](https://github.com/jagrat7/linux-wallpaper-engine/discussions)
- Socials linked on my [Profile](https://github.com/jagrat7)
