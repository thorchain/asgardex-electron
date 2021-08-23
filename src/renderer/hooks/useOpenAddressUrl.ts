import { useCallback } from 'react'

import { TxHash, XChainClient } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { useChainContext } from '../contexts/ChainContext'
import { OpenAddressUrl, OpenExplorerTxUrl } from '../services/clients'

export const useOpenAddressUrl = (chain: Chain): OpenAddressUrl => {
  const { clientByChain$ } = useChainContext()
  const [oClient] = useObservableState<O.Option<XChainClient>>(() => clientByChain$(chain), O.none)

  const openAddressUrl: OpenExplorerTxUrl = useCallback(
    (txHash: TxHash) =>
      FP.pipe(
        oClient,
        O.map(async (client) => {
          const url = client.getExplorerAddressUrl(txHash)
          await window.apiUrl.openExternal(url)
          return true
        }),
        O.getOrElse<Promise<boolean>>(() => Promise.resolve(false))
      ),
    [oClient]
  )

  return openAddressUrl
}
