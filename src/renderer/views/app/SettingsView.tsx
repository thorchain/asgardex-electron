import React from 'react'

import { WalletSettingsView } from '../wallet/WalletSettingsView'
import { AppSettingsView } from './AppSettingsView'

export const SettingsView: React.FC = (): JSX.Element => {
  return (
    <>
      <AppSettingsView />
      <WalletSettingsView />
    </>
  )
}
