import React, { useCallback } from 'react'

import { useObservableState } from 'observable-hooks'

import { ExternalUrl } from '../../../shared/const'
import { envOrDefault } from '../../../shared/utils/env'
import { AppSettings } from '../../components/settings'
import { useI18nContext } from '../../contexts/I18nContext'
import { useAppUpdate } from '../../hooks/useAppUpdate'
import { useCollapsedSetting } from '../../hooks/useCollapsedSetting'
import { useNetwork } from '../../hooks/useNetwork'

export const AppSettingsView: React.FC = (): JSX.Element => {
  const { network, changeNetwork } = useNetwork()
  const { appUpdater, checkForUpdates } = useAppUpdate()

  const { collapsed, toggle: toggleCollapse } = useCollapsedSetting('app')

  const { changeLocale, locale$, initialLocale } = useI18nContext()
  const currentLocale = useObservableState(locale$, initialLocale)

  const goToReleasePage = useCallback(
    (version: string) => window.apiUrl.openExternal(`${ExternalUrl.GITHUB_RELEASE}${version}`),
    []
  )

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
      collapsed={collapsed}
      toggleCollapse={toggleCollapse}
    />
  )
}
