import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { ExternalUrl } from '../../../shared/const'
import { AppUpdate, AppUpdateModalProps } from '../../components/AppUpdate'
import { useAppUpdate } from '../../hooks/useAppUpdate'

const ONE_HOUR_PERIOD = 1000 * 60 * 60

export const AppUpdateView: React.FC = () => {
  const { appUpdater, resetAppUpdater, checkForUpdates } = useAppUpdate()

  useEffect(() => {
    // check for updates at onMount
    checkForUpdates()
    // re-check for updates every 6 hours
    const interval = setInterval(checkForUpdates, ONE_HOUR_PERIOD * 6)

    return () => {
      clearInterval(interval)
    }
  }, [checkForUpdates])

  const updateModalProps = useMemo(
    () =>
      FP.pipe(
        appUpdater,
        RD.chain<Error, O.Option<string>, string>((oVersion) =>
          FP.pipe(
            oVersion,
            O.fold(() => RD.initial, RD.success)
          )
        ),
        // TODO will be converted to the Option at all by #1393
        RD.fold(
          (): AppUpdateModalProps => ({ isOpen: false }),
          (): AppUpdateModalProps => ({ isOpen: false }),
          ({ message }): AppUpdateModalProps => ({
            isOpen: true,
            type: 'fail',
            close: resetAppUpdater,
            message
          }),
          (version): AppUpdateModalProps => ({
            isOpen: true,
            type: 'success',
            goToUpdates: () => window.apiUrl.openExternal(`${ExternalUrl.GITHUB_RELEASE}${version}`),
            version,
            close: resetAppUpdater
          })
        )
      ),
    [appUpdater, resetAppUpdater]
  )
  return <AppUpdate {...updateModalProps} />
}
