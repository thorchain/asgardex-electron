# How to package `ASGARDEX` on macOS

Following ENV's have to be defined:

```bash
SIGNING_APPLE_ID # username of your Apple Developer account

SIGNING_APP_PASSWORD # password of your Apple Developer account

MAC_CERTIFICATE # The HTTPS link (or base64-encoded data, or file:// link, or local path) to certificate (*.p12 or *.pfx file). Shorthand ~/ is supported (home directory).

MAC_CERTIFICATE_PASSWORD # The password to decrypt the certificate given in CSC_LINK.
```

To package on GitHub, all ENV's ^ have to be set as "Secrets" to GitHub: Repository -> Settings -> Secrets

To package `ASGARDEX` on your machine locally, you have to provide these ENV locally only.

### Some extra information

- `SIGNING_APPLE_ID` and `SIGNING_APP_PASSWORD` are needed for notarizing macOS builds using [`electron-notarize`](https://github.com/electron/electron-notarize).

- `MAC_CERTIFICATE` and `MAC_CERTIFICATE_PASSWORD` are needed for code signing https://www.electron.build/code-signing

  - `MAC_CERTIFICATE` becomes `CSC_LINK` (The HTTPS link (or base64-encoded data, or file:// link, or local path) to certificate (_.p12 or _.pfx file). Shorthand ~/ is supported (home directory).)
  - `MAC_CERTIFICATE_PASSWORD` becomes `CSC_KEY_PASSWORD (The password to decrypt the certificate given in CSC_LINK.)

### Links

- `electron-notarize` API: [Method `notarize(opts): Promise<void>`](https://github.com/electron/electron-notarize#method-notarizeopts-promisevoid)
- `electron-builder` documentation: ["Code Signing"](https://www.electron.build/code-signing)
