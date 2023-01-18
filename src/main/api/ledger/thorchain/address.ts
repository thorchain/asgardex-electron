import type Transport from '@ledgerhq/hw-transport'
import THORChainApp, { LedgerErrorType } from '@thorchain/ledger-thorchain'
import { getPrefix } from '@xchainjs/xchain-thorchain'
import * as E from 'fp-ts/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { THORChain } from '../../../../shared/utils/chain'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { WalletAddress } from '../../../../shared/wallet/types'
import { VerifyAddressHandler } from '../types'
import { fromLedgerErrorType, getDerivationPath } from './common'

export const getAddress = async (
  transport: Transport,
  network: Network,
  walletIndex: number
): Promise<E.Either<LedgerError, WalletAddress>> => {
  try {
    const app = new THORChainApp(transport)
    const clientNetwork = toClientNetwork(network)
    const prefix = getPrefix(clientNetwork)
    const path = getDerivationPath(walletIndex)
    const { bech32Address, returnCode } = await app.getAddressAndPubKey(path, prefix)
    if (!bech32Address || returnCode !== LedgerErrorType.NoErrors) {
      return E.left({
        errorId: fromLedgerErrorType(returnCode),
        msg: `Getting 'bech32Address' from Ledger's THORChain App failed`
      })
    }
    return E.right({ address: bech32Address, chain: THORChain, type: 'ledger', walletIndex, hdMode: 'default' })
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.GET_ADDRESS_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}

export const verifyAddress: VerifyAddressHandler = async ({ transport, network, walletIndex }) => {
  const app = new THORChainApp(transport)
  const clientNetwork = toClientNetwork(network)
  const prefix = getPrefix(clientNetwork)
  const path = getDerivationPath(walletIndex)
  const _ = await app.showAddressAndPubKey(path, prefix)
  return true
}
