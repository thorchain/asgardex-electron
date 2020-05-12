import React from 'react'
import { Link } from 'react-router-dom'
import { walletBondsRoute, walletStakesRoute, walletAssetsRoute } from '../../routes'
import { Menu } from 'antd'
export const WalletViewNav: React.FC = (): JSX.Element => {
  return (
    <Menu mode="horizontal">
      <Menu.Item key={0}>
        <Link to={walletAssetsRoute.path()}>Assets</Link>
      </Menu.Item>
      <Menu.Item key={1}>
        <Link to={walletStakesRoute.path()}>Stakes</Link>
      </Menu.Item>
      <Menu.Item key={2}>
        <Link to={walletBondsRoute.path()}>Bonds</Link>
      </Menu.Item>
    </Menu>
  )
}
export default WalletViewNav
