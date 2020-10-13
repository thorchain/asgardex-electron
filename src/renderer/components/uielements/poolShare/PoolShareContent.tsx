import React from 'react'

import { Asset, BaseAmount, baseToAsset, formatAssetAmount, formatAssetAmountCurrency } from '@thorchain/asgardex-util'

import { BTC_DECIMAL, isBtcAsset } from '../../../helpers/assetHelper'
import * as Styled from './PoolShareCard.style'

type Props = {
  sourceAsset: Asset
  targetAsset: Asset
  runeAmount: BaseAmount
  runePrice: BaseAmount
  assetAmount: BaseAmount
  assetPrice: BaseAmount
  priceAsset: Asset
  loading?: boolean
}

const PoolShareContent: React.FC<Props> = (props) => {
  const {
    loading = false,
    sourceAsset,
    targetAsset,
    runeAmount,
    runePrice,
    assetAmount,
    assetPrice,
    priceAsset
  } = props
  return (
    <>
      <Styled.PoolCardRow>
        <Styled.ValuesWrapper loading={`${loading}`}>
          <Styled.AssetName>{sourceAsset.ticker}</Styled.AssetName>
          <Styled.ValueLabel loading={loading}>
            {formatAssetAmount({ amount: baseToAsset(runeAmount), decimal: 2 })}
          </Styled.ValueLabel>
          <Styled.ValueSubLabel loading={loading}>
            {formatAssetAmountCurrency({ amount: baseToAsset(runePrice), asset: priceAsset, decimal: 2 })}
          </Styled.ValueSubLabel>
        </Styled.ValuesWrapper>
        <Styled.ValuesWrapper loading={`${loading}`}>
          <Styled.AssetName loading={loading}>{targetAsset.ticker}</Styled.AssetName>
          <Styled.ValueLabel loading={loading}>
            {formatAssetAmount({ amount: baseToAsset(assetAmount), trimZeros: true })}
          </Styled.ValueLabel>
          <Styled.ValueSubLabel align="center" size="normal" color="light" loading={loading}>
            {formatAssetAmountCurrency({
              amount: baseToAsset(assetPrice),
              asset: priceAsset,
              // special case for BTC
              decimal: isBtcAsset(sourceAsset) ? BTC_DECIMAL : 2
            })}
          </Styled.ValueSubLabel>
        </Styled.ValuesWrapper>
      </Styled.PoolCardRow>
    </>
  )
}

export default PoolShareContent
