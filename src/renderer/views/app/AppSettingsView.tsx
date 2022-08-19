import React, { useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { useObservableState } from 'observable-hooks'

import { ExternalUrl } from '../../../shared/const'
import { DEFAULT_LOCALE } from '../../../shared/i18n/const'
import { envOrDefault } from '../../../shared/utils/env'
import { AppSettings } from '../../components/settings'
import { useI18nContext } from '../../contexts/I18nContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useAppUpdate } from '../../hooks/useAppUpdate'
import { useCollapsedSetting } from '../../hooks/useCollapsedSetting'
import { useNetwork } from '../../hooks/useNetwork'

export const AppSettingsView: React.FC = (): JSX.Element => {
  const { network, changeNetwork } = useNetwork()
  const { appUpdater, checkForUpdates } = useAppUpdate()
  const {
    service: { apiEndpoint$, setMidgardUrl }
  } = useMidgardContext()
  const midgardUrl = useObservableState(apiEndpoint$, RD.initial)

  const { collapsed, toggle: toggleCollapse } = useCollapsedSetting('app')

  const { changeLocale, locale$ } = useI18nContext()
  const currentLocale = useObservableState(locale$, DEFAULT_LOCALE)

  const goToReleasePage = useCallback(
    (version: string) => window.apiUrl.openExternal(`${ExternalUrl.GITHUB_RELEASE}${version}`),
    []
  )

  const updateMidgardUrlHandler = useCallback(
    (url: string) => {
      setMidgardUrl(network, url)
    },
    [network, setMidgardUrl]
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
      midgardUrl={midgardUrl}
      onChangeMidgardUrl={updateMidgardUrlHandler}
    />
  )
}
