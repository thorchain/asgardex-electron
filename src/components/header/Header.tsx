import React, { useMemo, useState, useCallback } from 'react'

import { Row, Col, Tabs, Grid } from 'antd'
import { useObservableState } from 'observable-hooks'
import { useRouteMatch, Link } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import { palette, size } from 'styled-theme'

import { ReactComponent as CloseIcon } from '../../assets/svg/icon-close.svg'
import { ReactComponent as MenuIcon } from '../../assets/svg/icon-menu.svg'
import { ReactComponent as SwapIcon } from '../../assets/svg/icon-swap.svg'
import { ReactComponent as WalletIcon } from '../../assets/svg/icon-wallet.svg'
import { ReactComponent as AsgardexLogo } from '../../assets/svg/logo-asgardex.svg'
import { useThemeContext } from '../../contexts/ThemeContext'
import * as poolsRoutes from '../../routes/pools'
import * as walletRoutes from '../../routes/wallet'
import { HeaderContainer, TabLink, HeaderDrawer, HeaderDrawerItem } from './Header.style'
import HeaderLang from './HeaderLang'
import HeaderLock from './HeaderLock'
import HeaderNetStatus from './HeaderNetStatus'
import HeaderSettings from './HeaderSettings'
import HeaderTheme from './HeaderTheme'

enum TabKey {
  POOLS = 'pools',
  WALLET = 'wallet',
  UNKNOWN = 'unknown'
}

type Tab = {
  key: TabKey
  label: string
  path: string
  icon: typeof SwapIcon // all icon types are as same as `SwapIcon`
}

type Props = {}

const Header: React.FC<Props> = (_): JSX.Element => {
  const [menuVisible, setMenuVisible] = useState(false)
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)
  const history = useHistory()
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  const closeMenu = () => {
    setMenuVisible(false)
  }

  const matchPoolsRoute = useRouteMatch(poolsRoutes.base.path())
  const matchWalletRoute = useRouteMatch(walletRoutes.base.path())

  const activeKey: TabKey = useMemo(() => {
    if (matchPoolsRoute) {
      return TabKey.POOLS
    } else if (matchWalletRoute) {
      return TabKey.WALLET
    } else {
      return TabKey.UNKNOWN
    }
  }, [matchPoolsRoute, matchWalletRoute])

  const items = useMemo(
    () =>
      [
        { key: TabKey.POOLS, label: 'Pools', path: poolsRoutes.base.path(), icon: SwapIcon },
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

  const links = useMemo(
    () =>
      items.map(({ label, key, path, icon: Icon }) => (
        <Link key={key} to={path} onClick={closeMenu}>
          <HeaderDrawerItem>
            <Icon style={{ marginLeft: '12px', marginRight: '12px' }} />
            {label}
          </HeaderDrawerItem>
        </Link>
      )),
    [items]
  )

  const clickSettingsHandler = useCallback(() => {
    if (!isDesktopView) {
      closeMenu()
    }
    history.push(walletRoutes.settings.path())
  }, [history, isDesktopView])

  const iconStyle = { fontSize: '1.5em', marginRight: '20px' }
  const color = useMemo(() => palette('text', 0)({ theme }), [theme])

  return (
    <HeaderContainer>
      <>
        <Row justify="space-between" align="middle" style={{ height: headerHeight }}>
          {isDesktopView && (
            <>
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
                <Row align="middle">
                  <HeaderTheme isDesktopView={isDesktopView} />
                  <HeaderSettings isDesktopView={isDesktopView} onPress={clickSettingsHandler} />
                  <HeaderLock isDesktopView={isDesktopView} />
                  <HeaderLang isDesktopView={isDesktopView} />
                </Row>
              </Col>
            </>
          )}
          {!isDesktopView && (
            <>
              <Col>
                <Row align="middle" style={{ height: headerHeight }}>
                  <AsgardexLogo />
                </Row>
              </Col>
              <Col>
                <Row align="middle" style={{ height: headerHeight, cursor: 'pointer' }} onClick={toggleMenu}>
                  {menuVisible ? (
                    <CloseIcon style={{ color, ...iconStyle }} />
                  ) : (
                    <MenuIcon style={{ color, ...iconStyle }} />
                  )}
                </Row>
              </Col>
            </>
          )}
        </Row>
        {!isDesktopView && (
          <HeaderDrawer
            style={{ marginTop: headerHeight, backgroundColor: 'transparent' }}
            bodyStyle={{ backgroundColor: 'transparent' }}
            drawerStyle={{ backgroundColor: 'transparent' }}
            maskStyle={{ backgroundColor: 'transparent' }}
            placement="top"
            closable={false}
            height="auto"
            visible={menuVisible}
            key="top">
            {links}
            <HeaderDrawerItem>
              <HeaderTheme isDesktopView={isDesktopView} />
            </HeaderDrawerItem>
            <HeaderDrawerItem>
              <HeaderLock onPress={() => closeMenu()} isDesktopView={isDesktopView} />
            </HeaderDrawerItem>
            <HeaderDrawerItem>
              <HeaderSettings onPress={clickSettingsHandler} isDesktopView={isDesktopView} />
            </HeaderDrawerItem>
            <HeaderDrawerItem>
              <HeaderLang isDesktopView={isDesktopView} />
            </HeaderDrawerItem>
            <HeaderNetStatus />
          </HeaderDrawer>
        )}
      </>
    </HeaderContainer>
  )
}

export default Header
