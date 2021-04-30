import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'

import packageInfo from '../../../../package.json'
import { AppUpdate, AppUpdateModalProps } from '../../components/AppUpdate'
import { useAppUpdate } from '../../hooks/useAppUpdate'

export const AppUpdateView: React.FC = () => {
  const { appUpdater, resetAppUpdater } = useAppUpdate()

  const updateModalProps = useMemo(
    () =>
      FP.pipe(
        appUpdater,
        RD.fold(
          (): AppUpdateModalProps => ({ isOpen: false }),
          (): AppUpdateModalProps => ({ isOpen: false }),
          ({ message }): AppUpdateModalProps => ({ isOpen: true, type: 'fail', close: resetAppUpdater, message }),
          (version): AppUpdateModalProps => ({
            isOpen: true,
            type: 'success',
            goToUpdates: () => window.apiUrl.openExternal(`${packageInfo.repository.url}/releases/tag/v${version}`),
            version,
            close: resetAppUpdater
          })
        )
      ),
    [appUpdater, resetAppUpdater]
  )
  return <AppUpdate {...updateModalProps} />
}
