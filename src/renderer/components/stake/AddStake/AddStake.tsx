import React, { useCallback, useMemo, useState } from 'react'

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
  const [stakeAmount, setStakeAmount] = useState(baseAmount(0))

  const assetSelect = useMemo(() => {
    const res = stakeAmount
      .amount()
      .multipliedBy(assetAmount.amount())
      .dividedBy(stakeAmount.amount().plus(runeAmount.amount()))

    return baseAmount(res)
  }, [stakeAmount, assetAmount, runeAmount])

  const onRuneChange = useCallback(
    (val: BigNumber) => {
      setStakeAmount(baseAmount(val))
    },
    [setStakeAmount]
  )

  const onAssetChange = useCallback(
    (val: BigNumber) => {
      const targetAssetAmount = val.multipliedBy(runeAmount.amount()).dividedBy(assetAmount.amount().minus(val))
      setStakeAmount(baseAmount(targetAssetAmount))
    },
    [runeAmount, assetAmount]
  )

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
          selectedAmount={stakeAmount}
          onChange={onRuneChange}
          price={runePrice}
          withPercentSlider
        />

        <Styled.AssetCard
          asset={asset}
          amount={assetAmount}
          selectedAmount={assetSelect}
          onChange={onAssetChange}
          price={assetPrice}
        />
      </Styled.InputsWrapper>

      <Drag title={'drag'} source={runeAsset} target={asset} />
    </Styled.Container>
  )
}
