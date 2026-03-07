{
  buildFHSEnv,
  package,
  deps,
}:
(buildFHSEnv {
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
}).env
