import { useCallback } from 'react'

import { Address, XChainClient } from '@xchainjs/xchain-client'
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
    (address: Address, params = '') =>
      FP.pipe(
        oClient,
        O.map(async (client) => {
          let url = client.getExplorerAddressUrl(address)
          // add optional params if set before
          url = params ? `${url}&${params}` : url
          await window.apiUrl.openExternal(url)
          return true
        }),
        O.getOrElse<Promise<boolean>>(() => Promise.resolve(false))
      ),
    [oClient]
  )

  return openAddressUrl
}
