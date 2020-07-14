import React, { useMemo, useState, useCallback, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Row, Col, Tabs, Grid } from 'antd'
import * as O from 'fp-ts/lib/Option'
import { Option, some } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useRouteMatch, Link } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import { Observable } from 'rxjs'
import { palette, size } from 'styled-theme'

import { ReactComponent as CloseIcon } from '../../assets/svg/icon-close.svg'
import { ReactComponent as MenuIcon } from '../../assets/svg/icon-menu.svg'
import { ReactComponent as SwapIcon } from '../../assets/svg/icon-swap.svg'
import { ReactComponent as WalletIcon } from '../../assets/svg/icon-wallet.svg'
import { ReactComponent as AsgardexLogo } from '../../assets/svg/logo-asgardex.svg'
import { useThemeContext } from '../../contexts/ThemeContext'
import * as poolsRoutes from '../../routes/pools'
import * as walletRoutes from '../../routes/wallet'
import { PoolsStateRD, SelectedPricePoolAsset } from '../../services/midgard/types'
import { KeystoreState } from '../../services/wallet/types'
import { isLocked, hasImportedKeystore } from '../../services/wallet/util'
import { Locale } from '../../shared/i18n/types'
import { PricePoolAsset, PricePoolAssets, PoolAsset } from '../../views/pools/types'
import { HeaderContainer, TabLink, HeaderDrawer, HeaderDrawerItem } from './HeaderComponent.style'
import HeaderLang from './HeaderLang'
import HeaderLock from './HeaderLock'
import HeaderNetStatus from './HeaderNetStatus'
import HeaderPriceSelector from './HeaderPriceSelector'
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

type Props = {
  keystore: KeystoreState
  lockHandler: () => void
  setSelectedPricePool: (asset: PricePoolAsset) => void
  poolsState$: Observable<PoolsStateRD>
  selectedPricePoolAsset$: Observable<SelectedPricePoolAsset>
  locale: Locale
  changeLocale?: (locale: Locale) => void
}

const HeaderComponent: React.FC<Props> = (props): JSX.Element => {
  const {
    keystore,
    poolsState$,
    selectedPricePoolAsset$,
    lockHandler,
    setSelectedPricePool,
    locale,
    changeLocale
  } = props

  const intl = useIntl()

  const history = useHistory()

  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)

  const poolsRD = useObservableState(poolsState$, RD.pending)
  const selectedPricePoolAsset = useObservableState<Option<PricePoolAsset>>(
    selectedPricePoolAsset$,
    some(PoolAsset.RUNE)
  )

  // store previous data to render it while reloading new data
  const prevPricePoolAssets = useRef<PricePoolAssets>()

  const pricePoolAssets = useMemo(() => {
    const pools = RD.toNullable(poolsRD)
    if (!pools) {
      return prevPricePoolAssets?.current ?? []
    }
    const pricePools = O.toNullable(pools.pricePools)
    const assets = (pricePools && pricePools.map((pool) => pool.asset)) || []
    prevPricePoolAssets.current = assets
    return assets
  }, [poolsRD])

  const hasPricePools = useMemo(() => pricePoolAssets.length > 0, [pricePoolAssets])

  const [menuVisible, setMenuVisible] = useState(false)

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const toggleMenu = useCallback(() => {
    setMenuVisible(!menuVisible)
  }, [menuVisible])

  const closeMenu = useCallback(() => {
    if (!isDesktopView) {
      setMenuVisible(false)
    }
  }, [isDesktopView])

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
        {
          key: TabKey.POOLS,
          label: intl.formatMessage({ id: 'pools.title' }),
          path: poolsRoutes.base.path(),
          icon: SwapIcon
        },
        {
          key: TabKey.WALLET,
          label: intl.formatMessage({ id: 'wallet.title' }),
          path: walletRoutes.base.path(),
          icon: WalletIcon
        }
      ] as Tab[],
    [intl]
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
    [closeMenu, items]
  )

  const clickSettingsHandler = useCallback(() => {
    closeMenu()
    history.push(walletRoutes.settings.path())
  }, [closeMenu, history])

  const clickLockHandler = useCallback(() => {
    // lock if needed
    if (!isLocked(keystore)) {
      lockHandler()
      history.push(walletRoutes.locked.path())
    }
    closeMenu()
  }, [closeMenu, history, keystore, lockHandler])

  const currencyChangeHandler = useCallback(
    (asset: PricePoolAsset) => {
      setSelectedPricePool(asset)
    },
    [setSelectedPricePool]
  )

  const renderHeaderCurrency = useMemo(
    () => (
      <HeaderPriceSelector
        disabled={!hasPricePools}
        isDesktopView={isDesktopView}
        selectedAsset={O.toUndefined(selectedPricePoolAsset)}
        assets={pricePoolAssets}
        changeHandler={currencyChangeHandler}
      />
    ),
    [hasPricePools, isDesktopView, selectedPricePoolAsset, pricePoolAssets, currencyChangeHandler]
  )

  const renderHeaderLock = useMemo(
    () => (
      <HeaderLock
        isDesktopView={isDesktopView}
        isLocked={isLocked(keystore)}
        onPress={clickLockHandler}
        disabled={!hasImportedKeystore(keystore)}
      />
    ),
    [isDesktopView, clickLockHandler, keystore]
  )

  const renderHeaderSettings = useMemo(
    () => <HeaderSettings isDesktopView={isDesktopView} onPress={clickSettingsHandler} />,
    [isDesktopView, clickSettingsHandler]
  )

  const renderHeaderLang = useMemo(
    () => <HeaderLang isDesktopView={isDesktopView} locale={locale} changeLocale={changeLocale} />,
    [changeLocale, isDesktopView, locale]
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
                  {renderHeaderCurrency}
                  <HeaderTheme isDesktopView={isDesktopView} />
                  {renderHeaderLock}
                  {renderHeaderSettings}
                  {renderHeaderLang}
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
            style={{
              marginTop: menuVisible ? headerHeight : 0,
              backgroundColor: 'transparent',
              maxHeight: `calc(100% - ${headerHeight})`,
              overflow: 'auto'
            }}
            bodyStyle={{ backgroundColor: 'transparent' }}
            drawerStyle={{ backgroundColor: 'transparent' }}
            maskStyle={{ backgroundColor: 'transparent' }}
            placement="top"
            closable={false}
            height="auto"
            visible={menuVisible}
            key="top">
            {links}
            <HeaderDrawerItem>{renderHeaderCurrency}</HeaderDrawerItem>
            <HeaderDrawerItem>
              <HeaderTheme isDesktopView={isDesktopView} />
            </HeaderDrawerItem>
            <HeaderDrawerItem>{renderHeaderLock}</HeaderDrawerItem>
            <HeaderDrawerItem>{renderHeaderSettings}</HeaderDrawerItem>
            <HeaderDrawerItem>{renderHeaderLang}</HeaderDrawerItem>
            <HeaderNetStatus />
          </HeaderDrawer>
        )}
      </>
    </HeaderContainer>
  )
}

export default HeaderComponent
