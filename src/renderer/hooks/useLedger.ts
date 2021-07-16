import { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import Transport from '@ledgerhq/hw-transport'
import THORChainApp from '@thorchain/ledger-thorchain'
import { getPrefix as getTHORPrefix } from '@xchainjs/xchain-thorchain'
import { Chain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/function'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { LedgerErrorId, Network } from '../../shared/api/types'
import { useAppContext } from '../contexts/AppContext'
import { observableState } from '../helpers/stateHelper'
import { toClientNetwork } from '../services/clients'
import { DEFAULT_NETWORK } from '../services/const'
import { LedgerAddressRD } from '../services/wallet/types'

// TODO(@veado) Get path by using `xchain-thorchain`
const PATH = [44, 931, 0, 0, 0]

export const getTHORAddress = async (transport: Transport, network: Network) => {
  try {
    const app = new THORChainApp(transport)
    const clientNetwork = toClientNetwork(network)
    const response = await app.getAddressAndPubKey(PATH, getTHORPrefix(clientNetwork))
    if (response.return_code !== 0x9000) {
      // TODO(@Veado) get address from pubkey
      return E.right('my-address')
    } else {
      return E.left(LedgerErrorId.UNKNOWN)
    }
  } catch (error) {
    return E.left(LedgerErrorId.WRONG_APP)
  }
}

export const useLedger = () => {
  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { get$: address$, set: setAddress } = useMemo(() => observableState<LedgerAddressRD>(RD.initial), [])

  const addressRD = useObservableState(FP.pipe(address$, RxOp.shareReplay(1)), RD.initial)

  const getAddress = useCallback(
    (_chain: Chain) => {
      FP.pipe(
        Rx.from(window.apiHDWallet.getTransport()),
        RxOp.switchMap((transport) => Rx.from(getTHORAddress(transport, network))),
        RxOp.map(RD.fromEither),
        RxOp.startWith(RD.pending),
        RxOp.catchError((error) => Rx.of(RD.failure(error)))
      ).subscribe(setAddress)
    },
    [network, setAddress]
  )

  // const getAddress = useCallback(
  //   (chain: Chain) => {
  //     FP.pipe(
  //       Rx.from(window.apiHDWallet.getLedgerAddress(chain, network)),
  //       RxOp.map(RD.fromEither),
  //       RxOp.startWith(RD.pending),
  //       RxOp.catchError((error) => Rx.of(RD.failure(error)))
  //     ).subscribe(setAddress)
  //   },
  //   [network, setAddress]
  // )

  return {
    getAddress,
    address: addressRD
  }
}
