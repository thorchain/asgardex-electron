import React, { useMemo, useState, useCallback, useRef } from 'react'

import { Row, Col, Grid } from 'antd'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useMatch, Link, useNavigate, useLocation } from 'react-router-dom'
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
import { InboundAddressRD, MidgardUrlRD, PriceRD, SelectedPricePoolAsset } from '../../services/midgard/types'
import { MimirRD } from '../../services/thorchain/types'
import { ChangeKeystoreWalletHandler, KeystoreState, KeystoreWalletsUI } from '../../services/wallet/types'
import { isLocked } from '../../services/wallet/util'
import { PricePoolAsset, PricePoolAssets, PricePools } from '../../views/pools/Pools.types'
import * as Styled from './HeaderComponent.styles'
import { HeaderLock } from './lock/'
import { HeaderLockMobile } from './lock/HeaderLockMobile'
import { HeaderNetStatus } from './netstatus'
import { HeaderPriceSelector } from './price'
import { HeaderSettings } from './settings'
import { HeaderStats } from './stats/HeaderStats'
import { HeaderTheme } from './theme'

enum TabKey {
  POOLS = 'POOLS',
  WALLET = 'WALLET',
  UNKNOWN = 'UNKNOWN'
}

type Tab = {
  key: TabKey
  label: string
  path: string
  icon: typeof SwapIcon // all icon types are as same as `SwapIcon`
}

export type Props = {
  keystore: KeystoreState
  wallets: KeystoreWalletsUI
  network: Network
  lockHandler: FP.Lazy<void>
  changeWalletHandler$: ChangeKeystoreWalletHandler
  setSelectedPricePool: (asset: PricePoolAsset) => void
  pricePools: O.Option<PricePools>
  runePrice: PriceRD
  reloadRunePrice: FP.Lazy<void>
  volume24Price: PriceRD
  reloadVolume24Price: FP.Lazy<void>
  selectedPricePoolAsset: SelectedPricePoolAsset
  inboundAddresses: InboundAddressRD
  mimir: MimirRD
  midgardUrl: MidgardUrlRD
  thorchainNodeUrl: string
  thorchainRpcUrl: string
}

export const HeaderComponent: React.FC<Props> = (props): JSX.Element => {
  const {
    keystore,
    wallets,
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
    changeWalletHandler$,
    setSelectedPricePool,
    midgardUrl: midgardUrlRD,
    thorchainNodeUrl,
    thorchainRpcUrl
  } = props

  const intl = useIntl()

  const navigate = useNavigate()
  const location = useLocation()

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

  const toggleMenu = useCallback(() => {
    setMenuVisible(!menuVisible)
  }, [menuVisible])

  const closeMenu = useCallback(() => {
    if (!isDesktopView) {
      setMenuVisible(false)
    }
  }, [isDesktopView])

  const matchPoolsRoute = useMatch({ path: poolsRoutes.base.path(), end: false })
  const matchWalletRoute = useMatch({ path: walletRoutes.base.path(), end: false })

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

  const renderMainNav = useMemo(
    () => (
      <div className="flex h-full flex-row">
        {items.map(({ label, key, path, icon: Icon }) => {
          const selected = activeKey === key
          return (
            <div
              key={key}
              className={`
                  flex
                  h-full cursor-pointer items-center
                  justify-center border-y-[3px] border-solid border-transparent
                  hover:border-b-turquoise
                  focus-visible:outline-none
                   ${selected ? 'border-b-turquoise' : 'border-b-transparent'}
                  mr-20px pl-10px pr-15px
              font-mainBold text-18
              uppercase transition duration-300
              ease-in-out
              ${selected ? 'text-turquoise' : 'text-text2 dark:text-text2d'}
            hover:text-turquoise
              `}
              onClick={() => navigate(path)}>
              <div className="flex flex-row items-center">
                <Icon className="pr-5px" />
                <span className="">{label}</span>
              </div>
            </div>
          )
        })}
      </div>
    ),
    [activeKey, items, navigate]
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
    navigate(appRoutes.settings.path())
  }, [closeMenu, navigate])

  const clickLockHandler = useCallback(() => {
    // lock if needed ...
    if (!isLocked(keystore)) {
      lockHandler()
    } else {
      // ... or go to wallet page to unlock
      navigate(walletRoutes.base.path(location.pathname))
    }
    closeMenu()
  }, [keystore, closeMenu, lockHandler, navigate, location.pathname])

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
        midgardUrl={midgardUrlRD}
        thorchainNodeUrl={thorchainNodeUrl}
        thorchainRpcUrl={thorchainRpcUrl}
      />
    ),
    [inboundAddressRD, isDesktopView, midgardUrlRD, mimirRD, thorchainNodeUrl, thorchainRpcUrl]
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

  const renderLogo = useMemo(
    () => (
      <Styled.LogoWrapper>
        <Styled.AsgardexLogo />
        <Styled.NetworkLabel network={network}>{network}</Styled.NetworkLabel>
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
              {renderMainNav}
              <Col>
                <Row align="middle">
                  {renderHeaderNetStatus}
                  <HeaderTheme isDesktopView={isDesktopView} />
                  {renderHeaderCurrency}
                  <HeaderLock
                    keystoreState={keystore}
                    wallets={wallets}
                    lockHandler={clickLockHandler}
                    changeWalletHandler$={changeWalletHandler$}
                  />
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
            <Styled.HeaderDrawerItem>
              <HeaderLockMobile keystoreState={keystore} onPress={clickLockHandler} />
            </Styled.HeaderDrawerItem>
            <Styled.HeaderDrawerItem>{renderHeaderSettings}</Styled.HeaderDrawerItem>
            {renderHeaderNetStatus}
          </Styled.HeaderDrawer>
        )}
      </Styled.HeaderContainer>
    </>
  )
}
