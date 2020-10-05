import React from 'react'

import { useObservableState } from 'observable-hooks'

import UnlockForm from '../../components/wallet/UnlockForm'
import { useWalletContext } from '../../contexts/WalletContext'
import { initialKeystoreState } from '../../services/wallet/context'

const UnlockView: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { keystore$, removeKeystore } = keystoreService
  const keystore = useObservableState(keystore$, initialKeystoreState())

  return <UnlockForm keystore={keystore} unlock={keystoreService.unlock} removeKeystore={removeKeystore} />
}

export default UnlockView
