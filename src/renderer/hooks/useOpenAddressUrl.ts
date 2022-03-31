import { useCallback } from 'react'

import { XChainClient } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { useChainContext } from '../contexts/ChainContext'
import { OpenAddressUrl } from '../services/clients'

export const useOpenAddressUrl = (chain: Chain): OpenAddressUrl => {
  const { clientByChain$ } = useChainContext()
  const [oClient] = useObservableState<O.Option<XChainClient>>(() => clientByChain$(chain), O.none)

  const openAddressUrl: OpenAddressUrl = useCallback(
    (address, searchParams) =>
      FP.pipe(
        oClient,
        O.map(async (client) => {
          const url = new URL(client.getExplorerAddressUrl(address))
          // update search params
          FP.pipe(
            searchParams,
            O.fromNullable,
            O.map(A.map(({ param, value }) => url.searchParams.append(param, value)))
          )
          await window.apiUrl.openExternal(url.toString())
          return true
        }),
        O.getOrElse<Promise<boolean>>(() => Promise.resolve(false))
      ),
    [oClient]
  )

  return openAddressUrl
}
