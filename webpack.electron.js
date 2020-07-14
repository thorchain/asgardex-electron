const path = require('path')

module.exports = (env, argv) => ({
  entry: './electron/electron.ts',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'electron.js'
  },
  devtool: argv.mode === 'production' ? false : 'source-map',
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: [/\.tsx?$/],
        loader: 'ts-loader',
        options: { configFile: path.resolve(__dirname, 'electron', 'tsconfig.json') },
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
