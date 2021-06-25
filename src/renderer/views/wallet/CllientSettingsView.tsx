import React, { useCallback, useEffect } from 'react'

import { useObservableState } from 'observable-hooks'

import { ExternalUrl } from '../../../shared/const'
import { ClientSettings } from '../../components/wallet/settings/ClientSettings'
import { useAppContext } from '../../contexts/AppContext'
import { useI18nContext } from '../../contexts/I18nContext'
import { envOrDefault } from '../../helpers/envHelper'
import { useAppUpdate } from '../../hooks/useAppUpdate'
import { OnlineStatus } from '../../services/app/types'

export const ClientSettingsView: React.FC = (): JSX.Element => {
  const { appUpdater, checkForUpdates } = useAppUpdate()

  const { changeLocale, locale$, initialLocale } = useI18nContext()
  const currentLocale = useObservableState(locale$, initialLocale)

  const { onlineStatus$ } = useAppContext()

  const onlineStatus = useObservableState<OnlineStatus>(onlineStatus$, OnlineStatus.OFF)

  const goToReleasePage = useCallback(
    (version: string) => window.apiUrl.openExternal(`${ExternalUrl.GITHUB_RELEASE}${version}`),
    []
  )

  useEffect(() => {
    // Needed to update Electron native menu according to the selected locale
    window.apiLang.update(currentLocale)
  }, [currentLocale])

  return (
    <ClientSettings
      locale={currentLocale}
      changeLocale={changeLocale}
      version={envOrDefault($VERSION, '-')}
      onlineStatus={onlineStatus}
      appUpdateState={appUpdater}
      checkForUpdates={checkForUpdates}
      goToReleasePage={goToReleasePage}
    />
  )
}
