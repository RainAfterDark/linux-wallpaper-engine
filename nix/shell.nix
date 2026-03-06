{
  buildFHSEnv,
  writeShellScript,
  package,
  deps,
}:
(buildFHSEnv rec {
  name = "${package.name}-dev";

  targetPkgs =
    pkgs:
    with pkgs;
    [
      bun
      nodejs
      bun2nix
      nix-output-monitor
    ]
    ++ deps.appRuntime
    ++ deps.electronRuntime
    ++ deps.forgeMakerLib;

  runScript = writeShellScript "${name}-entry" ''
    # bash
    # Run the user's preferred shell or default to bash
    USER_SHELL=$(getent passwd "$USER" | cut -d: -f7)
    exec "''${USER_SHELL:-bash}"
  '';
}).env
