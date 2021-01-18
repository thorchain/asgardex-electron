module.exports = {
  stories: ['../src/renderer/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-actions',
    '@storybook/addon-controls',
    '@storybook/addon-links',
    '@storybook/addon-viewport',
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
  }
}
