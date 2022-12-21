import { shell } from 'electron'

const EXTERNALS_WHITELIST = [
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
  'testnet.midgard.thorchain.info',
  'stagenet-midgard.ninerealms.com',
  'testnet-rpc.ninerealms.com',
  'stagenet-rpc.ninerealms.com',
  'rpc.ninerealms.com',
  'testnet.thornode.thorchain.info',
  'stagenet-thornode.ninerealms.com',
  'stagenet-rpc.ninerealms.com',
  'cosmos.bigdipper.live',
  'explorer.theta-testnet.polypore.xyz'
]

export const openExternal = (target: string) => {
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
