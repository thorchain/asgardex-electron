import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Dropdown, Collapse } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { Locale } from '../../../shared/i18n/types'
import { LOCALES } from '../../i18n'
import { AVAILABLE_NETWORKS } from '../../services/const'
import { CheckMidgardUrlHandler, MidgardUrlRD } from '../../services/midgard/types'
import { CheckThornodeNodeUrlHandler, CheckThornodeRpcUrlHandler } from '../../services/thorchain/types'
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
  checkMidgardUrl$: CheckMidgardUrlHandler
  checkThornodeNodeUrl$: CheckThornodeNodeUrlHandler
  onChangeThornodeNodeUrl: (url: string) => void
  checkThornodeRpcUrl$: CheckThornodeRpcUrlHandler
  thornodeRpcUrl: string
  thornodeNodeUrl: string
  onChangeThornodeRpcUrl: (url: string) => void
}

type SectionProps = {
  title: string
  children?: React.ReactNode
  className?: string
}

const Section: React.FC<SectionProps> = ({ title, className, children }) => (
  <div className={`mb-20px flex flex-col items-start last:mb-0 ${className}`}>
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
    onChangeMidgardUrl,
    checkMidgardUrl$,
    onChangeThornodeNodeUrl,
    checkThornodeNodeUrl$,
    checkThornodeRpcUrl$,
    onChangeThornodeRpcUrl,
    thornodeRpcUrl,
    thornodeNodeUrl
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
      <Menu
        onClick={changeLang}
        items={FP.pipe(
          LOCALES,
          A.map<Locale, ItemType>((l: Locale) => ({
            label: (
              <div
                className={`dark:text-1 flex items-center py-[8px] px-10px font-main text-16 uppercase text-text1 dark:text-text1d ${
                  l === locale ? 'font-mainSemiBold' : 'font-main'
                }`}>
                {l}
              </div>
            ),
            key: l
          }))
        )}
      />
    ),
    [changeLang, locale]
  )

  const renderLangMenu = useMemo(
    () => (
      <Dropdown overlay={langMenu} trigger={['click']} placement="bottom">
        <div className="flex cursor-pointer justify-center ">
          <h3 className={`font-main text-16 uppercase text-text1 dark:text-text1d`}>{locale}</h3>
          <DownIcon />
        </div>
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

  const networkTextColor = useCallback((network: Network) => {
    switch (network) {
      case 'mainnet':
        return 'text-turquoise'
      case 'stagenet':
        return 'text-error1 dark:text-error1d'
      case 'testnet':
        return 'text-warning0 dark:text-warning0'
      default:
        return 'text-text2 dark:text-text2'
    }
  }, [])

  const networkMenu = useMemo(() => {
    return (
      <Menu
        onClick={changeNetworkHandler}
        items={FP.pipe(
          AVAILABLE_NETWORKS,
          A.map<Network, ItemType>((n: Network) => ({
            label: (
              <div
                className={`flex items-center py-[8px] px-10px ${networkTextColor(n)} text-16 uppercase ${
                  n === network ? 'font-mainSemiBold' : 'font-main'
                }`}>
                {n}
              </div>
            ),
            key: n
          }))
        )}
      />
    )
  }, [changeNetworkHandler, network, networkTextColor])

  const renderNetworkMenu = useMemo(
    () => (
      <Dropdown overlay={networkMenu} trigger={['click']} placement="bottom">
        <div className="flex cursor-pointer justify-center ">
          <h3 className={`font-main text-16 uppercase ${networkTextColor(network)}`}>{network}</h3>
          <DownIcon />
        </div>
      </Dropdown>
    ),
    [networkMenu, networkTextColor, network]
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
            <Section title={intl.formatMessage({ id: 'setting.language' })}>{renderLangMenu}</Section>
            <Section title={intl.formatMessage({ id: 'setting.version' })}>
              <>
                <Styled.Label>v{version}</Styled.Label>
                <BorderButton size="normal" className="mt-10px" {...checkUpdatesProps} />
                {renderVersionUpdateResult}
              </>
            </Section>
          </div>
          <div className="card mb-20px w-full p-40px">
            <div className="flex items-center">
              <TextButton
                className={`mb-0 !py-0 !pr-10px !pl-0  font-main !text-18 uppercase text-text0 dark:text-text0d ${
                  advancedActive ? 'opacity-100' : 'opacity-60'
                }`}
                onClick={() => setAdvancedActive((v) => !v)}>
                {intl.formatMessage({ id: 'common.advanced' })}
              </TextButton>
              <SwitchButton active={advancedActive} onChange={(active) => setAdvancedActive(active)}></SwitchButton>
            </div>
            {advancedActive && (
              <>
                <Section className="mt-20px" title="Midgard">
                  <EditableUrl
                    className="w-full xl:w-3/4"
                    url={midgardUrl}
                    onChange={onChangeMidgardUrl}
                    loading={RD.isPending(midgardUrlRD)}
                    checkUrl$={checkMidgardUrl$}
                    successMsg={intl.formatMessage({ id: 'midgard.url.valid' })}
                  />
                </Section>
                <Section title="THORNode API">
                  <EditableUrl
                    className="w-full xl:w-3/4"
                    url={thornodeNodeUrl}
                    onChange={onChangeThornodeNodeUrl}
                    checkUrl$={checkThornodeNodeUrl$}
                    successMsg={intl.formatMessage({ id: 'setting.thornode.node.valid' })}
                  />
                </Section>
                <Section title="THORNode RPC">
                  <EditableUrl
                    className="w-full xl:w-3/4"
                    url={thornodeRpcUrl}
                    onChange={onChangeThornodeRpcUrl}
                    checkUrl$={checkThornodeRpcUrl$}
                    successMsg={intl.formatMessage({ id: 'setting.thornode.rpc.valid' })}
                  />
                </Section>
              </>
            )}
          </div>
        </Collapse.Panel>
      </CStyled.Collapse>
    </div>
  )
}
