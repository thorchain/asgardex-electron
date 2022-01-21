import React, { useMemo } from 'react'

import { Menu } from 'antd'
import { useIntl } from 'react-intl'
import { useRouteMatch, Link } from 'react-router-dom'

import * as walletRoutes from '../../../routes/wallet'
import * as Styled from './AssetsNav.styles'

enum MenuKey {
  ASSETS = 'assets',
  POOLSHARES = 'poolshares',
  BONDS = 'bonds',
  HISTORY = 'history',
  WALLETSETTINGS = 'walletsettings',
  UNKNOWN = 'unknown'
}

type MenuType = {
  key: MenuKey
  label: string
  path: string
}

export const AssetsNav: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const menuItems = useMemo(
    () =>
      [
        {
          key: MenuKey.ASSETS,
          label: intl.formatMessage({ id: 'common.assets' }),
          path: walletRoutes.assets.path()
        },
        {
          key: MenuKey.POOLSHARES,
          label: intl.formatMessage({ id: 'wallet.nav.poolshares' }),
          path: walletRoutes.poolShares.path()
        },
        {
          key: MenuKey.BONDS,
          label: intl.formatMessage({ id: 'wallet.nav.bonds' }),
          path: walletRoutes.bonds.path()
        },
        {
          key: MenuKey.HISTORY,
          label: intl.formatMessage({ id: 'common.history' }),
          path: walletRoutes.history.path()
        },
        {
          key: MenuKey.WALLETSETTINGS,
          label: intl.formatMessage({ id: 'common.settings' }),
          path: walletRoutes.walletSettings.path()
        }
      ] as MenuType[],
    [intl]
  )

  const assetsRoute = useRouteMatch(walletRoutes.assets.path())
  const poolSharesRoute = useRouteMatch(walletRoutes.poolShares.path())
  const bondsRoute = useRouteMatch(walletRoutes.bonds.path())
  const matchHistoryRoute = useRouteMatch(walletRoutes.history.path())
  const matchWalletSettingsRoute = useRouteMatch(walletRoutes.walletSettings.path())

  const activeMenu: MenuKey = useMemo(() => {
    if (assetsRoute) {
      return MenuKey.ASSETS
    } else if (poolSharesRoute) {
      return MenuKey.POOLSHARES
    } else if (bondsRoute) {
      return MenuKey.BONDS
    } else if (matchHistoryRoute) {
      return MenuKey.HISTORY
    } else if (matchWalletSettingsRoute) {
      return MenuKey.WALLETSETTINGS
    } else {
      return MenuKey.UNKNOWN
    }
  }, [assetsRoute, poolSharesRoute, bondsRoute, matchHistoryRoute, matchWalletSettingsRoute])

  return (
    <>
      <Styled.MenuDropdownGlobalStyles />
      <Styled.Menu mode="horizontal" selectedKeys={[activeMenu]} triggerSubMenuAction={'click'}>
        {menuItems.map(({ key, label, path }) => (
          <Menu.Item key={key}>
            <Link to={path}>{label}</Link>
          </Menu.Item>
        ))}
      </Styled.Menu>
    </>
  )
}
