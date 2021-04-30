import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'

import packageInfo from '../../../../package.json'
import { AppUpdateModal, AppUpdateModalProps } from '../../components/AppUpdate'
import { useAppUpdate } from '../../hooks/useAppUpdate'

export const AppUpdateModalView: React.FC = () => {
  const { appUpdater, resetAppUpdater } = useAppUpdate()

  const updateModalProps = useMemo(
    () =>
      FP.pipe(
        appUpdater,
        RD.fold(
          (): AppUpdateModalProps => ({ isOpen: false }),
          (): AppUpdateModalProps => ({ isOpen: false }),
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
