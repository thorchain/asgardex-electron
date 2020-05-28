<div align="center">
  <img src="internals/img/asgardex-banner.png" width="100%" />
  <br/>
  <br/>
  <img src="internals/img/asgardex-splash.png" width="100%" />
</div>

![Test](https://github.com/thorchain/asgardex-electron/workflows/Test/badge.svg)
![Electron build](https://github.com/thorchain/asgardex-electron/workflows/Electron%20build/badge.svg)

## ASGARDEX uses following libraries, frameworks and more:

_(in alphabetical order)_

- [Ant Design](https://github.com/ant-design/ant-design/)
- [Create React App](https://github.com/facebook/create-react-app)
- [ESLint](https://github.com/eslint/eslint)
- [Electron](https://github.com/electron/electron/)
- [Jest](https://github.com/facebook/jest)
- [Observable Hooks](https://observable-hooks.js.org/)
- [Prettier](https://github.com/prettier/prettier)
- [ReactJS](https://github.com/facebook/react/)
- [Styled Components](https://styled-components.com/)
- [Testcafe](https://github.com/DevExpress/testcafe)
- [THORChain Byzantine Module](https://gitlab.com/thorchain/byzantine-module/)
- [RxJS](https://rxjs.dev/)
- [Typescript](https://github.com/microsoft/TypeScript)
- and others ...

## Install

```bash
git clone https://github.com/thorchain/asgardex.git asgardex
cd asgardex
yarn
```

## Environment variables

While environment variables are not required (defaults are set), you can configure them. Create an `.env` file by copying all content of `.env.sample` and change these for your needs.

## Development

```bash
yarn dev
```

## Test

```bash
yarn test
```

## Packaging

**Important note** for `macOS` users: Please follow guide of ["How to package `ASGARDEX` on macOS"](./PACKAGE_MACOS.md) before running following command.

```
yarn package:electron
```

## Releasing

See [RELEASE.md](./REALEASE.md)

## Docs

See the [docs and guides here](https://docs.thorchain.org)

## Contributing

Please see the Contributing Guidelines here (_coming soon_).

## Bug Reports

Please see the Bug Report Process here (_coming soon_).

## License

MIT [THORChain](https://github.com/thorchain)
