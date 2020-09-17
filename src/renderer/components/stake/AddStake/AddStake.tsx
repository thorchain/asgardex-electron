import React, { useCallback, useState } from 'react'

import { Asset, baseAmount, BaseAmount } from '@thorchain/asgardex-util'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { ONE_ASSET_BASE_AMOUNT } from '../../../const'
import { PriceDataIndex } from '../../../services/midgard/types'
import { RUNEAsset } from '../../../views/pools/types'
import BigNumber from '../../uielements/assets/assetCard/AssetCard'
import Drag from '../../uielements/drag'
import * as Styled from './AddStake.style'

type Props = {
  asset: Asset
  runeAsset: RUNEAsset
  assetPrice: BigNumber
  runePrice: BigNumber
  assetAmount: BaseAmount
  runeAmount: BaseAmount
  priceIndex?: PriceDataIndex
  unit?: string
  className?: string
}

export const AddStake: React.FC<Props> = ({
  asset,
  runeAsset,
  assetPrice,
  runePrice,
  assetAmount,
  runeAmount,
  className
  // priceIndex,
  // unit,
}) => {
  const [selectedRuneAmount, setSelectedRuneAmount] = useState(baseAmount(0))
  const [selectedAssetAmount, setSelectedAssetAmount] = useState(baseAmount(0))

  const onRuneAmountChange = useCallback((value: BigNumber) => setSelectedRuneAmount(baseAmount(value)), [
    setSelectedRuneAmount
  ])
  const onAssetAmountChange = useCallback((value: BigNumber) => setSelectedAssetAmount(baseAmount(value)), [
    setSelectedAssetAmount
  ])

  return (
    <Styled.Container className={className}>
      <Styled.InputsWrapper>
        <Styled.AssetCard
          asset={runeAsset}
          amount={runeAmount}
          assetData={[
            {
              asset: ASSETS_MAINNET.BNB,
              price: ONE_ASSET_BASE_AMOUNT
            },
            {
              asset: ASSETS_MAINNET.TOMO,
              price: ONE_ASSET_BASE_AMOUNT
            }
          ]}
          selectedAmount={selectedRuneAmount}
          onChange={onRuneAmountChange}
          price={runePrice}
          withPercentSlider
        />

        <Styled.AssetCard
          asset={asset}
          amount={assetAmount}
          selectedAmount={selectedAssetAmount}
          onChange={onAssetAmountChange}
          price={assetPrice}
        />
      </Styled.InputsWrapper>

      <Drag title={'drag'} source={runeAsset} target={asset} />
    </Styled.Container>
  )
}
