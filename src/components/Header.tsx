import React, { useMemo, useCallback } from 'react'
import { useObservableState } from 'observable-hooks'

import { Select, Row, Col, Tabs } from 'antd'
import { CheckCircleOutlined, MinusCircleOutlined, AlertOutlined, SettingOutlined } from '@ant-design/icons'
import { useHistory, useRouteMatch } from 'react-router-dom'
import * as walletRoutes from '../routes/wallet'
import * as swapRoutes from '../routes/swap'
import * as stakeRoutes from '../routes/stake'
import { useConnectionContext, OnlineStatus } from '../contexts/ConnectionContext'
import { HeaderContainer, TabLink } from './Header.style'
import { useI18nContext } from '../contexts/I18nContext'
import { Locale } from '../i18n/types'
import { LOCALES } from '../i18n'
import { useThemeContext } from '../contexts/ThemeContext'
import { palette, size } from 'styled-theme'
import { ReactComponent as AsgardexLogo } from '../assets/svg/logo-asgardex.svg'
import { ReactComponent as SwapIcon } from '../assets/svg/icon-swap.svg'
import { ReactComponent as StakeIcon } from '../assets/svg/icon-stake.svg'
import { ReactComponent as WalletIcon } from '../assets/svg/icon-wallet.svg'

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

  const connection$ = useConnectionContext()
  const onlineStatus = useObservableState<OnlineStatus>(connection$)

  const { changeLocale, locale$ } = useI18nContext()
  const currentLocale = useObservableState(locale$)

  const isOnline = onlineStatus === OnlineStatus.ON

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

  const tabs = useMemo(
    () =>
      items.map(({ label, key, path, icon: Icon }) => (
        <Tabs.TabPane
          key={key}
          tab={
            <TabLink to={path}>
              <Row align="middle" style={{ height: size('headerHeight', '50px')({ theme }) }}>
                <Icon style={{ paddingRight: '5px' }} />
                {label}
              </Row>
            </TabLink>
          }></Tabs.TabPane>
      )),
    [items, theme]
  )

  const iconStyle = useMemo(() => ({ color: palette('text', 0)({ theme }), fontSize: '1.5em' }), [theme])

  return (
    <HeaderContainer>
      <Row justify="space-between" align="middle">
        <Col span={6}>
          <Row justify="space-between" align="middle">
            <AsgardexLogo />
            <h2>Net</h2>
          </Row>
        </Col>
        <Col span={12}>
          <Row justify="center" align="bottom">
            <Tabs activeKey={activeKey}>{tabs}</Tabs>
          </Row>
        </Col>
        <Col span={6}>
          <Row align="middle" gutter={10}>
            <Col>
              <Select defaultValue={currentLocale} onChange={changeLocaleHandler} className="select-locale">
                {LOCALES.map((locale: Locale) => (
                  <Select.Option value={locale} key={locale}>
                    {locale.toUpperCase()}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col>
              {isOnline && <CheckCircleOutlined style={{ color: '#a0d911', fontSize: '1.5em' }} />}
              {!isOnline && <MinusCircleOutlined style={{ color: '#ffa940', fontSize: '1.5em' }} />}
            </Col>
            <Col>
              <AlertOutlined onClick={clickSwitchThemeHandler} style={iconStyle} />
            </Col>
            <Col>
              <SettingOutlined onClick={clickSettingsHandler} style={iconStyle} />
            </Col>
          </Row>
        </Col>
      </Row>
    </HeaderContainer>
  )
}

export default Header
