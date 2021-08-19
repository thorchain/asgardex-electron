import React, { useCallback, useEffect } from 'react'

import { useObservableState } from 'observable-hooks'

import { ExternalUrl } from '../../../shared/const'
import { AppSettings } from '../../components/app/AppSettings'
import { useI18nContext } from '../../contexts/I18nContext'
import { envOrDefault } from '../../helpers/envHelper'
import { useAppUpdate } from '../../hooks/useAppUpdate'
import { useNetwork } from '../../hooks/useNetwork'

export const AppSettingsView: React.FC = (): JSX.Element => {
  const { network, changeNetwork } = useNetwork()

  const { appUpdater, checkForUpdates } = useAppUpdate()

  const { changeLocale, locale$, initialLocale } = useI18nContext()
  const currentLocale = useObservableState(locale$, initialLocale)

  const goToReleasePage = useCallback(
    (version: string) => window.apiUrl.openExternal(`${ExternalUrl.GITHUB_RELEASE}${version}`),
    []
  )

  useEffect(() => {
    // Needed to update Electron native menu according to the selected locale
    window.apiLang.update(currentLocale)
  }, [currentLocale])

  return (
    <AppSettings
      locale={currentLocale}
      changeLocale={changeLocale}
      network={network}
      changeNetwork={changeNetwork}
      version={envOrDefault($VERSION, '-')}
      appUpdateState={appUpdater}
      checkForUpdates={checkForUpdates}
      goToReleasePage={goToReleasePage}
    />
  )
}
