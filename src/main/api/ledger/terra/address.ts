import type Transport from '@ledgerhq/hw-transport'
import TerraApp from '@terra-money/ledger-terra-js'
import { getPrefix } from '@xchainjs/xchain-terra'
import { TerraChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { LedgerError, LedgerErrorId } from '../../../../shared/api/types'
import { isError } from '../../../../shared/utils/guard'
import { WalletAddress } from '../../../../shared/wallet/types'
import { getDerivationPath } from './common'

export const getAddress = async (
  transport: Transport,
  walletIndex: number
): Promise<E.Either<LedgerError, WalletAddress>> => {
  try {
    const app = new TerraApp(transport)
    const prefix = getPrefix()
    const path = FP.pipe(walletIndex, getDerivationPath, O.toNullable)
    if (!path) {
      return E.left({
        errorId: LedgerErrorId.INVALID_DATA,
        msg: `Deriving 'path' for Ledger Terra failed`
      })
    }
    const { bech32_address: bech32Address } = await app.getAddressAndPubKey(path, prefix)

    if (!bech32Address) {
      return E.left({
        errorId: LedgerErrorId.GET_ADDRESS_FAILED,
        msg: `Getting 'bech32Address' from Ledger's Terra app failed`
      })
    }
    return E.right({ address: bech32Address, chain: TerraChain, type: 'ledger', walletIndex })
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.GET_ADDRESS_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}

export const verifyAddress = async (transport: Transport, walletIndex: number) => {
  const app = new TerraApp(transport)
  const prefix = getPrefix()
  const path = FP.pipe(walletIndex, getDerivationPath, O.toNullable)
  if (!path) return Promise.reject(false)

  const _ = await app.showAddressAndPubKey(path, prefix)
  return true
}
