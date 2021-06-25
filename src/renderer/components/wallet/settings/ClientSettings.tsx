import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Row, Dropdown } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Locale } from '../../../../shared/i18n/types'
import { ReactComponent as DownIcon } from '../../../assets/svg/icon-down.svg'
import { LOCALES } from '../../../i18n'
import { OnlineStatus } from '../../../services/app/types'
import { Menu } from '../../shared/menu'
import * as Styled from './ClientSettings.style'

export type Props = {
  version: string
  locale: Locale
  changeLocale: (locale: Locale) => void
  onlineStatus: OnlineStatus
  appUpdateState: RD.RemoteData<Error, O.Option<string>>
  checkForUpdates: FP.Lazy<void>
  goToReleasePage: (version: string) => void
}

export const ClientSettings: React.FC<Props> = (props): JSX.Element => {
  const {
    appUpdateState = RD.initial,
    onlineStatus,
    checkForUpdates,
    goToReleasePage = FP.constVoid,
    version,
    changeLocale,
    locale
  } = props

  const intl = useIntl()

  const changeLang: MenuProps['onClick'] = useCallback(
    ({ key }) => {
      changeLocale(key as Locale)
    },
    [changeLocale]
  )

  const langMenu = useMemo(
    () => (
      <Menu onClick={changeLang}>
        {LOCALES.map((locale: Locale) => {
          return (
            <Styled.MenuItem key={locale}>
              <Styled.MenuItemText strong>{locale}</Styled.MenuItemText>
            </Styled.MenuItem>
          )
        })}
      </Menu>
    ),
    [changeLang]
  )

  const renderLangMenu = useMemo(
    () => (
      <Dropdown overlay={langMenu} trigger={['click']} placement="bottomCenter">
        <Styled.DropdownContentWrapper>
          <Row style={{ alignItems: 'center' }}>
            <Styled.MenuItemText strong>{locale}</Styled.MenuItemText>
            <DownIcon />
          </Row>
        </Styled.DropdownContentWrapper>
      </Dropdown>
    ),
    [langMenu, locale]
  )

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
        <Styled.Title>{intl.formatMessage({ id: 'setting.language' })}</Styled.Title>
        {renderLangMenu}
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
