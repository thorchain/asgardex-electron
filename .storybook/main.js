const webpack = require('webpack')

module.exports = {
  core: {
    builder: 'webpack5'
  },
  staticDirs: ['../public'],
  stories: ['../src/renderer/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/preset-create-react-app'],
  framework: '@storybook/react',
  // Extending Storybook’s Webpack config
  // https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
  webpackFinal: async (webpackConfig) => {
    webpackConfig.resolve.fallback = {
      ...webpackConfig.resolve.fallback,
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      fs: require.resolve('browserify-fs')
    }

    webpackConfig.plugins = [
      ...webpackConfig.plugins,
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      })
    ]

    return webpackConfig
  }
}
