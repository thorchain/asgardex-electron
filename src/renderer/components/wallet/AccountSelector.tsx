import React, { useCallback, useMemo } from 'react'

import { Asset, assetToString, formatAssetAmountCurrency, baseToAsset } from '@thorchain/asgardex-util'
import { Menu, Dropdown, Row, Col } from 'antd'
import { useIntl } from 'react-intl'

import { AssetsWithBalance } from '../../services/wallet/types'
import AssetIcon from '../uielements/assets/assetIcon'
import { Size as CoinSize } from '../uielements/assets/assetIcon/types'
import * as Styled from './AccountSelector.style'

type Props = {
  selectedAsset: Asset
  assets: AssetsWithBalance
  onChange?: (asset: Asset) => void
  size?: CoinSize
}

const AccountSelector: React.FC<Props> = (props: Props): JSX.Element => {
  const { selectedAsset, assets, onChange = (_) => {}, size = 'normal' } = props

  const intl = useIntl()

  const filteredAssets = useMemo(() => assets.filter(({ asset }) => asset.symbol !== selectedAsset.symbol), [
    assets,
    selectedAsset
  ])
  const enableDropdown = filteredAssets.length > 0

  const menu = useCallback(
    () => (
      <Menu>
        {filteredAssets.map((assetWB, i: number) => {
          const { asset, amount } = assetWB
          return (
            <Menu.Item key={i} onClick={() => onChange(asset)}>
              <Row align={'middle'} gutter={[8, 0]}>
                <Col>
                  <AssetIcon asset={asset} size={'small'} />
                </Col>
                <Col>{asset.symbol} </Col>
                <Col>{formatAssetAmountCurrency(baseToAsset(amount), assetToString(asset))}</Col>
              </Row>
            </Menu.Item>
          )
        })}
      </Menu>
    ),
    [filteredAssets, onChange]
  )

  return (
    <Styled.Card bordered={false}>
      <Styled.AssetWrapper>
        <div>
          <AssetIcon asset={selectedAsset} size={size} />
        </div>
        <Styled.AssetInfoWrapper>
          <Styled.AssetTitle>{selectedAsset.symbol}</Styled.AssetTitle>

          {enableDropdown && (
            <Dropdown overlay={menu} trigger={['click']}>
              {/* Important note:
                  Label has to be wrapped into a `div` to avoid error render messages
                  such as "Function components cannot be given refs"
              */}
              <div>
                <Styled.Label>{intl.formatMessage({ id: 'common.change' })}</Styled.Label>
              </div>
            </Dropdown>
          )}
        </Styled.AssetInfoWrapper>
      </Styled.AssetWrapper>
    </Styled.Card>
  )
}

export default AccountSelector
