# Git branching workflow

For development ASGARDEX we follow [OneFlow approach](https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow#finishing-a-release-branch), which based on [GitFlow considered harmful](https://www.endoflineblog.com/gitflow-considered-harmful) article by [Adam Ruka](https://www.endoflineblog.com).

## Development

Main branch for development is `develop`

## Feature

### Create `feature` branch

To add new features, create a feature branch and name it based on issue number `issue-xyz/description`

Example:

```
git checkout -b issue-123/example develop
```

### Update `develop` branch

Open a PR to review at GitHub and squash merge changes after that into `develop` or as following:

```
git checkout develop
git merge --squash issue-123/example
git push
git branch -D issue-123/example
```

## Release

### Create `release` branch

To open a release, create a release branch (name it `release/{version}`) and push it to repository

Example:

```
git checkout -b release/v.0.0.5 develop
git push
```

If needed, open a PR for reviewing changes.

Prepare a draft release as described in [RELEASE.md](./RELEASE.md) and point it to latest release branch you have created before. By publishing the release GitHub will create a tag for you.

### Update `develop` branch

After that, bring changes of release branch into `develop` by squash merging previous created PR or like following:

```
git checkout develop
git merge --squash release/v.0.0.5
git push
```

Delete release branch.

Example:

```
git branch -D release/v.0.0.5
git push origin --delete release/v.0.0.5
```

### Update `master` branch

Update master by fast-forwarding to the latest tag

Example:

```
git fetch
git checkout master
git merge --ff-only v0.0.5
git push
```

## Hotfix

### Create `hotfix` branch

Checkout master, which always based on latest tag.

Example:

```
git checkout -b hotfix/0.0.6 master
```

Or checkout latest tag.

Example:

```
git checkout -b hotfix/0.0.6 v0.0.5
```

Open a PR to review. Similar to any other release, prepare a draft release as described in [RELEASE.md](./RELEASE.md) and point it to this hotfix branch you have created before. By publishing the release Github will create a tag for you.

### Update `develop` branch

Squash merge hotfix back to develop in GitHub or as follow:

Example:

```
$ git checkout hotfix/0.0.6
$ git checkout develop
$ git merge --squash hotfix/0.0.6
$ git branch -d hotfix/2.3.1
```

### Update `master` branch

Update master by fast-forwarding to the latest tag

Example:

```
git fetch
git checkout master
git merge --ff-only v0.0.6
git push
```
