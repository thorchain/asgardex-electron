import type Transport from '@ledgerhq/hw-transport'
import THORChainApp, { LedgerErrorType } from '@thorchain/ledger-thorchain'
import { getPrefix } from '@xchainjs/xchain-thorchain'
import * as E from 'fp-ts/Either'

import { isError } from '../../../../shared/api/guard'
import { LedgerErrorId, Network } from '../../../../shared/api/types'
import { toClientNetwork } from '../../../../shared/utils/client'
import { getErrorId } from '../utils'
import { fromLedgerErrorType, PATH } from './common'

export const getAddress = async (transport: Transport, network: Network): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    const app = new THORChainApp(transport)
    const clientNetwork = toClientNetwork(network)
    const prefix = getPrefix(clientNetwork)
    const { bech32Address, returnCode } = await app.getAddressAndPubKey(PATH, prefix)
    if (!bech32Address || returnCode !== LedgerErrorType.NoErrors) {
      return E.left(fromLedgerErrorType(returnCode))
    }
    return E.right(bech32Address)
  } catch (error) {
    return E.left(getErrorId(isError(error) ? error.message : ''))
  }
}
