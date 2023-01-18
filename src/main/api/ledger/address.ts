import TransportNodeHidSingleton from '@ledgerhq/hw-transport-node-hid-singleton'
import * as E from 'fp-ts/Either'

import { IPCLedgerAdddressParams, LedgerError, LedgerErrorId } from '../../../shared/api/types'
import {
  BCHChain,
  BNBChain,
  BTCChain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  THORChain
} from '../../../shared/utils/chain'
import { isError, isEthHDMode } from '../../../shared/utils/guard'
import { WalletAddress } from '../../../shared/wallet/types'
import { getAddress as getBNBAddress, verifyAddress as verifyBNBAddress } from './binance/address'
import { getAddress as getBTCAddress, verifyAddress as verifyBTCAddress } from './bitcoin/address'
import { getAddress as getBCHAddress, verifyAddress as verifyBCHAddress } from './bitcoincash/address'
import { getAddress as getCOSMOSAddress, verifyAddress as verifyCOSMOSAddress } from './cosmos/address'
import { getAddress as getDOGEAddress, verifyAddress as verifyDOGEAddress } from './doge/address'
import { getAddress as getETHAddress, verifyAddress as verifyETHAddress } from './ethereum/address'
import { getAddress as getLTCAddress, verifyAddress as verifyLTCAddress } from './litecoin/address'
import { getAddress as getTHORAddress, verifyAddress as verifyTHORAddress } from './thorchain/address'

export const getAddress = async ({
  chain,
  network,
  walletIndex,
  hdMode
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
      case LTCChain:
        res = await getLTCAddress(transport, network, walletIndex)
        break
      case BCHChain:
        res = await getBCHAddress(transport, network, walletIndex)
        break
      case DOGEChain:
        res = await getDOGEAddress(transport, network, walletIndex)
        break
      case ETHChain: {
        if (!isEthHDMode(hdMode)) {
          res = E.left({
            errorId: LedgerErrorId.INVALID_ETH_DERIVATION_MODE,
            msg: `Invaid 'EthHDMode' - needed for ETH to get Ledger address`
          })
        } else {
          res = await getETHAddress({ transport, walletIndex, ethHdMode: hdMode })
        }
        break
      }
      case CosmosChain:
        res = await getCOSMOSAddress(transport, walletIndex)
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

export const verifyLedgerAddress = async ({ chain, network, walletIndex, hdMode }: IPCLedgerAdddressParams) => {
  const transport = await TransportNodeHidSingleton.open()
  let result = false
  switch (chain) {
    case THORChain:
      result = await verifyTHORAddress({ transport, network, walletIndex })
      break
    case BNBChain:
      result = await verifyBNBAddress({ transport, network, walletIndex })
      break
    case BTCChain:
      result = await verifyBTCAddress({ transport, network, walletIndex })
      break
    case LTCChain:
      result = await verifyLTCAddress({ transport, network, walletIndex })
      break
    case BCHChain:
      result = await verifyBCHAddress({ transport, network, walletIndex })
      break
    case DOGEChain:
      result = await verifyDOGEAddress({ transport, network, walletIndex })
      break
    case ETHChain: {
      if (!isEthHDMode(hdMode)) throw Error(`Invaid 'EthHDMode' - needed for ETH to verify Ledger address`)
      result = await verifyETHAddress({ transport, walletIndex, ethHdMode: hdMode })
      break
    }
    case CosmosChain:
      result = await verifyCOSMOSAddress(transport, walletIndex)
      break
    default:
      throw Error(`verifyAddress for ${chain} has not been implemented`)
  }
  await transport.close()

  return result
}
