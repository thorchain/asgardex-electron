import React, { useMemo, useState, useCallback, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Row, Col, Tabs, Grid, Space } from 'antd'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useRouteMatch, Link } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import { palette, size } from 'styled-theme'

import { Network } from '../../../shared/api/types'
import { ReactComponent as CloseIcon } from '../../assets/svg/icon-close.svg'
import { ReactComponent as MenuIcon } from '../../assets/svg/icon-menu.svg'
import { ReactComponent as SwapIcon } from '../../assets/svg/icon-swap.svg'
import { ReactComponent as WalletIcon } from '../../assets/svg/icon-wallet.svg'
import { useThemeContext } from '../../contexts/ThemeContext'
import * as appRoutes from '../../routes/app'
import * as poolsRoutes from '../../routes/pools'
import * as walletRoutes from '../../routes/wallet'
import { InboundAddressRD, PriceRD, SelectedPricePoolAsset } from '../../services/midgard/types'
import { MimirRD } from '../../services/thorchain/types'
import { KeystoreState } from '../../services/wallet/types'
import { isLocked } from '../../services/wallet/util'
import { PricePoolAsset, PricePoolAssets, PricePools } from '../../views/pools/Pools.types'
import * as Styled from './HeaderComponent.styles'
import { HeaderLock } from './lock/'
import { HeaderNetStatus } from './netstatus'
import { HeaderPriceSelector } from './price'
import { HeaderSettings } from './settings'
import { HeaderStats } from './stats/HeaderStats'
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
  network: Network
  lockHandler: FP.Lazy<void>
  setSelectedPricePool: (asset: PricePoolAsset) => void
  pricePools: O.Option<PricePools>
  runePrice: PriceRD
  reloadRunePrice: FP.Lazy<void>
  volume24Price: PriceRD
  reloadVolume24Price: FP.Lazy<void>
  selectedPricePoolAsset: SelectedPricePoolAsset
  inboundAddresses: InboundAddressRD
  mimir: MimirRD
  midgardUrl: RD.RemoteData<Error, string>
  thorchainUrl: string
}

