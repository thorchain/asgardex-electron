import React from 'react'

import { useObservableState } from 'observable-hooks'
import { Navigate, useLocation } from 'react-router-dom'

import { useWalletContext } from '../../contexts/WalletContext'
import { ReferrerState } from '../../routes/types'
import * as walletRoutes from '../../routes/wallet'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'

export const WalletAuth = ({ children }: { children: JSX.Element }): JSX.Element => {
  const { keystoreService } = useWalletContext()

  const location = useLocation()

  // Important note:
  // DON'T set `INITIAL_KEYSTORE_STATE` as default value
  // Since `useObservableState` is set after first render (but not before)
  // and Route.render is called before first render,
  // we have to add 'undefined'  as default value
  const keystore = useObservableState(keystoreService.keystore$, undefined)

  // Redirect if  an user has not a phrase imported or wallet has been locked
  // Special case: keystore can be `undefined` (see comment at its definition using `useObservableState`)
  if (keystore === undefined) {
    return <></>
  }

  if (!hasImportedKeystore(keystore)) {
    return (
      <Navigate
        to={{
          pathname: walletRoutes.noWallet.path()
        }}
        replace
      />
    )
  }

  // check lock status
  if (isLocked(keystore)) {
    return (
      <Navigate
        to={{
          pathname: walletRoutes.locked.path(),
          search: location.search
        }}
        state={{ referrer: (location.state as ReferrerState)?.referrer ?? location.pathname }}
        replace
      />
    )
  }

  return children
}
