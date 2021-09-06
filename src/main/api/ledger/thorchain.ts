import type Transport from '@ledgerhq/hw-transport'
import THORChainApp, { LedgerErrorType } from '@thorchain/ledger-thorchain'
import { getPrefix } from '@xchainjs/xchain-thorchain'
import * as E from 'fp-ts/Either'

import { LedgerErrorId, Network } from '../../../shared/api/types'
import { toClientNetwork } from '../../../shared/utils/client'
import { getErrorId } from './utils'

// TODO(@veado) Get path by using `xchain-thorchain`
const PATH = [44, 931, 0, 0, 0]

export const getAddress = async (transport: Transport, network: Network): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    const app = new THORChainApp(transport)
    const clientNetwork = toClientNetwork(network)
    const prefix = getPrefix(clientNetwork)
    console.log('clientNetwork:', clientNetwork)
    console.log('prefix:', prefix)
    const res = await app.getAddressAndPubKey(PATH, prefix)
    console.log('response:', res)
    if (!res.bech32Address || res.returnCode !== LedgerErrorType.NoErrors) {
      // TODO (@asgdx-team) Transform LedgerErrorType -> LedgerErrorId
      return E.left(LedgerErrorId.UNKNOWN)
    }
    return E.right(res.bech32Address)
  } catch (error) {
    return E.left(getErrorId(error))
  }
}
