import React, { useCallback } from 'react'

import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useLocation, useNavigate } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { UnlockWalletSettings } from '../../components/settings'
import { useWalletContext } from '../../contexts/WalletContext'
import { useCollapsedSetting } from '../../hooks/useCollapsedSetting'
import * as walletRoutes from '../../routes/wallet'
import { INITIAL_KEYSTORE_STATE } from '../../services/wallet/const'
import { isKeystoreUnlocked } from '../../services/wallet/types'
import { WalletSettingsView } from './WalletSettingsView'

export const WalletSettingsAuth: React.FC = (): JSX.Element => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    keystoreService: { keystoreState$ }
  } = useWalletContext()

  // Note: Short delay for acting changes of `KeystoreState` is needed
  // Just to let `WalletSettingsView` process changes w/o race conditions
  // In other case it will jump to `UnlockWalletSettings` right after changing a wallet in `WalletSettingsView`
  const keystoreState = useObservableState(FP.pipe(keystoreState$, RxOp.delay(100)), INITIAL_KEYSTORE_STATE)

  const { collapsed, toggle: toggleCollapse } = useCollapsedSetting('wallet')

  const unlockWalletHandler = useCallback(() => {
    navigate(walletRoutes.base.path(location.pathname))
  }, [location.pathname, navigate])

  return FP.pipe(
    keystoreState,
    // Get unlocked state only
    O.chain(FP.flow(O.fromPredicate(isKeystoreUnlocked))),
    O.fold(
      // keystore locked / not imported
      () => (
        <UnlockWalletSettings
          keystoreState={keystoreState}
          unlockHandler={unlockWalletHandler}
          collapsed={collapsed}
          toggleCollapse={toggleCollapse}
        />
      ),
      // keystore unlocked
      (keystoreUnlocked) => <WalletSettingsView keystoreUnlocked={keystoreUnlocked} />
    )
  )
}
