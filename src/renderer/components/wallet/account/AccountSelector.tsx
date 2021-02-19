import React, { useCallback, useMemo } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset, formatAssetAmountCurrency, baseToAsset } from '@xchainjs/xchain-util'
import { Menu, Dropdown, Row, Col } from 'antd'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { WalletBalances } from '../../../services/clients'
import { AssetIcon } from '../../uielements/assets/assetIcon'
import { Size as IconSize } from '../../uielements/assets/assetIcon/AssetIcon.types'
import * as Styled from './AccountSelector.style'

type Props = {
  selectedAsset: Asset
  walletBalances: WalletBalances
  onChange?: (asset: Asset, walletAddress: Address) => void
  size?: IconSize
  network: Network
}

export const AccountSelector: React.FC<Props> = (props): JSX.Element => {
  const { selectedAsset, walletBalances, onChange = (_) => {}, size = 'normal', network } = props

  const intl = useIntl()

  const filteredWalletBalances = useMemo(
    () => walletBalances.filter(({ asset }) => asset.symbol !== selectedAsset.symbol),
    [walletBalances, selectedAsset]
  )
  const enableDropdown = filteredWalletBalances.length > 0

  const menu = useCallback(
    () => (
      <Menu>
        {filteredWalletBalances.map((walletBalance, i: number) => {
          const { asset, amount, walletAddress } = walletBalance
          return (
            <Menu.Item key={i} onClick={() => onChange(asset, walletAddress)}>
              <Row align={'middle'} gutter={[8, 0]}>
                <Col>
                  <AssetIcon asset={asset} size={'small'} network={network} />
                </Col>
                <Col>{asset.symbol} </Col>
                <Col>{formatAssetAmountCurrency({ amount: baseToAsset(amount), asset })}</Col>
              </Row>
            </Menu.Item>
          )
        })}
      </Menu>
    ),
    [filteredWalletBalances, onChange, network]
  )

  return (
    <Styled.Card bordered={false}>
      <Styled.AssetWrapper>
        <div>
          <AssetIcon asset={selectedAsset} size={size} network={network} />
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
