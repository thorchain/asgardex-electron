import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Row, Dropdown } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { Locale } from '../../../shared/i18n/types'
import { ReactComponent as DownIcon } from '../../assets/svg/icon-down.svg'
import { LOCALES } from '../../i18n'
import { AVAILABLE_NETWORKS } from '../../services/const'
import { Menu } from '../shared/menu'
import * as Styled from './AppSettings.styles'

export type Props = {
  version: string
  locale: Locale
  changeLocale: (locale: Locale) => void
  network: Network
  changeNetwork: (network: Network) => void
  appUpdateState: RD.RemoteData<Error, O.Option<string>>
  checkForUpdates: FP.Lazy<void>
  goToReleasePage: (version: string) => void
}

export const AppSettings: React.FC<Props> = (props): JSX.Element => {
  const {
    appUpdateState = RD.initial,
    changeNetwork = FP.constVoid,
    network,
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
        {LOCALES.map((locale: Locale) => (
          <Styled.MenuItem key={locale}>
            <Styled.MenuItemText>{locale}</Styled.MenuItemText>
          </Styled.MenuItem>
        ))}
      </Menu>
    ),
    [changeLang]
  )

  const renderLangMenu = useMemo(
    () => (
      <Dropdown overlay={langMenu} trigger={['click']} placement="bottomCenter">
        <Styled.DropdownContentWrapper>
          <Row style={{ alignItems: 'center' }}>
            <Styled.MenuItemText>{locale}</Styled.MenuItemText>
            <DownIcon />
          </Row>
        </Styled.DropdownContentWrapper>
      </Dropdown>
    ),
    [langMenu, locale]
  )

  const changeNetworkHandler: MenuProps['onClick'] = useCallback(
    ({ key }) => {
      changeNetwork(key as Network)
    },
    [changeNetwork]
  )

  // TODO asgdx-team: Remove `networkLabel` if we go live with mainnet
  const networkLabel = (network: Network) => (network === 'mainnet' ? 'chaosnet' : network)

  const networkMenu = useMemo(
    () => (
      <Menu onClick={changeNetworkHandler}>
        {AVAILABLE_NETWORKS.map((network: Network) => (
          <Styled.MenuItem key={network}>
            <Styled.MenuItemText>
              {/* TODO @asgdx-team: Revert it back to `network` if we go live with mainnet */}
              <Styled.NetworkLabel network={network}>{networkLabel(network)}</Styled.NetworkLabel>
            </Styled.MenuItemText>
          </Styled.MenuItem>
        ))}
      </Menu>
    ),
    [changeNetworkHandler]
  )

  const renderNetworkMenu = useMemo(
    () => (
      <Dropdown overlay={networkMenu} trigger={['click']} placement="bottomCenter">
        <Styled.DropdownContentWrapper>
          <Row style={{ alignItems: 'center' }}>
            {/* TODO asgdx-team: Revert it back to `network` if we go live with mainnet */}
            <Styled.NetworkLabel network={network}>{networkLabel(network)}</Styled.NetworkLabel>
            <DownIcon />
          </Row>
        </Styled.DropdownContentWrapper>
      </Dropdown>
    ),
    [networkMenu, network]
  )

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
    <Styled.Container>
      <Styled.Title>{intl.formatMessage({ id: 'setting.app.title' })}</Styled.Title>
      <Styled.CardContainer>
        <Styled.Card>
          <Styled.SectionsWrapper>
            <Styled.Section>
              <Styled.SubTitle>{intl.formatMessage({ id: 'common.network' })}</Styled.SubTitle>
              {renderNetworkMenu}
            </Styled.Section>
            <Styled.Section>
              <Styled.SubTitle>{intl.formatMessage({ id: 'setting.language' })}</Styled.SubTitle>
              {renderLangMenu}
            </Styled.Section>
            <Styled.Section>
              <Styled.SubTitle>{intl.formatMessage({ id: 'setting.version' })}</Styled.SubTitle>
              <Styled.Label>v{version}</Styled.Label>
              <Styled.UpdatesButton {...checkUpdatesProps} />
              {renderVersionUpdateResult}
            </Styled.Section>
          </Styled.SectionsWrapper>
        </Styled.Card>
      </Styled.CardContainer>
    </Styled.Container>
  )
}
