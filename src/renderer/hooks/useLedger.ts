import { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../shared/api/types'
import { useAppContext } from '../contexts/AppContext'
import { observableState } from '../helpers/stateHelper'
import { DEFAULT_NETWORK } from '../services/const'
import { LedgerAddressRD } from '../services/wallet/types'

export const useLedger = () => {
  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { get$: address$, set: setAddress } = useMemo(() => observableState<LedgerAddressRD>(RD.initial), [])

  const addressRD = useObservableState(FP.pipe(address$, RxOp.shareReplay(1)), RD.initial)

  const getAddress = useCallback(
    (chain: Chain) => {
      FP.pipe(
        Rx.from(window.apiHDWallet.getLedgerAddress(chain, network)),
        RxOp.map(RD.fromEither),
        RxOp.startWith(RD.pending),
        RxOp.catchError((error) => Rx.of(RD.failure(error)))
      ).subscribe(setAddress)
    },
    [network, setAddress]
  )

  return {
    getAddress,
    address: addressRD
  }
}
