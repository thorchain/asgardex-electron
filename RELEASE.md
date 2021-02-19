# How to release

1. Dev bumps `version` in `package.json`.
2. Dev drafts a new release as desribed [here](https://help.github.com/articles/creating-releases/) and edits the release draft to populate it with changes. The "Tag version" should be the `version` in `package.json`, but prefixed with `v.`. Target branch should be `release/xyz` or `hotfix/xyz` (**never** target to `develop` nor `master`)

   - E.g if the version is `1.0.0`, then the GitHub tag should be `v1.0.0`

3. Dev pushes changes to master, which triggers GitHub actions to build all binaries.
   - Ensure that `.yml` files aren't being left out in the artifacts. These are needed for auto-update to work correctly.
4. Once all binaries have been uploaded to the draft, Dev message THORCHAIN-ADMIN and they signs and updates the draft
5. Once they are done, publish the release. GitHub will tag the latest commit for you.

## Links

- `GitHub` documentation: ["Managing releases in a repository"](https://help.github.com/articles/creating-releases/)
- `electron-builder` documentation: ["Recommended GitHub Releases Workflow"](https://www.electron.build/configuration/publish#recommended-github-releases-workflow)
