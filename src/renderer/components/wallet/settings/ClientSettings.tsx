import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { OnlineStatus } from '../../../services/app/types'
import * as Styled from './ClientSettings.style'

export type Props = {
  version: string
  onlineStatus: OnlineStatus
  appUpdateState: RD.RemoteData<Error, O.Option<string>>
  checkForUpdates: FP.Lazy<void>
  goToReleasePage: (version: string) => void
}

export const ClientSettings: React.FC<Props> = (props): JSX.Element => {
  const intl = useIntl()
  const { appUpdateState = RD.initial, onlineStatus, checkForUpdates, goToReleasePage = FP.constVoid, version } = props
  const onlineStatusColor = onlineStatus === OnlineStatus.ON ? 'green' : 'red'

  const checkUpdatesProps = useMemo(() => {
    const commonProps = {
      onClick: checkForUpdates,
      children: <>{intl.formatMessage({ id: 'update.checkForUpdates' })}</>
    }

    return FP.pipe(
      appUpdateState,
      RD.fold(
        () => commonProps,
        () => ({
          ...commonProps,
          loading: true,
          disabled: true
        }),
        () => ({
          ...commonProps
        }),
        (oVersion) => ({
          ...commonProps,
          ...FP.pipe(
            oVersion,
            O.fold(
              () => ({
                onClick: checkForUpdates
              }),
              (version) => ({
                onClick: () => goToReleasePage(version),
                children: (
                  <>
                    {intl.formatMessage({ id: 'update.link' })} <Styled.ExternalLinkIcon />
                  </>
                )
              })
            )
          )
        })
      )
    )
  }, [appUpdateState, checkForUpdates, goToReleasePage, intl])

  const renderVersionUpdateResult = useMemo(
    () =>
      FP.pipe(
        appUpdateState,
        RD.fold(
          FP.constNull,
          FP.constNull,
          ({ message }) => (
            <Styled.ErrorLabel>
              {intl.formatMessage({ id: 'update.checkFailed' }, { error: message })}
            </Styled.ErrorLabel>
          ),
          O.fold(
            () => <Styled.Label>{intl.formatMessage({ id: 'update.noUpdate' })}</Styled.Label>,
            (version) => <Styled.Label>{intl.formatMessage({ id: 'update.description' }, { version })}</Styled.Label>
          )
        )
      ),
    [appUpdateState, intl]
  )

  return (
    <div>
      <Styled.Section>
        <Styled.Title>{intl.formatMessage({ id: 'setting.internet' })}</Styled.Title>
        <Styled.ConnectionSubSection>
          <Styled.ConnectionStatus color={onlineStatusColor} />
          <Styled.Label>
            {intl.formatMessage({
              id: onlineStatus === OnlineStatus.ON ? 'setting.connected' : 'setting.notconnected'
            })}
          </Styled.Label>
        </Styled.ConnectionSubSection>
      </Styled.Section>

      <Styled.Section>
        <Styled.Title>{intl.formatMessage({ id: 'setting.version' })}</Styled.Title>
        <Styled.Label>v{version}</Styled.Label>
        <Styled.UpdatesButton {...checkUpdatesProps} />
        {renderVersionUpdateResult}
      </Styled.Section>
    </div>
  )
}
