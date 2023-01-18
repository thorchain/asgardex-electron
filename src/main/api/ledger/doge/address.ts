import AppBTC from '@ledgerhq/hw-app-btc'
import type Transport from '@ledgerhq/hw-transport'
import * as E from 'fp-ts/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { DOGEChain } from '../../../../shared/utils/chain'
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
    // Value of `currency` -> `GetAddressOptions` -> `currency` -> `id`
    // Example https://github.com/LedgerHQ/ledger-live/blob/37c0771329dd5a40dfe3430101bbfb100330f6bd/libs/ledger-live-common/src/families/bitcoin/hw-getAddress.ts#L17
    // DOGE -> `dogecoin` https://github.com/LedgerHQ/ledger-live/blob/37c0771329dd5a40dfe3430101bbfb100330f6bd/libs/ledgerjs/packages/cryptoassets/src/currencies.ts#L834
    const app = new AppBTC({ transport, currency: 'dogecoin' })
    const clientNetwork = toClientNetwork(network)
    const derivePath = getDerivationPath(walletIndex, clientNetwork)
    const { bitcoinAddress: address } = await app.getWalletPublicKey(derivePath, {
      // `legacy` format with 44' paths
      // @see https://github.com/LedgerHQ/ledgerjs/blob/master/packages/hw-app-btc/README.md#parameters-2
      format: 'legacy'
    })
    return E.right({ address, chain: DOGEChain, type: 'ledger', walletIndex, hdMode: 'default' })
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.GET_ADDRESS_FAILED,
      msg: `Could not get address from Ledger's DOGE app: ${
        isError(error) ? error?.message ?? error.toString() : `${error}`
      }`
    })
  }
}

export const verifyAddress: VerifyAddressHandler = async ({ transport, network, walletIndex }) => {
  // Value of `currency` -> `GetAddressOptions` -> `currency` -> `id`
  // Example https://github.com/LedgerHQ/ledger-live/blob/37c0771329dd5a40dfe3430101bbfb100330f6bd/libs/ledger-live-common/src/families/bitcoin/hw-getAddress.ts#L17
  // DOGE -> `dogecoin` https://github.com/LedgerHQ/ledger-live/blob/37c0771329dd5a40dfe3430101bbfb100330f6bd/libs/ledgerjs/packages/cryptoassets/src/currencies.ts#L834
  const app = new AppBTC({ transport, currency: 'dogecoin' })
  const clientNetwork = toClientNetwork(network)
  const derivePath = getDerivationPath(walletIndex, clientNetwork)
  const _ = await app.getWalletPublicKey(derivePath, {
    // `legacy` format with 44' paths
    // @see https://github.com/LedgerHQ/ledgerjs/blob/master/packages/hw-app-btc/README.md#parameters-2
    format: 'legacy',
    verify: true // confirm address on device
  })
  return true
}
