---
name: Prepare a next release (for devs only)
about: Steps to release a next version
---

## Description

Prepare next release {version}

## TODOs

- [ ] Create branch `release/{version-number}` from latest `develop`
- [ ] Bump version number in `package.json`
- [ ] Update CHANGELOG.md
- [ ] Create DRAFT release page at GH linked to `release/{version-number}` branch
- [ ] ADD release notes to DRAFT release page
- [ ] Sign binaries as described [here](https://github.com/thorchain/Resources/blob/master/admin-GPG-keys.md) and add signed message to DRAFT release page
- [ ] Check binaries by running on `macOS`, `Windows` and `Linux`
- [ ] Publish release
