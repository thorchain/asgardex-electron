import { useCallback } from 'react'

import { TxHash, XChainClient } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { useChainContext } from '../contexts/ChainContext'
import { OpenExplorerTxUrl } from '../services/clients'

export const useOpenExplorerTxUrl = (chain: Chain): OpenExplorerTxUrl => {
  const { clientByChain$ } = useChainContext()
  const [oClient] = useObservableState<O.Option<XChainClient>>(() => clientByChain$(chain), O.none)

  const openExplorerTxUrl: OpenExplorerTxUrl = useCallback(
    (txHash: TxHash) =>
      FP.pipe(
        oClient,
        O.map(async (client) => {
          const url = client.getExplorerTxUrl(txHash)
          await window.apiUrl.openExternal(url)
          return true
        }),
        O.getOrElse<Promise<boolean>>(() => Promise.resolve(false))
      ),
    [oClient]
  )

  return openExplorerTxUrl
}
