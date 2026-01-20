# Linux Wallpaper Engine UI

A desktop GUI application for [linux-wallpaperengine](https://github.com/Almamu/linux-wallpaperengine) - run Steam Wallpaper Engine wallpapers on Linux.

## Prerequisites
### 1. Install Wallpaper Engine (Steam)

You need to own and install [Wallpaper Engine](https://store.steampowered.com/app/431960/Wallpaper_Engine/) via Steam. The assets are automatically detected from standard Steam paths.

### 2. Install linux-wallpaperengine




### 3. (Optional) Make linux-wallpaperengine available globally

If you built from source or installed to `/opt`, you can create a symlink to run it from anywhere:

```bash
# If installed to /opt
sudo ln -sf /opt/linux-wallpaperengine/linux-wallpaperengine /usr/local/bin/linux-wallpaperengine

# Or if you built in a custom location
sudo ln -sf /path/to/your/build/output/linux-wallpaperengine /usr/local/bin/linux-wallpaperengine
```

Now you can run `linux-wallpaperengine` from any terminal without specifying the full path.

## Development

```bash
# Install dependencies
bun install

# Start development server
bun start

# Build for production
bun run package
```
