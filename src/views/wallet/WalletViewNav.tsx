import React from 'react'

import { Menu } from 'antd'
import { Link } from 'react-router-dom'

import * as walletRoutes from '../../routes/wallet'

export const WalletViewNav: React.FC = (): JSX.Element => {
  return (
    <Menu mode="horizontal">
      <Menu.Item key={0}>
        <Link to={walletRoutes.assets.path()}>Assets</Link>
      </Menu.Item>
      <Menu.Item key={1}>
        <Link to={walletRoutes.stakes.path()}>Stakes</Link>
      </Menu.Item>
      <Menu.Item key={2}>
        <Link to={walletRoutes.bonds.path()}>Bonds</Link>
      </Menu.Item>
    </Menu>
  )
}
export default WalletViewNav
