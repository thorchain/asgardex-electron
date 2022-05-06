module.exports = {
  staticDirs: ['../public'],
  stories: ['../src/renderer/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-actions',
    '@storybook/addon-knobs',
    '@react-theming/storybook-addon/register'
  ],
  framework: "@storybook/react",
  webpackFinal: async (webpackConfig) => {
    /**
     * CRA doesn't support .mjs files
     * some of packages are provided as .mjs files (e.g. @polkadot/api)
     * @see similar issue https://github.com/formatjs/formatjs/issues/1395#issuecomment-518823361
     */
    webpackConfig.module.rules.push(
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      /**
       *  Use `babel-loader` for cosmos-client
       * @see https://webpack.js.org/loaders/babel-loader/#options
       * Based on"Module parse failed: Unexpected token You may need an appropriate loader to handle this file type. #607 "
       * @see https://github.com/Akryum/floating-vue/issues/607#issuecomment-1070787029
       *
       * Background: It's needed to avoid following error:
       * ERROR in ./node_modules/@cosmos-client/core/dist/esm/index.js 1:9
       * ```bash
       *  Module parse failed: Unexpected token (1:9)
       *  You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
       *  export * as cosmosclient from './module';
       *  export * as proto from './proto';
       *  export * from './rest';
       * ```
       */

      {
        test: /@?(cosmos-client).*\.js/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    )

    return webpackConfig
  },
  /** Use `react-docgen` temporary as a workaround to fix
   * ```
   * 70% sealing React Docgen Typescript Plugin/home/jk/Wrk/thorchain/repos/asgardex-electron/node_modules/react-docgen-typescript/lib/parser.js:442
   *          var trimmedText = (tag.text || '').trim();
   * ```
   * @see https://github.com/styleguidist/react-docgen-typescript/issues/356#issuecomment-850400428
   */
  typescript: {
    reactDocgen: 'react-docgen'
  }
}
