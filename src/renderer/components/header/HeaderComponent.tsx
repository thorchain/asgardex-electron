import React, { useMemo, useState, useCallback, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Row, Col, Tabs, Grid } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useRouteMatch, Link } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import { Observable } from 'rxjs'
import { palette, size } from 'styled-theme'

import { Network } from '../../../shared/api/types'
import { Locale } from '../../../shared/i18n/types'
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
import { isLocked } from '../../services/wallet/util'
import { PricePoolAsset, PricePoolAssets } from '../../views/pools/Pools.types'
import { HeaderContainer, TabLink, HeaderDrawer, HeaderDrawerItem } from './HeaderComponent.style'
import { HeaderLang } from './lang'
import { HeaderLock } from './lock/'
import { HeaderNetStatus } from './netstatus'
import { HeaderNetworkSelector } from './network'
import { HeaderPriceSelector } from './price'
import { HeaderSettings } from './settings'
import { HeaderTheme } from './theme'

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
  lockHandler: FP.Lazy<void>
  setSelectedPricePool: (asset: PricePoolAsset) => void
  poolsState$: Observable<PoolsStateRD>
  selectedPricePoolAsset$: Observable<SelectedPricePoolAsset>
  locale: Locale
  changeLocale?: (locale: Locale) => void
  selectedNetwork: Network
  changeNetwork: (network: Network) => void
  midgardUrl: O.Option<string>
  binanceUrl: O.Option<string>
  bitcoinUrl: O.Option<string>
  thorchainUrl: O.Option<string>
  litecoinUrl: O.Option<string>
}

