import url from 'url'

import { shell } from 'electron'

import { ApiUrl } from '../../shared/api/types'

const EXTERNALS_WHITELIST = [
  'thorchain.org',
  'thorchain.net',
  'testnet.thorchain.net',
  'docs.thorchain.org',
  't.me',
  'twitter.com',
  'github.com',
  'explorer.binance.org',
  'testnet-explorer.binance.org',
  'blockstream.info',
  'dex.binance.org',
  'testnet-dex.binance.org',
  'runestake.info',
  'etherscan.io',
  'ropsten.etherscan.io',
  'tltc.bitaps.com'
]

const openExternal = (target: string) => {
  try {
    const hostname = url.parse(target)?.hostname ?? ''
    if (EXTERNALS_WHITELIST.includes(hostname)) {
      return shell.openExternal(target)
    }
    return Promise.reject(`URL ${target} has been blocked by ASGARDEX`)
  } catch (e) {
    return Promise.reject(`URL ${target} could not be parsed`)
  }
}

export const apiUrl: ApiUrl = {
  openExternal
}
