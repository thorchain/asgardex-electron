import React, { useCallback } from 'react'

import { Asset } from '@thorchain/asgardex-util'
import { Menu, Dropdown } from 'antd'

import { Size as CoinSize } from '../../components/uielements/assets/assetIcon/types'
import Label from '../../components/uielements/label'
import AssetIcon from '../uielements/assets/assetIcon'
import { StyledCard, AssetWrapper, AssetInfoWrapper, AssetTitle } from './AccountSelector.style'

// Multi-use 'account selector' component will have a data context
// Dummy data
// const UserAssets: UserAssetType[] = [
//   { _id: '1', free: 99, frozen: 11, locked: 21, asset: 'BNB-JST', name: 'Binance', value: 0.99 },
//   { _id: '2', free: 1034, frozen: 38, locked: 101, asset: 'RUNE-1E0', name: 'Rune', value: 0.25 }
// ]

type Props = {
  asset: Asset
  assets: Asset[]
  onChange?: (asset: Asset) => {}
  size?: CoinSize
}

const AccountSelector: React.FC<Props> = (props: Props): JSX.Element => {
  const { asset, assets, onChange = (_) => {}, size = 'normal' } = props

  const menu = useCallback(
    () => (
      <Menu>
        {assets.map((asset, i: number) => (
          <Menu.Item key={i} onClick={() => onChange(asset)}>
            <div style={{ display: 'flex' }}>
              <div>{asset?.symbol ?? 'unknown'}</div>&nbsp;
              <div>NAME..</div>&nbsp;
              <div style={{ marginLeft: 'auto' }}>($ 8.50)</div>
            </div>
          </Menu.Item>
        ))}
      </Menu>
    ),
    [assets, onChange]
  )
  return (
    <StyledCard bordered={false}>
      <AssetWrapper>
        <div>
          <AssetIcon asset={asset} size={size} />
        </div>
        <AssetInfoWrapper>
          <AssetTitle>{asset?.symbol ?? 'unknown'}</AssetTitle>

          <Dropdown overlay={menu} trigger={['click']}>
            <Label textTransform="uppercase" color="primary" size="big">
              Change
            </Label>
          </Dropdown>
        </AssetInfoWrapper>
      </AssetWrapper>
    </StyledCard>
  )
}

export default AccountSelector
