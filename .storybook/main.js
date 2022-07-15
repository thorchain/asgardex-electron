
// Main entry point for Storybook@7.x
// Based on `https://github.com/storybookjs/storybook/blob/v7.0.0-alpha.13/examples/cra-ts-essentials/.storybook/main.ts

// import type { StorybookConfig } from '@storybook/react-webpack5';


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
      })
    ]

    return webpackConfig
  }
}

module.exports = config;
