import React from 'react'

import { useObservableState } from 'observable-hooks'

import UnlockForm from '../../components/wallet/UnlockForm'
import { useWalletContext } from '../../contexts/WalletContext'
import { INITIAL_KEYSTORE_STATE } from '../../services/wallet/const'

const UnlockView: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { keystore$, removeKeystore } = keystoreService
  const keystore = useObservableState(keystore$, INITIAL_KEYSTORE_STATE)

  return <UnlockForm keystore={keystore} unlock={keystoreService.unlock} removeKeystore={removeKeystore} />
}

export default UnlockView
