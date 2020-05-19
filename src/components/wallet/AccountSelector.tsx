import React, { useState, useEffect } from 'react'
import DynamicCoin from '../shared/icons/DynamicCoin'
import { UserAssetType } from '../../types/wallet'
import { shortSymbol } from '../../helpers/tokenHelpers'

import { Menu, Dropdown, Button, Card, Typography } from 'antd'
import { DownOutlined } from '@ant-design/icons'
const { Title } = Typography
// Multi-use 'account selector' component will have a data context
// Dummy data
const UserAssets: UserAssetType[] = [
  { _id: '1', free: 99, frozen: 11, locked: 21, symbol: 'BNB-JST', name: 'Binance', value: 0.99 },
  { _id: '2', free: 1034, frozen: 38, locked: 101, symbol: 'RUNE-1E0', name: 'Rune', value: 0.25 }
]

type Props = { symbol?: string; onChange?: Function; size?: string }
const AccountSelector: React.FC<Props> = ({ symbol, onChange, size }): JSX.Element => {
  const [symb, setSymb] = useState<string>(symbol || UserAssets[0].symbol)
  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange(symb)
    }
  }, [symb, onChange])
  const menu = () => (
    <Menu>
      {UserAssets.map((asset: UserAssetType, i: number) => (
        <Menu.Item key={i} onClick={() => setSymb(asset.symbol)}>
          <div style={{ display: 'flex' }}>
            <div>{shortSymbol(asset.symbol)}</div>&nbsp;
            <div>NAME..</div>&nbsp;
            <div style={{ marginLeft: 'auto' }}>({asset.free})</div>
          </div>
        </Menu.Item>
      ))}
    </Menu>
  )
  return (
    <Card bordered={false} bodyStyle={{ padding: '6px' }}>
      <div style={{ display: 'flex' }}>
        <div>
          <DynamicCoin type={symb} size={size || 'normal'} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Title level={4} style={{ marginLeft: '18px', marginBottom: '0' }}>
            {shortSymbol(symb)}
          </Title>

          <Dropdown overlay={menu} trigger={['click']}>
            <Button type="link">
              Change <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>
    </Card>
  )
}

export default AccountSelector
