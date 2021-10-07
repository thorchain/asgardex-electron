import type Transport from '@ledgerhq/hw-transport'
import THORChainApp, { LedgerErrorType } from '@thorchain/ledger-thorchain'
import { Address } from '@xchainjs/xchain-client'
import { getPrefix } from '@xchainjs/xchain-thorchain'
import * as E from 'fp-ts/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { fromLedgerErrorType, PATH } from './common'

export const getAddress = async (transport: Transport, network: Network): Promise<E.Either<LedgerError, Address>> => {
  try {
    const app = new THORChainApp(transport)
    const clientNetwork = toClientNetwork(network)
    const prefix = getPrefix(clientNetwork)
    const { bech32Address, returnCode } = await app.getAddressAndPubKey(PATH, prefix)
    if (!bech32Address || returnCode !== LedgerErrorType.NoErrors) {
      return E.left({
        errorId: fromLedgerErrorType(returnCode),
        msg: `Getting 'bech32Address' from Ledger's THORChain App failed`
      })
    }
    return E.right(bech32Address)
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.GET_ADDRESS_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}

export const verifyAddress = async (transport: Transport, network: Network) => {
  const app = new THORChainApp(transport)
  const clientNetwork = toClientNetwork(network)
  const prefix = getPrefix(clientNetwork)
  app.showAddressAndPubKey(PATH, prefix)
}
