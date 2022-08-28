import { useCallback } from 'react'

import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { KeystoreId } from '../../shared/api/types'
import { HDMode, WalletAddress } from '../../shared/wallet/types'
import { useWalletContext } from '../contexts/WalletContext'
import { LedgerAddress } from '../services/wallet/types'
import { ledgerAddressToWalletAddress } from '../services/wallet/util'
import { useNetwork } from './useNetwork'

export const useLedger = (chain: Chain, id: KeystoreId) => {
  const { network } = useNetwork()

  const { addLedgerAddress$, getLedgerAddress$, verifyLedgerAddress$, removeLedgerAddress } = useWalletContext()

  const verifyAddress = useCallback(
    (walletIndex: number, hdMode: HDMode) => verifyLedgerAddress$({ chain, network, walletIndex, hdMode }),
    [chain, verifyLedgerAddress$, network]
  )
  const removeAddress = useCallback(
    () => removeLedgerAddress({ id, chain, network }),
    [removeLedgerAddress, chain, network, id]
  )
  const [address] = useObservableState<O.Option<WalletAddress>>(
    () =>
      FP.pipe(
        getLedgerAddress$(chain),
        // LedgerAddress -> WalletAddress
        RxOp.map<O.Option<LedgerAddress>, O.Option<WalletAddress>>(FP.flow(O.map(ledgerAddressToWalletAddress))),
        RxOp.shareReplay(1)
      ),
    O.none
  )

  const addAddress = useCallback(
    (walletIndex: number, hdMode: HDMode) => addLedgerAddress$({ id, chain, network, walletIndex, hdMode }),
    [addLedgerAddress$, chain, id, network]
  )

  return {
    addAddress,
    verifyAddress,
    removeAddress,
    address
  }
}
