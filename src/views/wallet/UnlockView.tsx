import React from 'react'

import { none } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import UnlockForm from '../../components/wallet/UnlockForm'
import { useWalletContext } from '../../contexts/WalletContext'

const UnlockView: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const keystore = useObservableState(keystoreService.keystore$, none)

  return <UnlockForm keystore={keystore} unlockHandler={keystoreService.unlock} />
}

export default UnlockView
