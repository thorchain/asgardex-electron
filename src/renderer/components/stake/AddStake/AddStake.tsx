import React, { useCallback, useMemo, useState } from 'react'

import { Asset, BaseAmount, baseAmount } from '@thorchain/asgardex-util'
import { useIntl } from 'react-intl'

import { PriceDataIndex } from '../../../services/midgard/types'
import { AssetPair } from '../../../types/asgardex'
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
  assetData?: AssetPair[]
  className?: string
  onStake: (stakeAmount: BigNumber, asset: Asset) => void
}

export const AddStake: React.FC<Props> = ({
  asset,
  runeAsset,
  assetPrice,
  runePrice,
  assetAmount,
  runeAmount,
  className,
  assetData,
  onStake
  // priceIndex,
  // unit,
}) => {
  const intl = useIntl()
  /**
   * Hold stakeAmount as amount of runes to stake
   */
  const [stakeAmount, setStakeAmount] = useState(baseAmount(0))

  const assetSelect = useMemo(() => {
    const stakeAmountValue = stakeAmount.amount()

    /**
     * r = stakeAmount * assetAmount / (stakeAmount + runeAmount)
     */
    const res = stakeAmountValue
      .times(assetAmount.amount())
      .div(stakeAmountValue.plus(runeAmount.amount()))
      /**
       * convert with a ration assetPrice / runePrice
       * to get value from RUNE to asset
       */
      .div(assetPrice)
      .times(runePrice)

    return baseAmount(res)
  }, [stakeAmount, assetAmount, runeAmount, assetPrice, runePrice])

  const onRuneChange = useCallback(
    (runeInput: BigNumber) => {
      setStakeAmount(baseAmount(runeInput))
    },
    [setStakeAmount]
  )

  const onAssetChange = useCallback(
    (assetInput: BigNumber) => {
      /**
       * Convert Asset value to the RUNEs with
       * assetPrice / runePrice - ratio to convert from asset to RUNE
       */
      const targetRes = baseAmount(assetInput.times(assetPrice.div(runePrice)))
      setStakeAmount(targetRes)
    },
    [assetPrice, runePrice, setStakeAmount]
  )

  const onStakeConfirmed = useCallback(() => {
    onStake(stakeAmount.amount(), asset)
  }, [stakeAmount, asset, onStake])

  return (
    <Styled.Container className={className}>
      <Styled.InputsWrapper>
        <Styled.AssetCard
          asset={runeAsset}
          amount={runeAmount}
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
          assetData={assetData}
        />
      </Styled.InputsWrapper>

      <Drag
        title={intl.formatMessage({ id: 'stake.drag' })}
        source={runeAsset}
        target={asset}
        onConfirm={onStakeConfirmed}
      />
    </Styled.Container>
  )
}
