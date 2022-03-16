import AppBTC from '@ledgerhq/hw-app-btc'
import type Transport from '@ledgerhq/hw-transport'
import { BCHChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { WalletAddress } from '../../../../shared/wallet/types'
import { VerifyAddressHandler } from '../types'
import { getDerivationPath } from './common'

export const getAddress = async (
  transport: Transport,
  network: Network,
  walletIndex: number
): Promise<E.Either<LedgerError, WalletAddress>> => {
  try {
    const app = new AppBTC(transport)
    const clientNetwork = toClientNetwork(network)
    const derivePath = getDerivationPath(walletIndex, clientNetwork)
    const { bitcoinAddress: bchAddress } = await app.getWalletPublicKey(derivePath, {
      // 'cashaddr' in case of Bitcoin Cash
      // @see https://github.com/LedgerHQ/ledgerjs/blob/master/packages/hw-app-btc/README.md#parameters-2
      format: 'cashaddr'
    })
    return E.right({ address: bchAddress, chain: BCHChain, type: 'ledger', walletIndex })
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.GET_ADDRESS_FAILED,
      msg: `Could not get address from Ledger's BCH app: ${
        isError(error) ? error?.message ?? error.toString() : `${error}`
      }`
    })
  }
}
export const verifyAddress: VerifyAddressHandler = async ({ transport, network, walletIndex }) => {
  const app = new AppBTC(transport)
  const clientNetwork = toClientNetwork(network)
  const derivePath = getDerivationPath(walletIndex, clientNetwork)
  const _ = await app.getWalletPublicKey(derivePath, {
    // 'cashaddr' in case of Bitcoin Cash
    // @see https://github.com/LedgerHQ/ledgerjs/blob/master/packages/hw-app-btc/README.md#parameters-2
    format: 'cashaddr',
    verify: true // confirm the address on the device
  })
  return true
}
