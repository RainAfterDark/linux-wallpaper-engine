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

  # Runtime libraries needed by Electron. Refer to Nixpkgs:
  # https://github.com/NixOS/nixpkgs/blob/nixos-unstable/pkgs/development/tools/electron/binary/generic.nix
  electronRuntime = with pkgs; [
    alsa-lib
    at-spi2-atk
    cairo
    cups
    dbus
    expat
    gdk-pixbuf
    glib
    gtk3
    gtk4
    nss
    nspr
    libx11
    libxcb
    libxcomposite
    libxdamage
    libxext
    libxfixes
    libxrandr
    libxkbfile
    pango
    pciutils
    stdenv.cc.cc
    systemd
    libnotify
    pipewire
    libsecret
    libpulseaudio
    speechd-minimal
    libdrm
    libgbm
    libxkbcommon
    libxshmfence
    libGL
    vulkan-loader
  ];

  # Libraries for Forge's makers
  # Known issues: rpm and flatpak makers fail
  # (the sane thing to do might be not forcing this on Nix)
  forgeMakerLib = with pkgs; [
    zip
    rpm
    dpkg
    fakeroot
    flatpak
    flatpak-builder
    elfutils
  ];
}
