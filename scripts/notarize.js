require('dotenv').config()
const { notarize } = require('electron-notarize')

/*
 Pre-requisites: https://github.com/electron/electron-notarize#prerequisites
    1. Generate an app specific password
    2. Provide SIGNING_APPLE_ID, SIGNING_APP_PASSWORD, SIGNING_TEAM_ID as env's
*/

/*
  Notarizing: https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/
*/

const isEmpty = (v) => !v || v.length === 0

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    console.log(`No need to notarize app on ${electronPlatformName}`)
    return
  }

  console.log('Notarizing mac application')

  const appName = context.packager.appInfo.productFilename
  const { SIGNING_APPLE_ID, SIGNING_APP_PASSWORD, SIGNING_TEAM_ID } = process.env

  if (isEmpty(SIGNING_APPLE_ID) || isEmpty(SIGNING_APP_PASSWORD)) {
    console.log('SIGNING_APPLE_ID or SIGNING_APP_PASSWORD not set. Terminating noratization.')
    return
  }

  // https://github.com/electron/electron-notarize#example-usage
  const options = {
    appBundleId: 'org.thorchain.asgardex',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: SIGNING_APPLE_ID,
    appleIdPassword: SIGNING_APP_PASSWORD
  }
  if (!isEmpty(SIGNING_TEAM_ID)) options.ascProvider = SIGNING_TEAM_ID

  console.log(`appPath`, options.appPath)

  return notarize(options)
}
