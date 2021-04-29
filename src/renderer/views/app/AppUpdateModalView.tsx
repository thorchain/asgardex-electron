import React, { useMemo } from 'react'

import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import packageInfo from '../../../../package.json'
import { AppUpdateModal, AppUpdateModalProps } from '../../components/AppUpdate'
import { useAppContext } from '../../contexts/AppContext'

export const AppUpdateModalView: React.FC = () => {
  const { resetAppUpdater, appUpdater$ } = useAppContext()

  const appUpdater = useObservableState(appUpdater$, O.none)

  const updateModalProps = useMemo(
    () =>
      FP.pipe(
        appUpdater,
        O.fold(
          (): AppUpdateModalProps => ({ isOpen: false }),
          (version): AppUpdateModalProps => ({
            isOpen: true,
            goToUpdates: () => window.apiUrl.openExternal(`${packageInfo.repository.url}/releases/tag/v${version}`),
            version,
            close: resetAppUpdater
          })
        )
      ),
    [appUpdater, resetAppUpdater]
  )
  return <AppUpdateModal {...updateModalProps} />
}
