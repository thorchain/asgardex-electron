import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Row, Dropdown, Collapse } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { Locale } from '../../../shared/i18n/types'
import { LOCALES } from '../../i18n'
import { AVAILABLE_NETWORKS } from '../../services/const'
import { MidgardUrlRD } from '../../services/midgard/types'
import { DownIcon } from '../icons'
import { Menu } from '../shared/menu'
import { BorderButton, TextButton } from '../uielements/button'
import { SwitchButton } from '../uielements/button/SwitchButton'
import * as Styled from './AppSettings.styles'
import * as CStyled from './Common.styles'
import EditableUrl from './EditableUrl'

export type Props = {
  version: string
  locale: Locale
  changeLocale: (locale: Locale) => void
  network: Network
  changeNetwork: (network: Network) => void
  appUpdateState: RD.RemoteData<Error, O.Option<string>>
  checkForUpdates: FP.Lazy<void>
  goToReleasePage: (version: string) => void
  collapsed: boolean
  toggleCollapse: FP.Lazy<void>
  midgardUrl: MidgardUrlRD
  onChangeMidgardUrl: (url: string) => void
}

type SectionProps = {
  title: string
  children?: React.ReactNode
  className?: string
}

const Section: React.FC<SectionProps> = ({ title, className, children }) => (
  <div className={`mb-20px flex flex-col items-start ${className}`}>
    <h2 className="mb-5px font-main text-[12px] uppercase text-text2 dark:text-text2d">{title}</h2>
    {children}
  </div>
)

export const AppSettings: React.FC<Props> = (props): JSX.Element => {
  const {
    appUpdateState = RD.initial,
    changeNetwork = FP.constVoid,
    network,
    checkForUpdates,
    goToReleasePage = FP.constVoid,
    version,
    changeLocale,
    locale,
    collapsed,
    toggleCollapse,
    midgardUrl: midgardUrlRD,
    onChangeMidgardUrl
  } = props

  const intl = useIntl()

  const changeLang: MenuProps['onClick'] = useCallback(
    ({ key }: { key: string }) => {
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
      <Dropdown overlay={langMenu} trigger={['click']} placement="bottom">
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
    ({ key }: { key: string }) => {
      changeNetwork(key as Network)
    },
    [changeNetwork]
  )

  const networkMenu = useMemo(
    () => (
      <Menu onClick={changeNetworkHandler}>
        {AVAILABLE_NETWORKS.map((network: Network) => (
          <Styled.MenuItem key={network}>
            <Styled.MenuItemText>
              <Styled.NetworkLabel network={network}>{network}</Styled.NetworkLabel>
            </Styled.MenuItemText>
          </Styled.MenuItem>
        ))}
      </Menu>
    ),
    [changeNetworkHandler]
  )

  const renderNetworkMenu = useMemo(
    () => (
      <Dropdown overlay={networkMenu} trigger={['click']} placement="bottom">
        <Styled.DropdownContentWrapper>
          <Row style={{ alignItems: 'center' }}>
            <Styled.NetworkLabel network={network}>{network}</Styled.NetworkLabel>
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

  const midgardUrl = useMemo(() => {
    const empty = () => ''
    return FP.pipe(midgardUrlRD, RD.fold(empty, empty, empty, FP.identity))
  }, [midgardUrlRD])

  const [advancedActive, setAdvancedActive] = useState(false)

  return (
    <div className="mt-50px bg-bg0 py-10px px-40px dark:bg-bg0d">
      <CStyled.Collapse
        expandIcon={({ isActive }) => <CStyled.ExpandIcon rotate={isActive ? 90 : 0} />}
        activeKey={collapsed ? '0' : '1'}
        expandIconPosition="end"
        onChange={toggleCollapse}
        ghost>
        <Collapse.Panel
          header={<CStyled.Title>{intl.formatMessage({ id: 'setting.app.title' })}</CStyled.Title>}
          key={'1'}>
          <div className="card my-20px w-full p-[44px]">
            <h1 className="pb-20px font-main text-18 uppercase text-text0 dark:text-text0d">
              {intl.formatMessage({ id: 'common.general' })}
            </h1>
            <Section title={intl.formatMessage({ id: 'common.network' })}>{renderNetworkMenu}</Section>
            <div className="mb-20px flex flex-col items-start">
              <Styled.SubTitle>{intl.formatMessage({ id: 'setting.language' })}</Styled.SubTitle>
              {renderLangMenu}
            </div>
            <div className="flex flex-col items-start">
              <Styled.SubTitle>{intl.formatMessage({ id: 'setting.version' })}</Styled.SubTitle>
              <Styled.Label>v{version}</Styled.Label>
              <BorderButton size="normal" className="my-10px" {...checkUpdatesProps} />
              {renderVersionUpdateResult}
            </div>
          </div>
          <div className="card mb-20px w-full p-40px">
            <TextButton
              className={`mb-0 !p-0 font-main !text-18 uppercase text-text0 dark:text-text0d ${
                advancedActive ? 'opacity-100' : 'opacity-60'
              } mr-10px`}
              onClick={() => setAdvancedActive((v) => !v)}>
              {intl.formatMessage({ id: 'common.advanced' })}
              <SwitchButton className="ml-10px" active={advancedActive} />
            </TextButton>
            {advancedActive && (
              <Section className="mt-20px" title="Midgard">
                <EditableUrl
                  className="w-full xl:w-3/4"
                  url={midgardUrl}
                  onChange={onChangeMidgardUrl}
                  loading={RD.isPending(midgardUrlRD)}
                />
              </Section>
            )}
          </div>
        </Collapse.Panel>
      </CStyled.Collapse>
    </div>
  )
}
