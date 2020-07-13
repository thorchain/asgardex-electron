const path = require('path')

module.exports = (env, argv) => ({
  entry: './electron/electron.ts',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'electron.js'
  },
  devtool: argv.mode === 'production' ? false : 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: [/\.jsx?$/, /\.tsx?$/],
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  target: 'electron-main',
  node: {
    __dirname: false,
    __filename: false
  }
})
