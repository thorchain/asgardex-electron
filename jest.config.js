module.exports = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
      useESM: true
    },
    $COMMIT_HASH: true,
    $IS_DEV: true,
    import: {
      meta: { env: { DEV: true, REACT_APP_DEFAULT_NETWORK: 'testnet' } }
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTest.ts'],
  roots: ['<rootDir>/src/renderer', '<rootDir>/src/shared'],
  // transform: {
  //   '^.+\\.tsx$': 'ts-jest',
  //   '^.+\\.ts$': 'ts-jest'
  // },
  testRegex: '(./.*.(test|spec)).(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // collectCoverage: true,
  // collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
  // coverageDirectory: '<rootDir>/coverage/',
  coveragePathIgnorePatterns: ['(tests/.*.mock).(jsx?|tsx?)$', '(.*).d.ts$'],
  moduleNameMapper: {
    // '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2|svg)$': 'identity-obj-proxy',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  verbose: true,
  testTimeout: 10000
}

// // jest.config.js
// // const { pathsToModuleNameMapper } = require('ts-jest')

// // // In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// // // which contains the path mapping (ie the `compilerOptions.paths` option):
// // const { compilerOptions } = require('./tsconfig.jest.json')

// // console.log(
// //   'xxxx',
// //   pathsToModuleNameMapper(compilerOptions.paths, {
// //     prefix: '<rootDir>/'
// //   })
// // )

// module.exports = {
//   globals: {
//     'ts-jest': {
//       tsconfig: 'tsconfig.test.json'
//     }
//   },
//   // A list of paths to directories that Jest should use to search for files in
//   // https://jestjs.io/docs/configuration#roots-arraystring
//   roots: ['<rootDir>/src/'],

//   // The test environment that will be used for testing, jsdom for browser environment
//   // https://jestjs.io/docs/configuration#testenvironment-string
//   testEnvironment: 'jsdom',

//   // Jest transformations
//   // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
//   transform: {
//     '^.+\\.tsx?$': 'ts-jest' // Transform TypeScript files using ts-jest
//   },

//   // A list of paths to modules that run some code to configure or set up the testing framework before each test file in the suite is executed
//   // https://jestjs.io/docs/configuration#setupfilesafterenv-array
//   setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

//   // Code coverage config
//   // https://jestjs.io/docs/configuration#collectcoveragefrom-array
//   // coverageDirectory: '<rootDir>/coverage/',
//   // collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}', '!**/__mocks__/**', '!**/node_modules/**', '!**/*.d.ts'],

//   // Important: order matters, specific rules should be defined first
//   // https://jestjs.io/fr/docs/configuration#modulenamemapper-objectstring-string--arraystring
//   moduleNameMapper: {
//     // ...pathsToModuleNameMapper(compilerOptions.paths, {
//     //   prefix: '<rootDir>/'
//     // }),
//     // Handle CSS imports (with CSS modules)
//     // https://jestjs.io/docs/webpack#mocking-css-modules
//     '^.+\\.module\\.(css|sass|scss|less)$': 'identity-obj-proxy',

//     // Handle CSS imports (without CSS modules)
//     '^.+\\.(css|sass|scss|less)$': '<rootDir>/__mocks__/styleMock.js',

//     // Handle static assets
//     // https://jestjs.io/docs/webpack#handling-static-assets
//     '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg|ttf|woff|woff2)$': `<rootDir>/__mocks__/fileMock.js`,

//     // Handle TypeScript path aliases
//     '^@/(.*)$': '<rootDir>/src/$1'
//   },

//   verbose: true,
//   testTimeout: 30000
// }
