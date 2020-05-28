import React, { useMemo, useState } from 'react'

import { Row, Col, Tabs, Grid } from 'antd'
import { useObservableState } from 'observable-hooks'
import { useRouteMatch, Link } from 'react-router-dom'
import { palette, size } from 'styled-theme'

import { ReactComponent as CloseIcon } from '../../assets/svg/icon-close.svg'
import { ReactComponent as MenuIcon } from '../../assets/svg/icon-menu.svg'
import { ReactComponent as StakeIcon } from '../../assets/svg/icon-stake.svg'
import { ReactComponent as SwapIcon } from '../../assets/svg/icon-swap.svg'
import { ReactComponent as WalletIcon } from '../../assets/svg/icon-wallet.svg'
import { ReactComponent as AsgardexLogo } from '../../assets/svg/logo-asgardex.svg'
import { useThemeContext } from '../../contexts/ThemeContext'
import * as stakeRoutes from '../../routes/stake'
import * as swapRoutes from '../../routes/swap'
import * as walletRoutes from '../../routes/wallet'
import { HeaderContainer, TabLink, HeaderDrawer, HeaderDrawerItem } from './Header.style'
import HeaderLang from './HeaderLang'
import HeaderLock from './HeaderLock'
import HeaderNetStatus from './HeaderNetStatus'
import HeaderSettings from './HeaderSettings'
import HeaderTheme from './HeaderTheme'

enum TabKey {
  SWAP = 'swap',
  STAKE = 'stake',
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
  const isDesktopView = Grid.useBreakpoint().lg

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  const closeMenu = () => {
    setMenuVisible(false)
  }

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
      return TabKey.UNKNOWN
    }
  }, [matchStakeRoute, matchSwapRoute, matchWalletRoute])

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
                  <HeaderTheme />
                  <HeaderSettings />
                  <HeaderLock />
                  <HeaderLang />
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
              <HeaderTheme />
            </HeaderDrawerItem>
            <HeaderDrawerItem>
              <HeaderLock onPress={() => closeMenu()} />
            </HeaderDrawerItem>
            <HeaderDrawerItem>
              <HeaderSettings onPress={() => closeMenu()} />
            </HeaderDrawerItem>
            <HeaderDrawerItem>
              <HeaderLang />
            </HeaderDrawerItem>
            <HeaderNetStatus />
          </HeaderDrawer>
        )}
      </>
    </HeaderContainer>
  )
}

export default Header
