{ pkgs }:
{
  # Specific Electron version (should match the project's package.json)
  # (for minor version bumps, flake lock needs to be bumped)
  electron = pkgs.electron_39; # v39.7.0

  # Runtime programs needed by the app itself (except Steam)
  # (for hostExecAsync calls)
  appRuntime = with pkgs; [
    linux-wallpaperengine
    xrandr
    wlr-randr
    gnome-randr
    ffmpeg-headless
    coreutils
    procps
    which
    file
  ];
}
