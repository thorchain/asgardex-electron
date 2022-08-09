import React from 'react'

import { UnlockForm } from '../../components/wallet/unlock'
import { useKeystoreState } from '../../hooks/useKeystoreState'

export const UnlockView: React.FC = (): JSX.Element => {
  const { state: keystore, unlock, remove } = useKeystoreState()
  return <UnlockForm keystore={keystore} unlock={unlock} removeKeystore={remove} />
}
