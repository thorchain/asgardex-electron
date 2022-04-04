import { shell } from 'electron'

import { ApiUrl } from '../../shared/api/types'

const EXTERNALS_WHITELIST = [
  'thorchain.org',
  'thorchain.net',
  'testnet.thorchain.net',
  'docs.thorchain.org',
  'discord.gg',
  'twitter.com',
  'github.com',
  'explorer.binance.org',
  'testnet-explorer.binance.org',
  'blockstream.info',
  'dex.binance.org',
  'testnet-dex.binance.org',
  'thoryield.com',
  'app.thoryield.com',
  'etherscan.io',
  'ropsten.etherscan.io',
  'tltc.bitaps.com',
  'ltc.bitaps.com',
  'www.blockchain.com',
  'api.blockcypher.com',
  'blockchair.com',
  'blockexplorer.one',
  'testnet.thorswap.finance',
  'stagenet.thorswap.finance',
  'app.thorswap.finance',
  'viewblock.io',
  'midgard.thorchain.info',
  'testnet.midgard.thorchain.info',
  'stagenet-midgard.ninerealms.com',
  'thornode.thorchain.info',
  'testnet.thornode.thorchain.info',
  'stagenet-thornode.ninerealms.com',
  'stagenet-rpc.ninerealms.com',
  'finder.terra.money'
]

const openExternal = (target: string) => {
  try {
    const hostname = new URL(target)?.hostname ?? ''
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
