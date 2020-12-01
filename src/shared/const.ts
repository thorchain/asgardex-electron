import { envOrDefault } from '../renderer/helpers/envHelper'

export const IS_PRODUCTION = envOrDefault(process.env.NODE_ENV, '') === 'production'

export enum ExternalUrl {
  WEBSITE = 'https://thorchain.org',
  DOCS = 'https://docs.thorchain.org/',
  TELEGRAM = 'https://t.me/thorchain_org',
  GITHUB = 'https://github.com/thorchain',
  GITHUB_REPO = `https://github.com/thorchain/asgardex-electron`,
  TWITTER = 'https://twitter.com/thorchain_org'
}

export const LEDGER = {
  // Ledger now uses bip44 derivation path
  // For more details, please check - https://ledger.readthedocs.io/en/latest/background/hd_use_cases.html
  GET_BTC_MAINNET_ADDRESS: "173'/0'/0'/0/0",
  GET_BTC_TESTNET_ADDRESS: "173'/1'/0'/0/0"
}
