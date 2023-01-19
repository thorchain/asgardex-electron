import { useCallback, useEffect } from 'react'

import { TxHash, XChainClient } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { useChainContext } from '../contexts/ChainContext'
import { eqOChain } from '../helpers/fp/eq'
import { GetExplorerTxUrl, OpenExplorerTxUrl } from '../services/clients'

const explorerTxUrl = (oClient: O.Option<XChainClient>, txHash: TxHash) =>
  FP.pipe(
    oClient,
    O.map((client) => client.getExplorerTxUrl(txHash))
  )

export const openExplorerTxUrl = (oClient: O.Option<XChainClient>, txHash: TxHash): Promise<boolean> =>
  FP.pipe(
    explorerTxUrl(oClient, txHash),
    O.map(async (url) => {
      await window.apiUrl.openExternal(url)
      return true
    }),
    O.getOrElse<Promise<boolean>>(() => Promise.resolve(false))
  )

export const useOpenExplorerTxUrl = (
  oChain: O.Option<Chain>
): { openExplorerTxUrl: OpenExplorerTxUrl; getExplorerTxUrl: GetExplorerTxUrl } => {
  const { clientByChain$ } = useChainContext()

  const [oClient, chainUpdated] = useObservableState<O.Option<XChainClient>, O.Option<Chain>>(
    (oChain$) =>
      FP.pipe(
        oChain$,
        RxOp.distinctUntilChanged(eqOChain.equals) /* compare prev./current value - just for performance reason */,
        RxOp.switchMap(FP.flow(O.fold(() => Rx.EMPTY, clientByChain$)))
      ),
    O.none
  )

  // `chainUpdated` needs to be called whenever chain has been updated
  // to trigger `useObservableState` properly to get a client depending on chain
  useEffect(() => chainUpdated(oChain), [oChain, chainUpdated])

  return {
    openExplorerTxUrl: useCallback((txHash: TxHash) => openExplorerTxUrl(oClient, txHash), [oClient]),
    getExplorerTxUrl: useCallback((txHash: TxHash) => explorerTxUrl(oClient, txHash), [oClient])
  }
}
