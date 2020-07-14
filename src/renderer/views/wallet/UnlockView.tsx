import React, { useEffect } from 'react'

import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router'

import UnlockForm from '../../components/wallet/UnlockForm'
import { useWalletContext } from '../../contexts/WalletContext'
import * as appRoutes from '../../routes/app'
import { initialKeystoreState } from '../../services/wallet/service'
import { hasImportedKeystore } from '../../services/wallet/util'

const UnlockView: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const keystore = useObservableState(keystoreService.keystore$, initialKeystoreState())
  const history = useHistory()

  useEffect(() => {
    if (!hasImportedKeystore(keystore)) {
      history.push(appRoutes.base.template)
    }
  }, [keystore, history])

  return <UnlockForm keystore={keystore} unlockHandler={keystoreService.unlock} />
}

export default UnlockView
