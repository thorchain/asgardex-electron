const GitRevisionPlugin = require('git-revision-webpack-plugin')
const webpack = require('webpack')

const { version } = require('./package')

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Use `web` instead of 'electron-renderer'
      // to avoid "Uncaught ReferenceError: require is not defined"
      // ^ https://gist.github.com/msafi/d1b8571aa921feaaa0f893ab24bb727b
      webpackConfig.target = 'web'
      // support hot reload of hooks
      webpackConfig.resolve.alias['react-dom'] = '@hot-loader/react-dom'

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
    plugins: [
      new webpack.DefinePlugin({
        $COMMIT_HASH: JSON.stringify(new GitRevisionPlugin().commithash()),
        $VERSION: JSON.stringify(version),
        $IS_DEV: JSON.stringify(process.env.NODE_ENV !== 'production')
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
