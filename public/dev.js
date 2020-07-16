/**
 * Copied from https://github.com/jamaljsr/polar/blob/f77a0e5da26c97b4852260481549c40d3a58b185/public/dev.js
 *
 * this is the entrypoint for electron when developing locally. Using ts-node
 * allows us to write all of the electron main process code in typescript
 * and compile on the fly. The alternative approach is to run tsc to save
 * the compiled js code to disk, but this slows down the live reloading
 * done by nodemon.
 */

// import tsconfig
const config = require("../tsconfig.main.json");
// register the typescript compiler
require("ts-node").register(config);
// import the main process typescript code
require("../src/main/electron");