export const HeaderComponent: React.FC<Props> = (props): JSX.Element => {
  const {
    keystore,
    poolsState$,
    selectedPricePoolAsset$,
    lockHandler,
    setSelectedPricePool,
    locale,
    changeLocale,
    midgardUrl,
    binanceUrl,
    bitcoinUrl,
    thorchainUrl,
    litecoinUrl,
    selectedNetwork,
    changeNetwork
  } = props

  const intl = useIntl()

  const history = useHistory()

  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)

  const poolsRD = useObservableState(poolsState$, RD.pending)
  const selectedPricePoolAsset = useObservableState<SelectedPricePoolAsset>(selectedPricePoolAsset$, O.none)

  // store previous data to render it while reloading new data
  const prevPricePoolAssets = useRef<PricePoolAssets>()

  // TODO (@Veado) Use `usePricePools` in parent view to provide pricePools
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

  const items: Tab[] = useMemo(
    () => [
      {
        key: TabKey.POOLS,
        label: intl.formatMessage({ id: 'common.pools' }),
        path: poolsRoutes.base.path(),
        icon: SwapIcon
      },
      {
        key: TabKey.WALLET,
        label: intl.formatMessage({ id: 'common.wallet' }),
        path: walletRoutes.base.path(),
        icon: WalletIcon
      }
    ],
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
          }
        />
      )),
    [items, activeKey, headerHeight]
  )

  const links = useMemo(
    () =>
      items.map(({ label, key, path, icon: Icon }) => (
        <Link key={key} to={path} onClick={closeMenu}>
          <HeaderDrawerItem selected={activeKey === key}>
            <Icon style={{ marginLeft: '12px', marginRight: '12px' }} />
            {label}
          </HeaderDrawerItem>
        </Link>
      )),
    [closeMenu, items, activeKey]
  )

  const clickSettingsHandler = useCallback(() => {
    closeMenu()
    history.push(walletRoutes.settings.path())
  }, [closeMenu, history])

  const clickLockHandler = useCallback(() => {
    // lock if needed ...
    if (!isLocked(keystore)) {
      lockHandler()
    } else {
      // ... or go to wallet page to unlock
      history.push(walletRoutes.base.path())
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
        selectedAsset={selectedPricePoolAsset}
        assets={pricePoolAssets}
        changeHandler={currencyChangeHandler}
      />
    ),
    [hasPricePools, isDesktopView, selectedPricePoolAsset, pricePoolAssets, currencyChangeHandler]
  )

  const renderHeaderLock = useMemo(
    () => <HeaderLock isDesktopView={isDesktopView} keystore={keystore} onPress={clickLockHandler} />,
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

  const renderHeaderNetwork = useMemo(
    () => (
      <HeaderNetworkSelector
        isDesktopView={isDesktopView}
        selectedNetwork={selectedNetwork}
        changeNetwork={changeNetwork}
      />
    ),
    [selectedNetwork, changeNetwork, isDesktopView]
  )

  const renderHeaderNetStatus = useMemo(
    () => (
      <HeaderNetStatus
        isDesktopView={isDesktopView}
        midgardUrl={midgardUrl}
        binanceUrl={binanceUrl}
        bitcoinUrl={bitcoinUrl}
        thorchainUrl={thorchainUrl}
        litecoinUrl={litecoinUrl}
      />
    ),
    [binanceUrl, bitcoinUrl, isDesktopView, midgardUrl, thorchainUrl, litecoinUrl]
  )

  const iconStyle = { fontSize: '1.5em', marginRight: '20px' }
  const color = useMemo(() => palette('text', 0)({ theme }), [theme])

  const headerRef = useRef<O.Option<HTMLElement>>(O.none)
  const setHeaderRef = useCallback((ref: HTMLElement | null) => {
    headerRef.current = O.fromNullable(ref)
  }, [])

  /**
   * To display HeaderDrawer component right(!) after the Header one
   * we need to check Header's bottom-edge position. In case there is something
   * above the Header component at the layout (e.g. AppUpdate component) relying
   * just on the Header's height is not enough.
   */
  const getHeaderBottomPosition = useCallback(
    () =>
      FP.pipe(
        headerRef.current,
        O.map((header) => header.getBoundingClientRect().bottom),
        // `headerHeight ` is styled-components based property and can contain "px" at the string value
        // and parsingInt will get ONLY meaningful integer value
        O.getOrElse(() => parseInt(headerHeight, 10))
      ),
    [headerHeight]
  )

  return (
    <>
      <HeaderContainer>
        <Row justify="space-between" align="middle" style={{ height: headerHeight }} ref={setHeaderRef}>
          {isDesktopView && (
            <>
              <Col>
                <Row justify="space-between" align="middle" style={{ height: headerHeight }}>
                  <AsgardexLogo />
                  {renderHeaderNetStatus}
                  <HeaderTheme isDesktopView={isDesktopView} />
                </Row>
              </Col>
              <Col span="auto">
                <Row justify="center" align="bottom" style={{ height: headerHeight }}>
                  <Tabs activeKey={activeKey}>{tabs}</Tabs>
                </Row>
              </Col>
              <Col>
                <Row align="middle">
                  {renderHeaderLang}
                  {renderHeaderCurrency}
                  {renderHeaderLock}
                  {renderHeaderNetwork}
                  {renderHeaderSettings}
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
              marginTop: getHeaderBottomPosition(),
              backgroundColor: 'transparent',
              maxHeight: `calc(100% - ${getHeaderBottomPosition()}px)`,
              overflow: 'auto'
            }}
            drawerStyle={{ backgroundColor: 'transparent' }}
            maskStyle={{ backgroundColor: 'transparent' }}
            placement="top"
            closable={false}
            height="auto"
            visible={menuVisible}
            key="top">
            {links}
            <HeaderDrawerItem>{renderHeaderLang}</HeaderDrawerItem>
            <HeaderDrawerItem>{renderHeaderCurrency}</HeaderDrawerItem>
            <HeaderDrawerItem>{renderHeaderNetwork}</HeaderDrawerItem>
            <HeaderDrawerItem>
              <HeaderTheme isDesktopView={isDesktopView} />
            </HeaderDrawerItem>
            <HeaderDrawerItem>{renderHeaderLock}</HeaderDrawerItem>
            <HeaderDrawerItem>{renderHeaderSettings}</HeaderDrawerItem>
            {renderHeaderNetStatus}
          </HeaderDrawer>
        )}
      </HeaderContainer>
    </>
  )
}