export const HeaderComponent: React.FC<Props> = (props): JSX.Element => {
  const {
    keystore,
    network,
    pricePools: oPricePools,
    runePrice: runePriceRD,
    inboundAddresses: inboundAddressRD,
    mimir: mimirRD,
    reloadRunePrice,
    volume24Price: volume24PriceRD,
    reloadVolume24Price,
    selectedPricePoolAsset: oSelectedPricePoolAsset,
    lockHandler,
    setSelectedPricePool,
    midgardUrl,
    thorchainUrl
  } = props

  const intl = useIntl()

  const history = useHistory()

  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)

  // store previous data to render it while reloading new data
  const prevPricePoolAssets = useRef<PricePoolAssets>()

  const pricePoolAssets = useMemo(() => {
    return FP.pipe(
      oPricePools,
      O.map(A.map((pool) => pool.asset)),
      O.map((assets) => {
        prevPricePoolAssets.current = assets
        return assets
      }),
      O.getOrElse(() => prevPricePoolAssets?.current ?? [])
    )
  }, [oPricePools])

  const hasPricePools = useMemo(() => pricePoolAssets.length > 0, [pricePoolAssets])

  const [menuVisible, setMenuVisible] = useState(false)

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  const isLargeDesktopView = Grid.useBreakpoint()?.xl ?? false

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

  const headerHeight = useMemo(() => size('headerHeight', '70px')({ theme }), [theme])

  const tabs = useMemo(
    () =>
      items.map(({ label, key, path, icon: Icon }) => (
        <Tabs.TabPane
          key={key}
          tab={
            <Styled.TabLink to={path} selected={activeKey === key}>
              <Row align="middle" style={{ height: headerHeight }}>
                <Icon style={{ paddingRight: '5px' }} />
                {label}
              </Row>
            </Styled.TabLink>
          }
        />
      )),
    [items, activeKey, headerHeight]
  )

  const links = useMemo(
    () =>
      items.map(({ label, key, path, icon: Icon }) => (
        <Link key={key} to={path} onClick={closeMenu}>
          <Styled.HeaderDrawerItem selected={activeKey === key}>
            <Icon style={{ marginLeft: '12px', marginRight: '12px' }} />
            {label}
          </Styled.HeaderDrawerItem>
        </Link>
      )),
    [closeMenu, items, activeKey]
  )

  const clickSettingsHandler = useCallback(() => {
    closeMenu()
    history.push(appRoutes.settings.path())
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
        selectedAsset={oSelectedPricePoolAsset}
        assets={pricePoolAssets}
        changeHandler={currencyChangeHandler}
      />
    ),
    [hasPricePools, isDesktopView, oSelectedPricePoolAsset, pricePoolAssets, currencyChangeHandler]
  )

  const renderHeaderLock = useMemo(
    () => <HeaderLock isDesktopView={isDesktopView} keystore={keystore} onPress={clickLockHandler} />,
    [isDesktopView, clickLockHandler, keystore]
  )

  const renderHeaderSettings = useMemo(
    () => <HeaderSettings isDesktopView={isDesktopView} onPress={clickSettingsHandler} />,
    [isDesktopView, clickSettingsHandler]
  )

  const renderHeaderNetStatus = useMemo(
    () => (
      <HeaderNetStatus
        isDesktopView={isDesktopView}
        midgardStatus={inboundAddressRD}
        mimirStatus={mimirRD}
        midgardUrl={midgardUrl}
        thorchainUrl={thorchainUrl}
      />
    ),
    [inboundAddressRD, isDesktopView, midgardUrl, mimirRD, thorchainUrl]
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

  // TODO asgdx-team: Remove `networkLabel` if we go live with mainnet
  const networkLabel = (network: Network) => (network === 'mainnet' ? 'chaosnet' : network)

  const renderLogo = useMemo(
    () => (
      <Styled.LogoWrapper>
        <Styled.AsgardexLogo />
        <Styled.NetworkLabel network={network}>{networkLabel(network)}</Styled.NetworkLabel>
      </Styled.LogoWrapper>
    ),
    [network]
  )
  return (
    <>
      <Styled.HeaderContainer>
        <Row justify="space-between" align="middle" style={{ height: headerHeight }} ref={setHeaderRef}>
          {isDesktopView && (
            <>
              <Col>
                <Row justify="space-between" align="middle" style={{ height: headerHeight }}>
                  {renderLogo}
                  <HeaderStats
                    runePrice={runePriceRD}
                    reloadRunePrice={reloadRunePrice}
                    volume24Price={volume24PriceRD}
                    reloadVolume24Price={reloadVolume24Price}
                  />
                </Row>
              </Col>
              <Col span="auto">
                <Space size={isLargeDesktopView ? 130 : 0}>
                  <Styled.TabsWrapper>
                    <Tabs activeKey={activeKey}>{tabs}</Tabs>
                  </Styled.TabsWrapper>
                  <div></div>
                </Space>
              </Col>
              <Col>
                <Row align="middle">
                  {renderHeaderNetStatus}
                  <HeaderTheme isDesktopView={isDesktopView} />
                  {renderHeaderCurrency}
                  {renderHeaderLock}
                  {renderHeaderSettings}
                </Row>
              </Col>
            </>
          )}
          {!isDesktopView && (
            <>
              <Col>
                <Row align="middle" style={{ height: headerHeight }}>
                  {renderLogo}
                </Row>
              </Col>
              <Col flex={1}>
                <Row>
                  <HeaderStats
                    runePrice={runePriceRD}
                    reloadRunePrice={reloadRunePrice}
                    volume24Price={volume24PriceRD}
                    reloadVolume24Price={reloadVolume24Price}
                  />
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
          <Styled.HeaderDrawer
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
            <Styled.HeaderDrawerItem>{renderHeaderCurrency}</Styled.HeaderDrawerItem>
            <Styled.HeaderDrawerItem>
              <HeaderTheme isDesktopView={isDesktopView} />
            </Styled.HeaderDrawerItem>
            <Styled.HeaderDrawerItem>{renderHeaderLock}</Styled.HeaderDrawerItem>
            <Styled.HeaderDrawerItem>{renderHeaderSettings}</Styled.HeaderDrawerItem>
            {renderHeaderNetStatus}
          </Styled.HeaderDrawer>
        )}
      </Styled.HeaderContainer>
    </>
  )
}
