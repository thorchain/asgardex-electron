const { GitRevisionPlugin } = require('git-revision-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

const { version } = require('./package')

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Use `web` instead of 'electron-renderer'
      // to avoid "Uncaught ReferenceError: require is not defined"
      // ^ https://gist.github.com/msafi/d1b8571aa921feaaa0f893ab24bb727b
      webpackConfig.target = 'web'

      // Turn off `mangle` is needed to fix "Expected property "1" of type BigInteger, got n" issue while sending BCH txs
      // One solution is disabling `mangle` for some `reserved` identifiers
      // as described in https://github.com/bitcoinjs/bitcoinjs-lib/issues/959#issuecomment-351040758
      // In our case (and to simplify things) we just disable ALL sources by setting `mangle` to `false
      // Very similar to https://github.com/ObsidianLabs/Black-IDE/blob/52a09abc63b49c6407e49e3acc100653c5ee5ca0/config-overrides.js#L28-L40
      webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.map((minimizer) => {
        if (minimizer instanceof TerserPlugin) {
          minimizer.options.mangle = false
        }
        return minimizer
      })

      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        fs: require.resolve('browserify-fs'),
        assert: require.resolve('assert')
      }

      webpackConfig.ignoreWarnings = [/Failed to parse source map/]

      webpackConfig.module.rules = [
        ...webpackConfig.module.rules,
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
          issuer: /\.(js|ts)x?$/
        }
      ]

      return webpackConfig
    },
    plugins: [
      new webpack.DefinePlugin({
        $COMMIT_HASH: JSON.stringify(new GitRevisionPlugin().commithash()),
        $VERSION: JSON.stringify(version),
        $IS_DEV: JSON.stringify(process.env.NODE_ENV !== 'production')
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      })
    ]
  },
  jest: {
    configure: {
      preset: 'ts-jest',
      globals: {
        $COMMIT_HASH: true,
        $IS_DEV: true
      }
    }
  },
  // Some overrides to fix
  // `craco:  *** Cannot find ESLint loader (eslint-loader). ***`
  // by using latest CRA 4
  // @see https://github.com/gsoft-inc/craco/issues/205#issuecomment-716631300
  plugins: [
    {
      plugin: {
        overrideCracoConfig: ({ cracoConfig }) => {
          if (typeof cracoConfig.eslint.enable !== 'undefined') {
            cracoConfig.disableEslint = !cracoConfig.eslint.enable
          }
          delete cracoConfig.eslint
          return cracoConfig
        },
        overrideWebpackConfig: ({ webpackConfig, cracoConfig }) => {
          if (typeof cracoConfig.disableEslint !== 'undefined' && cracoConfig.disableEslint === true) {
            webpackConfig.plugins = webpackConfig.plugins.filter(
              (instance) => instance.constructor.name !== 'ESLintWebpackPlugin'
            )
          }
          return webpackConfig
        }
      }
    }
  ]
}
