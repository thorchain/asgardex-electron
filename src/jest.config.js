const { createJestConfig } = require('@craco/craco')

// Use jest config created by `craco`
// https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#createjestconfig
const cracoConfig = require('./craco.config.js')
const jestConfig = createJestConfig(cracoConfig)

module.exports = jestConfig
