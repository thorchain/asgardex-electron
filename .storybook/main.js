const tsconfigPaths = require('vite-tsconfig-paths').default
const { builtinModules } = require('module')

const path = require('path')

module.exports = {
  core: {
    builder: 'storybook-builder-vite'
  },
  async viteFinal(config, { configType }) {
    // Config patches copied from https://github.com/postanu/ui/blob/main/.storybook/main.js
		// https://github.com/eirslett/storybook-builder-vite/pull/92
		// https://github.com/eirslett/storybook-builder-vite/issues/55
		config.root = path.dirname(require.resolve('storybook-builder-vite'))
		if (config.server) {
			config.server.fsServe = undefined
		}

		// https://github.com/eirslett/storybook-builder-vite/issues/50
		config.resolve.dedupe = ['@storybook/client-api']

    config.envPrefix = 'REACT_APP'
    // config.root = join(__dirname, '../src/renderer')
    config.plugins = [...config.plugins, tsconfigPaths({ projects: ['../../src/renderer/tsconfig.json'] })]
    // config.base = './'
    config.build = {
      ...config.build,
      rollupOptions: { external: [...builtinModules] }
    }
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        // '@': path.join(__dirname, './src/renderer'),
        stream: 'stream-browserify',
        crypto: 'crypto-browserify',
        os: 'os-browserify/browser'
      }
    }
    // config.define = { ...config.define, $COMMIT_HASH: 'commitabc1234', $VERSION: '0.01' }
    // return the customized config
    return config
  },
  framework: '@storybook/react',
  // stories: ['../src/renderer/**/*.stories.@(ts|tsx)'],
  stories: ['../src/renderer/**/*.stories.v.@(ts|tsx)'],
  addons: [
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-actions',
    '@storybook/addon-knobs',
    '@react-theming/storybook-addon/register'
  ],
  webpackFinal: async (webpackConfig) => {
    // Support for `import.meta`
    // https://github.com/eirslett/storybook-builder-vite/issues/120#issuecomment-949410720
    webpackConfig.module.rules.push({
      test: /\.js$/,
      loader: require.resolve('@open-wc/webpack-import-meta-loader')
    })

    return webpackConfig
  },
  /** Use `react-docgen` temporary as a workaround to fix
   * ```
   * 70% sealing React Docgen Typescript Plugin/home/jk/Wrk/thorchain/repos/asgardex-electron/node_modules/react-docgen-typescript/lib/parser.js:442
   *          var trimmedText = (tag.text || '').trim();
   * ```
   * @see https://github.com/styleguidist/react-docgen-typescript/issues/356#issuecomment-850400428
   */
  typescript: {
    reactDocgen: 'react-docgen'
  }
}
