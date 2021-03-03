import { getPrefix as getBinancePrefix } from '@xchainjs/xchain-binance'
import { getPrefix as getBitcoinPrefix } from '@xchainjs/xchain-bitcoin'
import { getPrefix as getBCHPrefix } from '@xchainjs/xchain-bitcoincash'
import * as Client from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-client'
import { getPrefix as getCosmosPrefix } from '@xchainjs/xchain-cosmos'
import { getPrefix as getEthereumPrefix } from '@xchainjs/xchain-ethereum'
import { getPrefix as getLitecoinPrefix } from '@xchainjs/xchain-litecoin'
import { getPrefix as getPolkadotPrefix } from '@xchainjs/xchain-polkadot'
import { getPrefix as getThorchainPrefix } from '@xchainjs/xchain-thorchain'
import {
  Chain,
  BNBChain,
  BTCChain,
  CosmosChain,
  ETHChain,
  PolkadotChain,
  THORChain,
  LTCChain,
  BCHChain
} from '@xchainjs/xchain-util'

import { Network } from '../../shared/api/types'

export const truncateAddress = (addr: Address, chain: Chain, network: Network): string => {
  const first = addr.substr(0, Math.max(getAddressPrefixLength(chain, network) + 3, 6))
  const last = addr.substr(addr.length - 3, 3)
  return `${first}...${last}`
}

export const getAddressPrefixLength = (chain: Chain, network: string): number => {
  // TODO (@asgdx-team) Extract it into a helper - we might need it at other places, too
  const clientNetwork: Client.Network = network === 'testnet' ? 'testnet' : 'mainnet'
  switch (chain) {
    case BNBChain:
      return getBinancePrefix(network).length
    case BTCChain:
      return getBitcoinPrefix(clientNetwork).length
    case CosmosChain:
      return getCosmosPrefix().length
    case ETHChain:
      return getEthereumPrefix().length
    case PolkadotChain:
      return getPolkadotPrefix(network).length
    case THORChain:
      return getThorchainPrefix(network).length
    case LTCChain:
      return getLitecoinPrefix(clientNetwork).length
    case BCHChain:
      return getBCHPrefix(network).length
  }
}

export const removeAddressPrefix = (address: Address): Address => {
  const prefixIndex = address.indexOf(':') + 1
  return address.substr(prefixIndex > 0 ? prefixIndex : 0)
}
