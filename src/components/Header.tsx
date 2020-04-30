import React, { useMemo, useCallback } from 'react'

import { Layout, Menu } from 'antd'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { walletHomeRoute, swapHomeRoute, stakeHomeRoute } from '../routes'

type Props = {}

enum MENU_ITEM_KEY {
  SWAP = 'swap',
  STAKE = 'stake',
  WALLET = 'wallet'
}

type MenuItem = {
  key: MENU_ITEM_KEY
  label: string
  path: string
}

const Header: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const matchSwapRoute = useRouteMatch(swapHomeRoute.path())
  const matchStakeRoute = useRouteMatch(stakeHomeRoute.path())
  const matchWalletRoute = useRouteMatch(walletHomeRoute.path())

  const activeKey: MENU_ITEM_KEY = useMemo(() => {
    if (matchSwapRoute) {
      return MENU_ITEM_KEY.SWAP
    } else if (matchStakeRoute) {
      return MENU_ITEM_KEY.STAKE
    } else if (matchWalletRoute) {
      return MENU_ITEM_KEY.WALLET
    } else {
      return MENU_ITEM_KEY.SWAP
    }
  }, [matchStakeRoute, matchSwapRoute, matchWalletRoute])

  const itemClickHandler = useCallback(
    (path: string) => {
      history.push(path)
    },
    [history]
  )

  const items = useMemo(
    () =>
      [
        { key: MENU_ITEM_KEY.SWAP, label: 'Swap', path: swapHomeRoute.path() },
        { key: MENU_ITEM_KEY.STAKE, label: 'Stake', path: stakeHomeRoute.path() },
        { key: MENU_ITEM_KEY.WALLET, label: 'Wallet', path: walletHomeRoute.path() }
      ] as MenuItem[],
    []
  )

  return (
    <Layout.Header>
      <Menu selectedKeys={[activeKey]} theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
        {items.map(({ label, path, key }) => {
          return (
            <Menu.Item key={key} onClick={() => itemClickHandler(path)}>
              {label}
            </Menu.Item>
          )
        })}
      </Menu>
    </Layout.Header>
  )
}

export default Header
