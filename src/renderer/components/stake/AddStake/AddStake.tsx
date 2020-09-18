import React, { useCallback, useMemo, useState } from 'react'

import { Asset, assetAmount, assetToBase, BaseAmount, baseAmount } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { PriceDataIndex } from '../../../services/midgard/types'
import { AssetPair } from '../../../types/asgardex'
import Drag from '../../uielements/drag'
import * as Styled from './AddStake.style'

type Props = {
  asset: Asset
  runeAsset: Asset
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
  assetAmount: assetAmountProp,
  runeAmount,
  className,
  assetData,
  unit,
  onStake
}) => {
  const intl = useIntl()
  /**
   * Hold stakeAmount as amount of runes to stake
   */
  const [stakeAmount, setStakeAmount] = useState(baseAmount(0))

  const assetSelect = useMemo(() => {
    const stakeAmountValue = stakeAmount.amount()

    /**
     * formula z = (x * Y) / (x + X)
     * z = value of Asset
     * x = input value of RUNE
     * Y = amount of Asset in the pool
     * X = amount of RUNE in the pool
     */
    const res = stakeAmountValue
      .times(assetAmountProp.amount())
      .div(stakeAmountValue.plus(runeAmount.amount()))
      /**
       * convert with a ration assetPrice / runePrice
       * to get value from RUNE to asset
       */
      .div(assetPrice)
      .times(runePrice)

    return baseAmount(res)
  }, [stakeAmount, assetAmountProp, runeAmount, assetPrice, runePrice])

  const onRuneChange = useCallback(
    (runeInput: BigNumber) => {
      setStakeAmount(assetToBase(assetAmount(runeInput)))
    },
    [setStakeAmount]
  )

  const onAssetChange = useCallback(
    (assetInput: BigNumber) => {
      /**
       * Convert Asset value to the RUNE based BaseAmount with
       * assetPrice / runePrice - ratio to convert from asset to RUNE
       */
      const z = assetToBase(assetAmount(assetInput.div(runePrice).times(assetPrice)))

      /**
       * @note this formula is a result of formula for the assetSelect
       *       and this is just a `reversed` value
       * formula x = (z * X) / (Y - z)
       * z = input value of Asset
       * x = value of RUNE
       * Y = amount of Asset in the pool
       * X = amount of RUNE in the pool
       */
      const x = baseAmount(
        z.amount().multipliedBy(runeAmount.amount()).dividedBy(assetAmountProp.amount().minus(z.amount()))
      )
      setStakeAmount(x)
    },
    [assetPrice, runePrice, setStakeAmount, runeAmount, assetAmountProp]
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
          unit={unit}
        />

        <Styled.AssetCard
          asset={asset}
          amount={assetAmountProp}
          selectedAmount={assetSelect}
          onChange={onAssetChange}
          price={assetPrice}
          assetData={assetData}
          unit={unit}
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
