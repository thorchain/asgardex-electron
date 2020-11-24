// Override `sr25519.js` of `cosmos-client` to run it in web
// see https://www.npmjs.com/package/cosmos-client#to-use-in-web

const fs = require('fs')
const path = require('path')

const FILE_LIB_PATH = path.resolve(__dirname, '../node_modules/sr25519/sr25519.js')
const FILE_FIX_PATH = path.resolve(__dirname, '../patch/sr25519.js')

if (fs.existsSync(FILE_LIB_PATH)) {
  fs.unlinkSync(FILE_LIB_PATH)
  fs.copyFileSync(FILE_FIX_PATH, FILE_LIB_PATH)
}
