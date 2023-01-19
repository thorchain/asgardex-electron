import { getPrefix as getBinancePrefix } from '@xchainjs/xchain-binance'
import { BNBChain } from '@xchainjs/xchain-binance'
import { getPrefix as getBitcoinPrefix } from '@xchainjs/xchain-bitcoin'
import { BTCChain } from '@xchainjs/xchain-bitcoin'
import { getPrefix as getBCHPrefix } from '@xchainjs/xchain-bitcoincash'
import { BCHChain } from '@xchainjs/xchain-bitcoincash'
import { getPrefix as getCosmosPrefix } from '@xchainjs/xchain-cosmos'
import { GAIAChain } from '@xchainjs/xchain-cosmos'
import { getPrefix as getDogePrefix } from '@xchainjs/xchain-doge'
import { DOGEChain } from '@xchainjs/xchain-doge'
import { getPrefix as getEthereumPrefix } from '@xchainjs/xchain-ethereum'
import { ETHChain } from '@xchainjs/xchain-ethereum'
import { getPrefix as getLitecoinPrefix } from '@xchainjs/xchain-litecoin'
import { LTCChain } from '@xchainjs/xchain-litecoin'
import { getPrefix as getThorchainPrefix } from '@xchainjs/xchain-thorchain'
import { THORChain } from '@xchainjs/xchain-thorchain'
import { Address, Chain } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../shared/api/types'
import { isEnabledChain } from '../../shared/utils/chain'
import { toClientNetwork } from '../../shared/utils/client'
import { LedgerAddresses } from '../services/wallet/types'
import { eqChain } from './fp/eq'

export const truncateAddress = (addr: Address, chain: Chain, network: Network): string => {
  const first = addr.substring(0, Math.max(getAddressPrefixLength(chain, network) + 3, 6))
  const last = addr.substring(addr.length - 3, addr.length)
  return `${first}...${last}`
}

export const getAddressPrefixLength = (chain: Chain, network: Network): number => {
  const clientNetwork = toClientNetwork(network)
  if (!isEnabledChain(chain)) throw Error(`${chain} is not supported for 'getAddressPrefixLength'`)

  switch (chain) {
    case BNBChain:
      return getBinancePrefix(clientNetwork).length
    case BTCChain:
      return getBitcoinPrefix(clientNetwork).length
    case GAIAChain:
      return getCosmosPrefix().length
    case ETHChain:
      return getEthereumPrefix().length
    case DOGEChain:
      return getDogePrefix(clientNetwork).length
    case THORChain:
      return getThorchainPrefix(clientNetwork).length
    case LTCChain:
      return getLitecoinPrefix(clientNetwork).length
    case BCHChain:
      return getBCHPrefix().length
  }
}

/**
 * Removes a prefix from an address, if the prefix ends with ':'
 * (currently needed for BCH only)
 */
export const removeAddressPrefix = (address: Address): Address => {
  const prefixIndex = address.indexOf(':') + 1
  return address.substring(prefixIndex > 0 ? prefixIndex : 0)
}

/**
 * Helper to get ETH address as a checksum address
 * toLowerCase() is needed to handle the ERC20 addresses start with 0X as well, not only 0x
 * ethers getAddress function recognize 0X address as invalid one
 */
export const getEthChecksumAddress = (address: Address): O.Option<Address> =>
  O.tryCatch(() => ethers.utils.getAddress(address.toLowerCase()))

export const hasLedgerAddress = (addresses: LedgerAddresses, chain: Chain): boolean =>
  FP.pipe(
    addresses,
    A.findFirst(({ chain: ledgerChain }) => eqChain.equals(chain, ledgerChain)),
    O.map((_) => true),
    O.getOrElse(() => false)
  )
