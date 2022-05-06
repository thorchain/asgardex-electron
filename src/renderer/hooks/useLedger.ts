import { useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useWalletContext } from '../contexts/WalletContext'
import { LedgerAddressRD } from '../services/wallet/types'
import { useNetwork } from './useNetwork'

export const useLedger = (chain: Chain) => {
  const { network } = useNetwork()

  const { askLedgerAddress$, getLedgerAddress$, verifyLedgerAddress, removeLedgerAddress } = useWalletContext()

  const verifyAddress = useCallback(
    async (walletIndex: number) => await verifyLedgerAddress({ chain, network, walletIndex }),
    [chain, verifyLedgerAddress, network]
  )
  const removeAddress = useCallback(() => removeLedgerAddress(chain, network), [chain, removeLedgerAddress, network])

  const address = useObservableState<LedgerAddressRD>(
    FP.pipe(getLedgerAddress$(chain, network), RxOp.shareReplay(1)),
    RD.initial
  )

  const askAddress = useCallback(
    (walletIndex: number) => {
      // Note: Subscription is needed to get all values
      // and to let `askLedgerAddressByChain` update state of `LedgerAddressRD`
      // Check implementation of `askLedgerAddressByChain` in `src/renderer/services/wallet/ledger.ts`
      const sub = askLedgerAddress$(chain, network, walletIndex).subscribe()
      return () => sub.unsubscribe()
    },
    [askLedgerAddress$, chain, network]
  )

  return {
    askAddress,
    verifyAddress,
    removeAddress,
    address
  }
}
