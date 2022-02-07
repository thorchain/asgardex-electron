import AppBTC from '@ledgerhq/hw-app-btc'
import type Transport from '@ledgerhq/hw-transport'
import { BTCChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { WalletAddress } from '../../../../shared/wallet/types'
import { getDerivationPath } from './common'

export const getAddress = async (
  transport: Transport,
  network: Network,
  walletIndex: number
): Promise<E.Either<LedgerError, WalletAddress>> => {
  try {
    const app = new AppBTC(transport)
    const clientNetwork = toClientNetwork(network)
    const derive_path = getDerivationPath(walletIndex, clientNetwork)
    const { bitcoinAddress } = await app.getWalletPublicKey(derive_path, {
      format: 'bech32' // bech32 format with 84' paths
    })
    return E.right({ address: bitcoinAddress, chain: BTCChain, type: 'ledger', walletIndex })
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.GET_ADDRESS_FAILED,
      msg: `Could not get address from Ledger's BTC app: ${
        isError(error) ? error?.message ?? error.toString() : `${error}`
      }`
    })
  }
}

export const verifyAddress = async (transport: Transport, network: Network, walletIndex: number): Promise<void> => {
  const app = new AppBTC(transport)
  const clientNetwork = toClientNetwork(network)
  const derive_path = getDerivationPath(walletIndex, clientNetwork)
  const _ = await app.getWalletPublicKey(derive_path, {
    format: 'bech32', // bech32 format with 84' paths
    verify: true // confirm the address on the device
  })
}
