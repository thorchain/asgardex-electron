---
name: Prepare a next release (for devs only)
about: Steps to release a next version
---

## Description

Prepare next release {version}

## TODO

1. Create branch `release/{version-number}` from latest `develop`
1. Bump version number in `package.json`
1. Update CHANGELOG.md
1. Create DRAFT release page at GH linked to `release/{version-number}` branch
1. ADD release notes to DRAFT release page
1. Sign binaries as described [here](https://github.com/thorchain/Resources/blob/master/admin-GPG-keys.md) and add signed message to DRAFT release page
1. Check binaries by running on `macOS`, `Windows` and `Linux`
1. Publish release
