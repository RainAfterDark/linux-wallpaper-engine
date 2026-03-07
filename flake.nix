{
  description = "Linux Wallpaper Engine Flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    bun2nix.url = "github:nix-community/bun2nix";
  };

  outputs =
    { self, ... }@inputs:
    inputs.flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import inputs.nixpkgs {
          inherit system;
          overlays = [ inputs.bun2nix.overlays.default ];
        };

        src = pkgs.nix-gitignore.gitignoreSourcePure [
          ./.gitignore
        ] ./.;

        package = pkgs.lib.importJSON ./package.json;
        deps = import ./distro/nix/deps.nix { inherit pkgs; };
      in
      {
        devShells.default =
          pkgs.callPackage ./distro/nix/shell.nix
            { inherit package deps; };

        packages.default =
          pkgs.callPackage ./distro/nix/package.nix
            { inherit src package deps; };
      }
    );
}
