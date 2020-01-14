with (import <nixpkgs> {});

mkShell {
    buildInputs = [ pkgs."nodejs-13_x" pkgs.nodePackages.typescript pkgs.nodePackages.yarn darwin.apple_sdk.frameworks.CoreServices ];

    shellHook = ''
      export PATH="$PWD/node_modules/.bin:$PATH"
      npm install > /dev/null 2>/dev/null
    '';
}
