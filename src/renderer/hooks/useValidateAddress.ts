import { useCallback } from 'react'

import { Address, XChainClient } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { useChainContext } from '../contexts/ChainContext'
import { AddressValidation } from '../services/clients'

export const useValidateAddress = (chain: Chain): AddressValidation => {
  const { clientByChain$ } = useChainContext()
  const [oClient] = useObservableState<O.Option<XChainClient>>(() => clientByChain$(chain), O.none)

  const validateAddress = useCallback(
    (address: Address) =>
      FP.pipe(
        oClient,
        O.map((client) => client.validateAddress(address)),
        // In case client is not available (it should never happen), skip validation by returning always `true`
        O.getOrElse<boolean>(() => true)
      ),
    [oClient]
  )

  return validateAddress
}
