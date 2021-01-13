import { BNBChain, CosmosChain, THORChain } from '@xchainjs/xchain-util'

export const truncateAddress = (addr: string, chain: string, network: string): string => {
  const first = addr.substr(0, getAddressPrefixLength(chain, network) + 3)
  const last = addr.substr(addr.length - 3, 3)
  return `${first}...${last}`
}

export const getAddressPrefixLength = (chain: string, network: string): number => {
  switch (chain) {
    case BNBChain:
      return network === 'testnet' ? 4 : 3
    case THORChain:
      return network === 'testnet' ? 5 : 4
    case CosmosChain:
      return 6
    default:
      return 3
  }
}
