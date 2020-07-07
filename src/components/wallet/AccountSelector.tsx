import React, { useState, useEffect, useCallback } from 'react'

import { Menu, Dropdown } from 'antd'

import Label from '../../components/uielements/label'
import { shortSymbol } from '../../helpers/tokenHelpers'
import { UserAssetType } from '../../types/wallet'
import DynamicCoin from '../shared/icons/DynamicCoin'
import { StyledCard, AssetWrapper, AssetInfoWrapper, AssetTitle } from './AccountSelector.style'

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

  const menu = useCallback(
    () => (
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
    ),
    []
  )
  return (
    <StyledCard bordered={false}>
      <AssetWrapper>
        <div>
          <DynamicCoin type={symb} size={size || 'xbig'} />
        </div>
        <AssetInfoWrapper>
          <AssetTitle>{shortSymbol(symb)}</AssetTitle>

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
