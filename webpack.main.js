const path = require('path')

module.exports = (env, argv) => ({
  entry: {
    // preload: './src/main/preload.ts',
    electron: './src/main/electron.ts'
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js'
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
        options: { configFile: path.resolve(__dirname, 'tsconfig.main.json') },
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
