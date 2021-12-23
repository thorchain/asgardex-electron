const path = require('path')

const nodeExternals = require('webpack-node-externals')

const common = (_ /* env */, argv) => ({
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js'
  },
  devtool: argv.mode === 'production' ? false : 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser')
    }
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
  node: {
    __dirname: false,
    __filename: false
  }
  // Add `node-hid` to externals dure build issues - see https://github.com/thorchain/asgardex-electron/pull/881
  // https://webpack.js.org/configuration/externals/#root
  // Note: ^ Disabled temporary due sign issues on macOS
  // externals: {
  //   'node-hid': 'commonjs node-hid',
  //   usb: 'commonjs usb'
  // }
})

const main = (env, arg) => {
  console.log('Run `main` build ...')
  return Object.assign({}, common(env, arg), {
    entry: {
      electron: './src/main/electron.ts'
    },
    target: 'electron-main',
    externals: [nodeExternals()]
  })
}

const preload = (env, arg) => {
  console.log('Run `preload` build ...')
  return Object.assign({}, common(env, arg), {
    entry: {
      preload: './src/main/preload.ts'
    },
    target: 'electron-preload'
  })
}

module.exports = [main, preload]
