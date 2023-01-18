import { crypto } from '@binance-chain/javascript-sdk'
import AppBNB from '@binance-chain/javascript-sdk/lib/ledger/ledger-app'
import type Transport from '@ledgerhq/hw-transport'
import { getDerivePath, getPrefix } from '@xchainjs/xchain-binance'
import * as E from 'fp-ts/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { BNBChain } from '../../../../shared/utils/chain'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { WalletAddress } from '../../../../shared/wallet/types'
import { VerifyAddressHandler } from '../types'

export const getAddress = async (
  transport: Transport,
  network: Network,
  walletIndex: number
): Promise<E.Either<LedgerError, WalletAddress>> => {
  try {
    const app = new AppBNB(transport)
    const derive_path = getDerivePath(walletIndex)
    const { pk } = await app.getPublicKey(derive_path)
    const clientNetwork = toClientNetwork(network)
    const prefix = getPrefix(clientNetwork)
    if (pk) {
      // get address from pubkey
      const address = crypto.getAddressFromPublicKey(pk.toString('hex'), prefix)
      return E.right({ address, chain: BNBChain, type: 'ledger', walletIndex, hdMode: 'default' })
    } else {
      return E.left({
        errorId: LedgerErrorId.INVALID_PUBKEY,
        msg: `Could not get public key from Ledger's Binance App`
      })
    }
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.GET_ADDRESS_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}

export const verifyAddress: VerifyAddressHandler = async ({ transport, network, walletIndex }) => {
  const app = new AppBNB(transport)
  const derive_path = getDerivePath(walletIndex)
  const clientNetwork = toClientNetwork(network)
  const prefix = getPrefix(clientNetwork)
  const _ = await app.showAddress(prefix, derive_path)
  return true
}
