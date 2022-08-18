import React, { useCallback } from 'react'

import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useLocation, useNavigate } from 'react-router-dom'

import { UnlockWalletSettings } from '../../components/settings'
import { useCollapsedSetting } from '../../hooks/useCollapsedSetting'
import { useKeystoreState } from '../../hooks/useKeystoreState'
import * as walletRoutes from '../../routes/wallet'
import { isKeystoreUnlocked } from '../../services/wallet/types'
import { WalletSettingsView } from './WalletSettingsView'

export const WalletSettingsAuth: React.FC = (): JSX.Element => {
  const navigate = useNavigate()
  const location = useLocation()

  const { state: keystoreState } = useKeystoreState()

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
