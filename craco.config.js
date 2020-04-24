module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // support electron
      webpackConfig.target = 'electron-renderer'
      // support hot reload of hooks
      webpackConfig.resolve.alias['react-dom'] = '@hot-loader/react-dom'
      return webpackConfig
    }
  }
}
