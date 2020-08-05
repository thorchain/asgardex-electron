const GitRevisionPlugin = require('git-revision-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // support electron
      webpackConfig.target = 'electron-renderer'
      // support hot reload of hooks
      webpackConfig.resolve.alias['react-dom'] = '@hot-loader/react-dom'
      return webpackConfig
    },
    plugins: [
      new webpack.DefinePlugin({
        $COMMIT_HASH: JSON.stringify(new GitRevisionPlugin().commithash()),
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
  }
}
