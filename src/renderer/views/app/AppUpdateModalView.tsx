import React, { useMemo } from 'react'

import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

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
          ({ nextRelease, nextReleasePath }): AppUpdateModalProps => ({
            isOpen: true,
            goToUpdates: () => console.log(nextReleasePath),
            version: nextRelease,
            close: resetAppUpdater
          })
        )
      ),
    [appUpdater, resetAppUpdater]
  )
  return <AppUpdateModal {...updateModalProps} />
}
