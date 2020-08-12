import React, { useCallback } from 'react'

import { Asset, assetToString, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import { Menu, Dropdown } from 'antd'
import { useIntl } from 'react-intl'

import { AssetWithBalance } from '../../types/asgardex'
import AssetIcon from '../uielements/assets/assetIcon'
import { Size as CoinSize } from '../uielements/assets/assetIcon/types'
import Label from '../uielements/label'
import { StyledCard, AssetWrapper, AssetInfoWrapper, AssetTitle } from './AccountSelector.style'

type Props = {
  selectedAsset: Asset
  assets: AssetWithBalance[]
  onChange?: (asset: AssetWithBalance) => void
  size?: CoinSize
}

const AccountSelector: React.FC<Props> = (props: Props): JSX.Element => {
  const { selectedAsset, assets, onChange = (_) => {}, size = 'normal' } = props

  const intl = useIntl()

  const menu = useCallback(
    () => (
      <Menu>
        {assets
          .filter(({ asset }) => asset.symbol !== selectedAsset.symbol)
          .map((assetWB, i: number) => {
            const { asset, balance } = assetWB
            return (
              <Menu.Item key={i} onClick={() => onChange(assetWB)}>
                <div style={{ display: 'flex' }}>
                  <div>{asset.symbol} </div>
                  <div style={{ marginLeft: 'auto' }}>{formatAssetAmountCurrency(balance, assetToString(asset))}</div>
                </div>
              </Menu.Item>
            )
          })}
      </Menu>
    ),
    [selectedAsset, assets, onChange]
  )

  return (
    <StyledCard bordered={false}>
      <AssetWrapper>
        <div>
          <AssetIcon asset={selectedAsset} size={size} />
        </div>
        <AssetInfoWrapper>
          <AssetTitle>{selectedAsset.symbol}</AssetTitle>

          <Dropdown overlay={menu} trigger={['click']}>
            <Label textTransform="uppercase" color="primary" size="big">
              {intl.formatMessage({ id: 'common.change' })}
            </Label>
          </Dropdown>
        </AssetInfoWrapper>
      </AssetWrapper>
    </StyledCard>
  )
}

export default AccountSelector
