import React, { useMemo, useCallback } from 'react'
import { useObservableState } from 'observable-hooks'

import { Select, Row, Col, Tabs } from 'antd'
import { useHistory, useRouteMatch } from 'react-router-dom'
import * as walletRoutes from '../../routes/wallet'
import * as swapRoutes from '../../routes/swap'
import * as stakeRoutes from '../../routes/stake'
import { HeaderContainer, TabLink } from './Header.style'
import { useI18nContext } from '../../contexts/I18nContext'
import { Locale } from '../../i18n/types'
import { LOCALES } from '../../i18n'
import { useThemeContext } from '../../contexts/ThemeContext'
import { palette, size } from 'styled-theme'
import HeaderNetStatus from './HeaderNetStatus'
import { ReactComponent as AsgardexLogo } from '../../assets/svg/logo-asgardex.svg'
import { ReactComponent as SwapIcon } from '../../assets/svg/icon-swap.svg'
import { ReactComponent as StakeIcon } from '../../assets/svg/icon-stake.svg'
import { ReactComponent as WalletIcon } from '../../assets/svg/icon-wallet.svg'
import { ReactComponent as ThemeIcon } from '../../assets/svg/icon-theme-switch.svg'
import { ReactComponent as SettingsIcon } from '../../assets/svg/icon-settings.svg'

enum TabKey {
  SWAP = 'swap',
  STAKE = 'stake',
  WALLET = 'wallet'
}

type Tab = {
  key: TabKey
  label: string
  path: string
  icon: typeof SwapIcon // all icon types are as same as `SwapIcon`
}

type Props = {}

const Header: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const { toggleTheme, theme$ } = useThemeContext()
  const theme = useObservableState(theme$)
  const clickSwitchThemeHandler = () => {
    toggleTheme()
  }

  const { changeLocale, locale$ } = useI18nContext()
  const currentLocale = useObservableState(locale$)

  const matchSwapRoute = useRouteMatch(swapRoutes.base.path())
  const matchStakeRoute = useRouteMatch(stakeRoutes.base.path())
  const matchWalletRoute = useRouteMatch(walletRoutes.base.path())

  const activeKey: TabKey = useMemo(() => {
    if (matchSwapRoute) {
      return TabKey.SWAP
    } else if (matchStakeRoute) {
      return TabKey.STAKE
    } else if (matchWalletRoute) {
      return TabKey.WALLET
    } else {
      return TabKey.SWAP
    }
  }, [matchStakeRoute, matchSwapRoute, matchWalletRoute])

  const clickSettingsHandler = useCallback(() => history.push(walletRoutes.settings.path()), [history])

  const changeLocaleHandler = useCallback(
    (locale: Locale) => {
      changeLocale(locale)
    },
    [changeLocale]
  )

  const items = useMemo(
    () =>
      [
        { key: TabKey.SWAP, label: 'Swap', path: swapRoutes.base.path(), icon: SwapIcon },
        { key: TabKey.STAKE, label: 'Stake', path: stakeRoutes.base.path(), icon: StakeIcon },
        { key: TabKey.WALLET, label: 'Wallet', path: walletRoutes.base.path(), icon: WalletIcon }
      ] as Tab[],
    []
  )

  const headerHeight = useMemo(() => size('headerHeight', '50px')({ theme }), [theme])

  const tabs = useMemo(
    () =>
      items.map(({ label, key, path, icon: Icon }) => (
        <Tabs.TabPane
          key={key}
          tab={
            <TabLink to={path} selected={activeKey === key}>
              <Row align="middle" style={{ height: headerHeight }}>
                <Icon style={{ paddingRight: '5px' }} />
                {label}
              </Row>
            </TabLink>
          }></Tabs.TabPane>
      )),
    [items, activeKey, headerHeight]
  )

  const iconStyle = useMemo(() => ({ color: palette('text', 0)({ theme }), fontSize: '1.5em', marginLeft: '10px' }), [
    theme
  ])

  return (
    <HeaderContainer>
      <Row justify="space-between" align="middle" style={{ height: headerHeight }}>
        <Col>
          <Row justify="space-between" align="middle" style={{ height: headerHeight }}>
            <AsgardexLogo />
            <HeaderNetStatus />
          </Row>
        </Col>
        <Col span="auto">
          <Row justify="center" align="bottom" style={{ height: headerHeight }}>
            <Tabs activeKey={activeKey}>{tabs}</Tabs>
          </Row>
        </Col>
        <Col>
          <Row align="middle" style={{ height: headerHeight }}>
            <Select defaultValue={currentLocale} onChange={changeLocaleHandler} className="select-locale">
              {LOCALES.map((locale: Locale) => (
                <Select.Option value={locale} key={locale}>
                  {locale.toUpperCase()}
                </Select.Option>
              ))}
            </Select>
            <ThemeIcon onClick={clickSwitchThemeHandler} style={iconStyle} />
            <SettingsIcon onClick={clickSettingsHandler} style={iconStyle} />
          </Row>
        </Col>
      </Row>
    </HeaderContainer>
  )
}

export default Header
