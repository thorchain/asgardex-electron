module.exports = {
  stories: ['../src/renderer/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-actions',
    '@storybook/addon-knobs',
    '@react-theming/storybook-addon/register'
  ],
  webpackFinal: async (webpackConfig) => {
    /**
     * CRA doesn't support .mjs files
     * some of packages are provided as .mjs files (e.g. @polkadot/api)
     * @see similar issue https://github.com/formatjs/formatjs/issues/1395#issuecomment-518823361
     */
    webpackConfig.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto'
    })

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
