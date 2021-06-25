import React, { useCallback } from 'react'

import { useObservableState } from 'observable-hooks'

import { ExternalUrl } from '../../../shared/const'
import { ClientSettings } from '../../components/wallet/settings/ClientSettings'
import { useAppContext } from '../../contexts/AppContext'
import { envOrDefault } from '../../helpers/envHelper'
import { useAppUpdate } from '../../hooks/useAppUpdate'
import { OnlineStatus } from '../../services/app/types'

export const ClientSettingsView: React.FC = (): JSX.Element => {
  const { appUpdater, checkForUpdates } = useAppUpdate()

  const { onlineStatus$ } = useAppContext()

  const onlineStatus = useObservableState<OnlineStatus>(onlineStatus$, OnlineStatus.OFF)

  const goToReleasePage = useCallback(
    (version: string) => window.apiUrl.openExternal(`${ExternalUrl.GITHUB_RELEASE}${version}`),
    []
  )

  return (
    <ClientSettings
      version={envOrDefault($VERSION, '-')}
      onlineStatus={onlineStatus}
      appUpdateState={appUpdater}
      checkForUpdates={checkForUpdates}
      goToReleasePage={goToReleasePage}
    />
  )
}
