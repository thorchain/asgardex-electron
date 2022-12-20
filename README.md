<div align="center">
  <img src="internals/img/asgardex-banner.png" width="100%" />
  <br/>
  <br/>
  <img src="internals/img/asgardex-splash.png" width="100%" />
</div>

[![Version](https://img.shields.io/github/package-json/v/thorchain/asgardex-electron?color=xyz&filename=package.json&style=flat-square)](https://github.com/thorchain/asgardex-electron/releases)
![Test](https://github.com/thorchain/asgardex-electron/workflows/Test/badge.svg)
![Electron build](https://github.com/thorchain/asgardex-electron/workflows/Electron%20build/badge.svg)

[![Discord](https://img.shields.io/badge/chat-on%20discord-7289da.svg)](https://discord.gg/pHcS67yX7Z)
[![Follow on Twitter](https://img.shields.io/twitter/follow/asgardex?style=social)](https://twitter.com/asgardex)

## Feature list

Symbols:
:heavy_check_mark: implemented
:white_check_mark: planned
`-` not needed

### Wallet

|                | RUNE               | BNB / BEP2         | BTC                | BCH                | DOGE               | ETH / ERC20        | LTC                | COSMOS             |
| -------------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ |
| Keystore       | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Ledger \*      | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Send \*\*      | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Receive        | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Upgrade \*\*\* | :heavy_check_mark: | :heavy_check_mark: | -                  | -                  | -                  | :heavy_check_mark: | -                  | -                  |
| Deposit        | :heavy_check_mark: | -                  | -                  | -                  | -                  | -                  | -                  | -                  |
| Shares         | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| History        | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Synths         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |

(\*) Ledger `RUNE` is not supported at `stagenet`. Ledger `LTC`/`BCH`/`DOGE` are not supported at `testnet`

(\*\*) With or without memo

(\*\*\*) Upgrade RUNE (BEP2) or RUNE (ERC20) to RUNE (Native)

### Exchange

|                | RUNE               | BNB / BEP2         | BTC                | BCH                | DOGE               | ETH / ERC20        | LTC                | COSMOS             |
| -------------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ |
| Pools overview | -                  | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Pool detail    | -                  | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Swap           | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Deposit \*     | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Withdraw \*    | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Recovery tool  | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Synths         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |

(\*) Symmetrical deposit/withdraw only

### THORNode

| Overview           | Status             | BOND               | UNBOND             | LEAVE              |
| ------------------ | ------------------ | ------------------ | ------------------ | ------------------ |
| :heavy_check_mark: | :white_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |

### Languages

| ENGLISH :us:       | GERMAN :de:        | FRENCH :fr:        | RUSSIAN :ru:       |
| ------------------ | ------------------ | ------------------ | ------------------ |
| :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |

### Misc.

- 100% open-source (built by the community)
- Security first
- No extra (affiliate) fees

## ASGARDEX uses following libraries, frameworks and more:

_(in alphabetical order)_

- [Ant Design](https://github.com/ant-design/ant-design/)
- [Create React App](https://github.com/facebook/create-react-app)
- [ESLint](https://github.com/eslint/eslint)
- [Electron](https://github.com/electron/electron/)
- [fp-ts](https://gcanti.github.io/fp-ts/)
- [Jest](https://github.com/facebook/jest)
- [Observable Hooks](https://observable-hooks.js.org/)
- [Prettier](https://github.com/prettier/prettier)
- [ReactJS](https://github.com/facebook/react/)
- [Styled Components](https://styled-components.com/)
- [Testcafe](https://github.com/DevExpress/testcafe)
- ~~[THORChain Byzantine Module](https://gitlab.com/thorchain/byzantine-module/)~~
- [RxJS](https://rxjs.dev/)
- [Typescript](https://github.com/microsoft/TypeScript)
- [xchainjs-lib](https://github.com/xchainjs/xchainjs-lib/)
- and others ...

## Install

It's recommended to use a Node version as same as Electron is running with (currently: [`Electron v20.x` / Node `16.15.x`](https://github.com/electron/releases#releases)). It's recommened to install [nvm](https://github.com/nvm-sh/nvm) to run as same Node version locally as used for building ASGARDEX on CI.

```bash
git clone https://github.com/thorchain/asgardex-electron.git asgardex
cd asgardex
yarn
```

In case you get an an `ENAMETOOLONG: name too long` error or similar by running `yarn install`, e.g.

```bash
YN0001: │ Error: @storybook/react-docgen-typescript-plugin@npm:1.0.2-canary.6.9d540b91e815f8fc2f8829189deb00553559ff63.0: ENAMETOOLONG: name too long, unlink '~/.yarn/berry/cache/@storybook-react-docgen-typescript-plugin-npm-1.0.2-canary.6.9d540b91e815f8fc2f8829189deb00553559ff63.0-b31cc57c40-8.zip' -> 'asgardex-electron/.yarn/cache/@storybook-react-docgen-typescript-plugin-npm-1.0.2-canary.6.9d540b91e815f8fc2f8829189deb00553559ff63.0-b31cc57c40-91a3015d38.zip-3439e0483605ccee.tmp'
```

change cache folder as described in [Unable to install latest SB version: Error: ENAMETOOLONG: name too long, unlink... #18441](https://github.com/storybookjs/storybook/discussions/18441) to run `yarn install` as follow:

1. Check your cache dir

```bash
yarn cache dir
~/.cache/yarn/v6
```

2. Point it to another (short) folder using `YARN_CACHE_FOLDER` (see [Change the cache path for yarn](https://classic.yarnpkg.com/lang/en/docs/cli/cache/#toc-change-the-cache-path-for-yarn)), e.g.

```bash
YARN_CACHE_FOLDER=/tmp/y/ yarn install
```

## Environment variables

While environment variables are not required (defaults are set), you can configure them. Create an `.env` file by copying all content of `.env.sample` and change these for your needs.

## Development

- Build sources needed by [`main` process](https://www.electronjs.org/docs/glossary#main-process) (only once or whenever you change something in [`preload.ts`](./src/main/preload.ts) or [`electron.ts`](./src/main/electron.ts))

```bash
yarn prebuild
```

- Build everything needed by [`renderer` process](https://www.electronjs.org/docs/glossary#renderer-process) and run application in `watch` mode

```bash
yarn dev
```

In case Node might run into memory issues locally set `--max-old-space-size` as follow:

```
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Generate types and endpoints for Midgard

Whenever Midgard has been updated with a new release, run following script to auto-generate types and endpoints

```bash
generate:types:midgard
```

Generated files are based on Midgard's [swagger.json](https://midgard.thorchain.info/v2/swagger.json).

### Generate types and endpoints for THORNode

Whenever THORNode has been updated with a new release, run following script to auto-generate types and endpoints

```bash
generate:types:thornode
```

Generated files are based on `https://gitlab.com/thorchain/thornode/-/raw/release-{version}/openapi/openapi.yaml` (replace `{version}` with latest version (e.g. `0.19.5`)).

### Generate ERC20 asset white list

Whenever [THORChain ERC20 asset whitelist](https://gitlab.com/thorchain/thornode/-/blob/develop/bifrost/pkg/chainclients/ethereum/token_list.json) has been updated (usually with a [new release of THORNode](https://gitlab.com/thorchain/thornode/-/tags)), run following script to auto-generate this list for ASGARDEX

```bash
yarn generate:erc20whitelist
```

### How to auto-unlock a locked wallet while hot-reloading the app (for development only, disabled in production build)

Use `REACT_APP_WALLET_PASSWORD` to run the app by replacing `password` with your own password

```bash
REACT_APP_WALLET_PASSWORD=password yarn dev
```

Or add to `REACT_APP_WALLET_PASSWORD=password` to `.env` file and run `yarn dev`

### How to enable (more) chains for development

Add chains you want to have for development to `REACT_APP_CHAINS_ENABLED`, for example

```bash
REACT_APP_CHAINS_ENABLED=THOR,BNB,BTC,LTC,BCH,ETH,DOGE,GAIA
```

Note: String of chains have to be as same as [definitions in xchain-util](https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-util/src/chain.const.ts)

## Tests

### `unit`

```bash
yarn test
```

### `e2e`

Note: Running test-cafe is disabled (see https://github.com/thorchain/asgardex-electron/issues/750)

```bash
yarn test:e2e
```

### `lint`

```bash
yarn lint
```

Note: `eslint` is provided by `react-scripts` located in `./node_modules/react-scripts/node_modules/` and don't need to be extra installed. If your editor has some issues to find `eslint`, you might point it to this location (see [VSCode settings file](.vscode/settings.json) as an example).

## Storybook

```bash
yarn storybook
```

### bundle analyze

visualize the bundle map using `source-map-explorer`

```bash
yarn analyze
```

### Auto updates

To check locally if auto-update works correctly create `dev-app-update.yml` file at the root
directory with a content based on [dev-app-update.sample.yml](./dev-app-update.sample.yml) with providing
your GutHub personal access token. After that just play locally with version provided by `package.json`

## Folder structure

### `src`

```bash
src
├── index.ts # entry point for CRA
├── main # sources of Electron's main process
├── renderer # sources of Electron's renderer process (aka webapp)
└── shared # shared sources for Electron's main and renderer processes
```

### `src/main` (Electron's "main" app)

```bash
src/main
├── electron.ts # entry point
├── i18n # internationalization (needed for menus)
└── menu # "native" menus
```

### `src/renderer` (Electron's "renderer" app aka ReactJS webapp)

```bash
src/renderer
├── assets # static files (svg, fonts etc.)
├── components # basic components
├── contexts # React contexts to provide "global" accessible states (RxJS based)
├── helpers # helper functions
├── hooks # custom hooks
├── i18n # internationalization (translations etc.)
├── index.tsx # entry point
├── routes # routing
├── services # RxJS based IO handler and states (consumed by contexts)
├── types # TypeScript types (e.g. generated types for Midgard API)
└── views # "Container" components
```

## Security

ASGARDEX follows [security recommendation made by Electron team](https://www.electronjs.org/docs/tutorial/security), such as:

- [Disable the Node.js integration in renderers that display remote content](https://www.electronjs.org/docs/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content)
- [Enable context isolation in renderers that display remote content](https://www.electronjs.org/docs/tutorial/security#3-enable-context-isolation-for-remote-content)
- [Expose IPC-based APIs to provide one method per IPC message](https://www.electronjs.org/docs/tutorial/context-isolation#security-considerations)
- [Disable the remote module](https://www.electronjs.org/docs/tutorial/security#15-disable-the-remote-module)
- [Do not use openExternal with untrusted content](https://www.electronjs.org/docs/tutorial/security#14-do-not-use-openexternal-with-untrusted-content). Provided hostnames are defined in [`EXTERNALS_WHITELIST`](./src/main/api/url.ts), all others are blocked. This list has to be extended if needed.
- [Use a current version of Electron](https://www.electronjs.org/docs/tutorial/security#17-use-a-current-version-of-electron)

## Packaging

**Important note** for `macOS` users: Please follow guide of ["How to package `ASGARDEX` on macOS"](./PACKAGE_MACOS.md) before running following command.

```
yarn package:electron
```

## Keystores

By creating or importing a keystore wallet, ASGARDEX is adding its encrypted keystore into `wallets.json` in [Electron's `appData` folder](https://www.electronjs.org/docs/api/app#appgetpathname) at following location:

### Windows

```bash
# ASGARDEX installed from *.exe
%APPDATA%/ASGARDEX/storage/wallets.json
# ASGARDEX built and run locally
%APPDATA%/Electron/storage/wallets.json
```

### macOS

```bash
# ASGARDEX installed from *.dmg
~/Library/Application Support/ASGARDEX/storage/wallets.json
# ASGARDEX built and run locally
~/Library/Application Support/Electron/storage/wallets.json
```

### Linux

```bash
# ASGARDEX installed from *.deb
~/.config/ASGARDEX/storage/wallets.json
# ASGARDEX built and run locally
~/.config/Electron/storage/wallets.json
```

By removing a wallet in `Wallet` -> `Settings` its data will be removed from `wallets.json`. ASGARDEX will prompt a message to users to inform about saving its phrase on a save place before removing the wallet.

After removing all wallets `wallets.json` will be empty and won't include any wallet related data.

## Ledger accounts

By adding a Ledger account to a wallet, ASGARDEX saves its `address` and some extra information (`chain`, `network`, `walletIndex`, `hdMode`) into `ledgers.json` located in [Electron's `appData` folder](https://www.electronjs.org/docs/api/app#appgetpathname):

### Windows

```bash
# ASGARDEX installed from *.exe
%APPDATA%/ASGARDEX/storage/ledgers.json
# ASGARDEX built and run locally
%APPDATA%/Electron/storage/ledgers.json
```

### macOS

```bash
# ASGARDEX installed from *.dmg
~/Library/Application Support/ASGARDEX/storage/ledgers.json
# ASGARDEX built and run locally
~/Library/Application Support/Electron/storage/ledgers.json
```

### Linux

```bash
# ASGARDEX installed from *.deb
~/.config/ASGARDEX/storage/ledgers.json
# ASGARDEX built and run locally
~/.config/Electron/storage/ledgers.json
```

Whenever a Ledger has been removed in `Wallet` -> `Settings`, its data will be removed from `ledgers.json`. By removing all Ledger accounts from each wallet `ledgers.json` will be empty and won't include any Ledger related data. The same by removing all wallets.

## Git branching workflow

See [BRANCHING_WORKFLOW.md](./BRANCHING_WORKFLOW.md)

## Releasing

See [RELEASE.md](./RELEASE.md)

## Docs

See the [docs and guides here](https://docs.thorchain.org)

## Contributing

Everyone is welcome to contribute. Check [open issues](https://github.com/thorchain/asgardex-electron/issues) or create a new one to start your work with and open a PR afterwards. Newcomers might want to check issues labeled as [good first issues](https://github.com/thorchain/asgardex-electron/labels/good%20first%20issue).

## Bug Reports

Please use [bug report template](https://github.com/thorchain/asgardex-electron/issues/new?assignees=&labels=bug&template=2-Bug_report.md) to file any bugs.

## License

MIT [THORChain](https://github.com/thorchain)
