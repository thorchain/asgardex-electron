
// Main entry point for Storybook@7.x
// Based on `https://github.com/storybookjs/storybook/blob/v7.0.0-alpha.13/examples/cra-ts-essentials/.storybook/main.ts

const { GitRevisionPlugin } = require('git-revision-webpack-plugin')

const { version } = require('../package')

const webpack = require('webpack')

const config = {
  features: {
    buildStoriesJson: true,
    breakingChangesV7: true,
  },
  core: {
    builder: '@storybook/builder-webpack5',
    channelOptions: { allowFunction: false, maxDepth: 10 },
    disableTelemetry: true,
  },
  staticDirs: ['../public'],
  stories: ['../src/renderer/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/preset-create-react-app',
    {
      name: '@storybook/addon-essentials',
      options: {
        viewport: false,
      },
    },
  ],
  framework: '@storybook/react-webpack5',
  // Extending Storybook’s Webpack config
  // https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
  webpackFinal: async (webpackConfig) => {
    webpackConfig.resolve.fallback = {
      ...webpackConfig.resolve.fallback,
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      fs: require.resolve('browserify-fs'),
      assert: require.resolve('assert')
    }

    webpackConfig.plugins = [
      ...webpackConfig.plugins,
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      }),
      new webpack.DefinePlugin({
        $COMMIT_HASH: JSON.stringify(new GitRevisionPlugin().commithash()),
        $VERSION: JSON.stringify(version),
        $IS_DEV: JSON.stringify(process.env.NODE_ENV !== 'production')
      })
    ]

    return webpackConfig
  }
}

module.exports = config;
