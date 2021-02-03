import { getPrefix as getBinancePrefix } from '@xchainjs/xchain-binance'
import { getPrefix as getBitcoinPrefix } from '@xchainjs/xchain-bitcoin'
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

export const truncateAddress = (addr: string, chain: Chain, network: string): string => {
  const first = addr.substr(0, Math.max(getAddressPrefixLength(chain, network) + 3, 6))
  const last = addr.substr(addr.length - 3, 3)
  return `${first}...${last}`
}

export const getAddressPrefixLength = (chain: Chain, network: string): number => {
  switch (chain) {
    case BNBChain:
      return getBinancePrefix(network).length
    case BTCChain:
      return getBitcoinPrefix(network).length
    case CosmosChain:
      return getCosmosPrefix().length
    case ETHChain:
      return getEthereumPrefix().length
    case PolkadotChain:
      return getPolkadotPrefix(network).length
    case THORChain:
      return getThorchainPrefix(network).length
    case LTCChain: {
      return getLitecoinPrefix(network).length
    }
    // TODO @asgdx-team support when https://github.com/thorchain/asgardex-electron/issues/821 in work
    case BCHChain: {
      return 0
    }
  }
}
