const { createJestConfig } = require('@craco/craco')

// Use jest config created by `craco`
// https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#jest-api
const cracoConfig = require('./craco.config.js')

let jestConfig = createJestConfig(cracoConfig)
// Add `crypto` to avoid  "Crypto module not found" errors after adding `terra.js`
jestConfig = { ...jestConfig, globals: { ...jestConfig.globals, crypto: require('crypto') } }

// console.log('jestConfig:', JSON.stringify(jestConfig, null, 2))

module.exports = jestConfig
