const path = require('path')

module.exports = (_ /* env */, argv) => ({
  entry: {
    preload: './src/main/preload.ts'
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
  target: 'electron-preload',
  node: {
    __dirname: false,
    __filename: false
  }
})
