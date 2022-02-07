import TransportNodeHidSingleton from '@ledgerhq/hw-transport-node-hid-singleton'
import { BNBChain, BTCChain, THORChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { IPCLedgerAdddressParams, LedgerError, LedgerErrorId } from '../../../shared/api/types'
import { isError } from '../../../shared/utils/guard'
import { WalletAddress } from '../../../shared/wallet/types'
import { getAddress as getBNBAddress, verifyAddress as verifyBNBAddress } from './binance/address'
import { getAddress as getBTCAddress, verifyAddress as verifyBTCAddress } from './bitcoin/address'
import { getAddress as getTHORAddress, verifyAddress as verifyTHORAddress } from './thorchain/address'

export const getAddress = async ({
  chain,
  network,
  walletIndex
}: IPCLedgerAdddressParams): Promise<E.Either<LedgerError, WalletAddress>> => {
  try {
    let res: E.Either<LedgerError, WalletAddress>
    const transport = await TransportNodeHidSingleton.open()
    switch (chain) {
      case THORChain:
        res = await getTHORAddress(transport, network, walletIndex)
        break
      case BNBChain:
        res = await getBNBAddress(transport, network, walletIndex)
        break
      case BTCChain:
        res = await getBTCAddress(transport, network, walletIndex)
        break
      default:
        res = E.left({
          errorId: LedgerErrorId.NOT_IMPLEMENTED,
          msg: `getAddress for ${chain} has not been implemented`
        })
    }
    await transport.close()
    return res
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.GET_ADDRESS_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}

export const verifyLedgerAddress = async ({ chain, network, walletIndex }: IPCLedgerAdddressParams) => {
  const transport = await TransportNodeHidSingleton.open()
  switch (chain) {
    case THORChain:
      verifyTHORAddress(transport, network, walletIndex)
      break
    case BNBChain:
      verifyBNBAddress(transport, network, walletIndex)
      break
    case BTCChain:
      verifyBTCAddress(transport, network, walletIndex)
      break
  }
  await transport.close()
}
