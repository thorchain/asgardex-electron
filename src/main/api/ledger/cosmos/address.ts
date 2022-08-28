import CosmosApp from '@ledgerhq/hw-app-cosmos'
import type Transport from '@ledgerhq/hw-transport'
import { CosmosChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerError, LedgerErrorId } from '../../../../shared/api/types'
import { isError } from '../../../../shared/utils/guard'
import { WalletAddress } from '../../../../shared/wallet/types'
import { getDerivationPath } from './common'

export const getAddress = async (
  transport: Transport,
  walletIndex: number
): Promise<E.Either<LedgerError, WalletAddress>> => {
  try {
    const app = new CosmosApp(transport)
    const path = getDerivationPath(walletIndex)

    const { address } = await app.getAddress(path, 'cosmos')

    if (!address) {
      return E.left({
        errorId: LedgerErrorId.GET_ADDRESS_FAILED,
        msg: `Getting 'address' from Ledger's Cosmos app failed`
      })
    }
    return E.right({ address, chain: CosmosChain, type: 'ledger', walletIndex, hdMode: 'default' })
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.GET_ADDRESS_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}

export const verifyAddress = async (transport: Transport, walletIndex: number) => {
  const app = new CosmosApp(transport)
  const path = getDerivationPath(walletIndex)

  const _ = await app.getAddress(path, 'cosmos', true)
  return true
}
