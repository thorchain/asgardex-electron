import { LedgerMessages } from '../types'

const ledger: LedgerMessages = {
  'ledger.title': 'Ledger',
  'ledger.title.sign': 'Signing with Ledger',
  'ledger.needsconnected': 'Make sure your Ledger device is connected and the "{chain}" application is up and running.',
  'ledger.add.device': 'Add ledger',
  'ledger.error.nodevice': 'No device connected',
  'ledger.error.inuse': 'Ledger is already in use for another app',
  'ledger.error.appnotopened': 'Ledger app is not opened',
  'ledger.error.noapp': 'No Ledger app opened. Please open appropriate app on Ledger.',
  'ledger.error.getaddressfailed': 'Getting address from Ledger failed',
  'ledger.error.signfailed': 'Signing transaction by Ledger failed',
  'ledger.error.sendfailed': 'Sending transaction by Ledger failed',
  'ledger.error.depositfailed': 'Sending deposit transaction by Ledger failed',
  'ledger.error.invalidpubkey': 'Invalid public key for using Ledger.',
  'ledger.error.invaliddata': 'Invalid data.',
  'ledger.error.invalidresponse': 'Invalid response after sending transaction using Ledger.',
  'ledger.error.rejected': 'Action on Ledger was rejected.',
  'ledger.error.timeout': 'Timeout to handle action on Ledger.',
  'ledger.error.notimplemented': 'Action has not been implemented for Ledger.',
  'ledger.error.denied': 'Usage of Ledger has been denied',
  'ledger.error.unknown': 'Unknown Error',
  'ledger.notsupported': 'No Ledger support for {chain}.',
  'ledger.notaddedorzerobalances': 'Ledger {chain} has not been connected or has zero balances.',
  'ledger.deposit.oneside': 'Currently Ledger is supported for one asset side only.',
  'ledger.legacyformat.note': 'Ledger displays all output addresses in "legacy", but not in "CashAddr" format.',
  'ledger.legacyformat.show': 'Show addresses',
  'ledger.legacyformat.hide': 'Hide addresses'
}

export default ledger
