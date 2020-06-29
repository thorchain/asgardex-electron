import React from 'react'

import { Menu } from 'antd'
import { Link, useLocation } from 'react-router-dom'

import * as walletRoutes from '../../routes/wallet'
import { StyledMenu } from './WalletViewNav.style'

export const WalletViewNav: React.FC = (): JSX.Element => {
  const location = useLocation()

  return (
    <StyledMenu mode="horizontal" selectedKeys={[location.pathname]}>
      <Menu.Item key="/wallet/assets">
        <Link to={walletRoutes.assets.path()}>Assets</Link>
      </Menu.Item>
      <Menu.Item key="/wallet/stakes">
        <Link to={walletRoutes.stakes.path()}>Stakes</Link>
      </Menu.Item>
      <Menu.Item key="/wallet/bonds">
        <Link to={walletRoutes.bonds.path()}>Bonds</Link>
      </Menu.Item>
    </StyledMenu>
  )
}
export default WalletViewNav
